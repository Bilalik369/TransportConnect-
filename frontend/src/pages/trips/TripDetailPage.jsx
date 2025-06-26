import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Star } from "lucide-react"
import { tripsAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import Button from "../../components/ui/Button"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import toast from "react-hot-toast"
import Card from "../../components/ui/Card"

const TripDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: tripData, isLoading } = useQuery(["trip", id], () => tripsAPI.getTripById(id))

  const deleteTripMutation = useMutation(tripsAPI.deleteTrip, {
    onSuccess: () => {
      queryClient.invalidateQueries("trips")
      toast.success("Trajet supprimé avec succès")
      navigate("/trips")
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression")
    },
  })

  const completeTripMutation = useMutation(tripsAPI.completeTrip, {
    onSuccess: () => {
      queryClient.invalidateQueries(["trip", id])
      toast.success("Trajet marqué comme terminé")
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors de la finalisation")
    },
  })

  const handleDeleteTrip = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce trajet ?")) {
      deleteTripMutation.mutate(id)
    }
  }

  const handleCompleteTrip = () => {
    if (window.confirm("Êtes-vous sûr de vouloir marquer ce trajet comme terminé ?")) {
      completeTripMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!tripData?.data?.trip) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Trajet non trouvé</h1>
        <Button onClick={() => navigate("/trips")}>Retour aux trajets</Button>
      </div>
    )
  }

  const trip = tripData.data.trip
  const isOwner = user?.id === trip.driver._id

  return (
    <div className="p-6 max-w-6xl mx-auto">
 
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              {trip.departure.city} → {trip.destination.city}
            </h1>
            <p className="text-text-secondary mt-1">
              Départ le {new Date(trip.departureDate).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isOwner && trip.status === "active" && (
            <>
              <Button variant="outline" onClick={handleCompleteTrip} loading={completeTripMutation.isLoading}>
                Marquer comme terminé
              </Button>
              <Button variant="danger" onClick={handleDeleteTrip} loading={deleteTripMutation.isLoading}>
                Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Itinéraire</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-text-primary">Départ</h3>
                <p className="text-text-secondary">
                  {trip.departure.address}, {trip.departure.city}
                </p>
                <p className="text-sm text-text-secondary">{new Date(trip.departureDate).toLocaleString("fr-FR")}</p>
              </div>
              <div>
                <h3 className="font-medium text-text-primary">Destination</h3>
                <p className="text-text-secondary">
                  {trip.destination.address}, {trip.destination.city}
                </p>
                <p className="text-sm text-text-secondary">{new Date(trip.arrivalDate).toLocaleString("fr-FR")}</p>
              </div>
            </div>
          </Card>

          
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Capacité et tarification</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-text-primary mb-2">Capacité disponible</h3>
                <p className="text-2xl font-bold text-primary">{trip.availableCapacity.weight} kg</p>
                <p className="text-sm text-text-secondary">
                  Dimensions: {trip.availableCapacity.dimensions.length} × {trip.availableCapacity.dimensions.width} ×{" "}
                  {trip.availableCapacity.dimensions.height} cm
                </p>
              </div>
              <div>
                <h3 className="font-medium text-text-primary mb-2">Prix</h3>
                <p className="text-2xl font-bold text-primary">{trip.pricePerKg}DH/kg</p>
              </div>
            </div>
          </Card>

      
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Types de cargaison acceptés</h2>
            <div className="flex flex-wrap gap-2">
              {trip.acceptedCargoTypes.map((type) => (
                <span key={type} className="px-3 py-1 bg-input-background text-text-primary rounded-lg text-sm">
                  {type}
                </span>
              ))}
            </div>
          </Card>

         
          {trip.description && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Description</h2>
              <p className="text-text-secondary">{trip.description}</p>
            </Card>
          )}

          
          {isOwner && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Demandes reçues ({trip.requests?.length || 0})
              </h2>
              {trip.requests?.length > 0 ? (
                <div className="space-y-4">
                  {trip.requests.map((request) => (
                    <div key={request._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-text-primary">
                          {request.sender.firstName} {request.sender.lastName}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            request.status === "pending"
                              ? "bg-warning bg-opacity-20 text-warning"
                              : request.status === "accepted"
                                ? "bg-success bg-opacity-20 text-success"
                                : "bg-error bg-opacity-20 text-error"
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mb-2">{request.cargo.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">
                          {request.cargo.weight}kg - {request.price}DH
                        </span>
                        <Link to={`/requests/${request._id}`}>
                          <Button size="small" variant="outline">
                            Voir détails
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary">Aucune demande reçue pour ce trajet.</p>
              )}
            </Card>
          )}
        </div>

       
        <div className="space-y-6">
         
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Conducteur</h2>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">{trip.driver.firstName.charAt(0)}</span>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">
                  {trip.driver.firstName} {trip.driver.lastName}
                </h3>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-warning fill-current" />
                  <span className="text-sm text-text-secondary">
                    {trip.driver.stats.averageRating.toFixed(1)} ({trip.driver.stats.totalRatings} avis)
                  </span>
                </div>
                {trip.driver.isVerified && <span className="text-xs text-success">✓ Profil vérifié</span>}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Trajets effectués:</span>
                <span className="text-text-primary">{trip.driver.stats.totalTrips}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Membre depuis:</span>
                <span className="text-text-primary">{new Date(trip.driver.createdAt).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>

            {!isOwner && trip.status === "active" && (
              <Link to={`/requests/create/${trip._id}`} className="block mt-4">
                <Button className="w-full">Faire une demande</Button>
              </Link>
            )}
          </Card>

    
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Statistiques</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Statut:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    trip.status === "active"
                      ? "bg-success bg-opacity-20 text-success"
                      : trip.status === "completed"
                        ? "bg-info bg-opacity-20 text-info"
                        : "bg-error bg-opacity-20 text-error"
                  }`}
                >
                  {trip.status === "active" ? "Actif" : trip.status === "completed" ? "Terminé" : "Annulé"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Demandes reçues:</span>
                <span className="text-text-primary">{trip.requests?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Demandes acceptées:</span>
                <span className="text-text-primary">{trip.acceptedRequests?.length || 0}</span>
              </div>
              {isOwner && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Gains totaux:</span>
                  <span className="text-text-primary font-semibold">{trip.totalEarnings || 0}DH</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TripDetailPage
