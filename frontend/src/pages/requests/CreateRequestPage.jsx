import { useParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { ArrowLeft, Package, MapPin, User, Euro } from "lucide-react"
import { tripsAPI, requestsAPI } from "../../services/api"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import Card from "../../components/ui/Card"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import { CARGO_TYPES } from "../../config/constants"
import toast from "react-hot-toast"

const CreateRequestPage = () => {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: tripData, isLoading: tripLoading } = useQuery(["trip", tripId], () => tripsAPI.getTripById(tripId), {
    enabled: !!tripId,
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const createRequestMutation = useMutation(requestsAPI.createRequest, {
    onSuccess: () => {
      queryClient.invalidateQueries("requests")
      toast.success("Demande créée avec succès !")
      navigate("/requests")
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors de la création de la demande")
    },
  })

  const watchedWeight = watch("weight")
  const trip = tripData?.data?.trip

  const estimatedPrice = watchedWeight && trip ? (Number.parseFloat(watchedWeight) * trip.pricePerKg).toFixed(2) : 0

  const onSubmit = async (data) => {
    const requestData = {
      tripId,
      cargo: {
        description: data.description,
        weight: Number.parseFloat(data.weight),
        dimensions: {
          length: Number.parseFloat(data.length),
          width: Number.parseFloat(data.width),
          height: Number.parseFloat(data.height),
        },
        type: data.cargoType,
        value: data.value ? Number.parseFloat(data.value) : undefined,
      },
      pickup: {
        address: data.pickupAddress,
        city: data.pickupCity,
        contactPerson: {
          name: data.pickupContactName,
          phone: data.pickupContactPhone,
        },
      },
      delivery: {
        address: data.deliveryAddress,
        city: data.deliveryCity,
        contactPerson: {
          name: data.deliveryContactName,
          phone: data.deliveryContactPhone,
        },
      },
      message: data.message,
    }

    createRequestMutation.mutate(requestData)
  }

  if (tripLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Trajet non trouvé</h1>
        <Button onClick={() => navigate("/trips")}>Retour aux trajets</Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Nouvelle demande de transport</h1>
          <p className="text-text-secondary mt-1">
            Pour le trajet {trip.departure.city} → {trip.destination.city}
          </p>
        </div>
      </div>

      {/* Trip Summary */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Résumé du trajet</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium text-text-primary">Itinéraire</h3>
            <p className="text-text-secondary">
              {trip.departure.city} → {trip.destination.city}
            </p>
          </div>
          <div>
            <h3 className="font-medium text-text-primary">Départ</h3>
            <p className="text-text-secondary">{new Date(trip.departureDate).toLocaleDateString("fr-FR")}</p>
          </div>
          <div>
            <h3 className="font-medium text-text-primary">Prix</h3>
            <p className="text-primary font-semibold">{trip.pricePerKg}DH/kg</p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Cargo Information */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <Package className="w-6 h-6 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-text-primary">Informations du colis</h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Description du colis"
              placeholder="Ordinateurs portables, documents, etc."
              error={errors.description?.message}
              {...register("description", {
                required: "La description est requise",
                minLength: { value: 10, message: "La description doit contenir au moins 10 caractères" },
              })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Type de cargaison</label>
                <select
                  className="input-field"
                  {...register("cargoType", { required: "Le type de cargaison est requis" })}
                >
                  <option value="">Sélectionner un type</option>
                  {CARGO_TYPES.filter((type) => trip.acceptedCargoTypes.includes(type.value)).map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.cargoType && <p className="text-sm text-error mt-1">{errors.cargoType.message}</p>}
              </div>

              <Input
                label="Poids (kg)"
                type="number"
                step="0.1"
                placeholder="25.5"
                error={errors.weight?.message}
                {...register("weight", {
                  required: "Le poids est requis",
                  min: { value: 0.1, message: "Le poids doit être supérieur à 0" },
                  max: {
                    value: trip.availableCapacity.weight,
                    message: `Le poids ne peut pas dépasser ${trip.availableCapacity.weight}kg`,
                  },
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">Dimensions (cm)</label>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="Longueur"
                  type="number"
                  error={errors.length?.message}
                  {...register("length", {
                    required: "La longueur est requise",
                    min: { value: 1, message: "La longueur doit être supérieure à 0" },
                  })}
                />
                <Input
                  placeholder="Largeur"
                  type="number"
                  error={errors.width?.message}
                  {...register("width", {
                    required: "La largeur est requise",
                    min: { value: 1, message: "La largeur doit être supérieure à 0" },
                  })}
                />
                <Input
                  placeholder="Hauteur"
                  type="number"
                  error={errors.height?.message}
                  {...register("height", {
                    required: "La hauteur est requise",
                    min: { value: 1, message: "La hauteur doit être supérieure à 0" },
                  })}
                />
              </div>
            </div>

            <Input
              label="Valeur déclarée (DH) - Optionnel"
              type="number"
              step="0.01"
              placeholder="500.00"
              error={errors.value?.message}
              {...register("value", {
                min: { value: 0, message: "La valeur ne peut pas être négative" },
              })}
            />
          </div>
        </Card>

        
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <MapPin className="w-6 h-6 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-text-primary">Informations de collecte</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ville de collecte"
              placeholder="Paris"
              error={errors.pickupCity?.message}
              {...register("pickupCity", { required: "La ville de collecte est requise" })}
            />

            <Input
              label="Adresse de collecte"
              placeholder="123 Rue de la Paix"
              error={errors.pickupAddress?.message}
              {...register("pickupAddress", { required: "L'adresse de collecte est requise" })}
            />

            <Input
              label="Nom du contact"
              placeholder="Jean Dupont"
              error={errors.pickupContactName?.message}
              {...register("pickupContactName")}
            />

            <Input
              label="Téléphone du contact"
              placeholder="0123456789"
              error={errors.pickupContactPhone?.message}
              {...register("pickupContactPhone")}
            />
          </div>
        </Card>

        
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <MapPin className="w-6 h-6 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-text-primary">Informations de livraison</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ville de livraison"
              placeholder="Lyon"
              error={errors.deliveryCity?.message}
              {...register("deliveryCity", { required: "La ville de livraison est requise" })}
            />

            <Input
              label="Adresse de livraison"
              placeholder="456 Avenue de la République"
              error={errors.deliveryAddress?.message}
              {...register("deliveryAddress", { required: "L'adresse de livraison est requise" })}
            />

            <Input
              label="Nom du contact"
              placeholder="Marie Martin"
              error={errors.deliveryContactName?.message}
              {...register("deliveryContactName")}
            />

            <Input
              label="Téléphone du contact"
              placeholder="0987654321"
              error={errors.deliveryContactPhone?.message}
              {...register("deliveryContactPhone")}
            />
          </div>
        </Card>

     
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <User className="w-6 h-6 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-text-primary">Message au conducteur</h2>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text-primary">Message (optionnel)</label>
            <textarea
              className="input-field min-h-[100px] resize-none"
              placeholder="Informations supplémentaires pour le conducteur..."
              {...register("message")}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center mb-6">
            <Euro className="w-6 h-6 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-text-primary">Résumé des coûts</h2>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-text-secondary">Poids:</span>
              <span className="text-text-primary">{watchedWeight || 0} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Prix par kg:</span>
              <span className="text-text-primary">{trip.pricePerKg}DH</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold text-text-primary">Total estimé:</span>
              <span className="font-bold text-primary text-xl">{estimatedPrice}DH</span>
            </div>
          </div>
        </Card>

       
        <div className="flex items-center justify-end space-x-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Annuler
          </Button>
          <Button type="submit" loading={createRequestMutation.isLoading}>
            Envoyer la demande
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateRequestPage
