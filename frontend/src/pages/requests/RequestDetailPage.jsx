"use client"

import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { ArrowLeft, Package, MapPin, Clock, CheckCircle, XCircle, MessageCircle } from "lucide-react"
import { requestsAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import toast from "react-hot-toast"

const RequestDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: requestData, isLoading } = useQuery(["request", id], () => requestsAPI.getRequestById(id), {
    enabled: !!id,
  })

  const acceptRequestMutation = useMutation(({ id, message }) => requestsAPI.acceptRequest(id, message), {
    onSuccess: () => {
      queryClient.invalidateQueries(["request", id])
      toast.success("Demande acceptée avec succès")
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'acceptation")
    },
  })

  const rejectRequestMutation = useMutation(({ id, message }) => requestsAPI.rejectRequest(id, message), {
    onSuccess: () => {
      queryClient.invalidateQueries(["request", id])
      toast.success("Demande refusée")
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors du refus")
    },
  })

  const cancelRequestMutation = useMutation(requestsAPI.cancelRequest, {
    onSuccess: () => {
      queryClient.invalidateQueries(["request", id])
      toast.success("Demande annulée")
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'annulation")
    },
  })

  const confirmPickupMutation = useMutation(requestsAPI.confirmPickup, {
    onSuccess: () => {
      queryClient.invalidateQueries(["request", id])
      toast.success("Collecte confirmée")
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors de la confirmation")
    },
  })

  const confirmDeliveryMutation = useMutation(({ id, signature }) => requestsAPI.confirmDelivery(id, signature), {
    onSuccess: () => {
      queryClient.invalidateQueries(["request", id])
      toast.success("Livraison confirmée")
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors de la confirmation")
    },
  })

  const handleAcceptRequest = () => {
    const message = prompt("Message d'acceptation (optionnel):")
    acceptRequestMutation.mutate({ id, message: message || "" })
  }

  const handleRejectRequest = () => {
    const message = prompt("Raison du refus (optionnel):")
    if (message !== null) {
      rejectRequestMutation.mutate({ id, message: message || "" })
    }
  }

  const handleCancelRequest = () => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler cette demande ?")) {
      cancelRequestMutation.mutate(id)
    }
  }

  const handleConfirmPickup = () => {
    if (window.confirm("Confirmer la collecte du colis ?")) {
      confirmPickupMutation.mutate(id)
    }
  }

  const handleConfirmDelivery = () => {
    const signature = prompt("Signature du destinataire (optionnel):")
    if (signature !== null) {
      confirmDeliveryMutation.mutate({ id, signature: signature || "" })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!requestData?.data?.request) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Demande non trouvée</h1>
        <Button onClick={() => navigate("/requests")}>Retour aux demandes</Button>
      </div>
    )
  }

  const request = requestData.data.request
  const isDriver = user?.role === "conducteur" && user?.id === request.trip?.driver?._id
  const isSender = user?.id === request.sender?._id

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-warning" />
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-success" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-error" />
      case "in_transit":
        return <Package className="w-5 h-5 text-info" />
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-success" />
      case "cancelled":
        return <XCircle className="w-5 h-5 text-error" />
      default:
        return <Package className="w-5 h-5 text-text-secondary" />
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "En attente"
      case "accepted":
        return "Acceptée"
      case "rejected":
        return "Refusée"
      case "in_transit":
        return "En transit"
      case "delivered":
        return "Livrée"
      case "cancelled":
        return "Annulée"
      default:
        return status
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Détails de la demande</h1>
            <p className="text-text-secondary mt-1">
              Créée le {new Date(request.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {getStatusIcon(request.status)}
          <span className="text-lg font-semibold text-text-primary">{getStatusLabel(request.status)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cargo Information */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Package className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-xl font-semibold text-text-primary">Informations du colis</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-text-primary">Description</h3>
                <p className="text-text-secondary">{request.cargo.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <h3 className="font-medium text-text-primary">Type</h3>
                  <p className="text-text-secondary capitalize">{request.cargo.type}</p>
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Poids</h3>
                  <p className="text-text-secondary">{request.cargo.weight} kg</p>
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Dimensions</h3>
                  <p className="text-text-secondary">
                    {request.cargo.dimensions.length} × {request.cargo.dimensions.width} ×{" "}
                    {request.cargo.dimensions.height} cm
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Prix</h3>
                  <p className="text-primary font-semibold text-lg">{request.price}DH</p>
                </div>
              </div>

              {request.cargo.value && (
                <div>
                  <h3 className="font-medium text-text-primary">Valeur déclarée</h3>
                  <p className="text-text-secondary">{request.cargo.value}DH</p>
                </div>
              )}
            </div>
          </Card>

          
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <MapPin className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-xl font-semibold text-text-primary">Adresses</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-text-primary mb-2">Collecte</h3>
                <p className="text-text-secondary">{request.pickup.address}</p>
                <p className="text-text-secondary">{request.pickup.city}</p>
                {request.pickup.contactPerson?.name && (
                  <div className="mt-2">
                    <p className="text-sm text-text-secondary">Contact: {request.pickup.contactPerson.name}</p>
                    {request.pickup.contactPerson.phone && (
                      <p className="text-sm text-text-secondary">Tél: {request.pickup.contactPerson.phone}</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium text-text-primary mb-2">Livraison</h3>
                <p className="text-text-secondary">{request.delivery.address}</p>
                <p className="text-text-secondary">{request.delivery.city}</p>
                {request.delivery.contactPerson?.name && (
                  <div className="mt-2">
                    <p className="text-sm text-text-secondary">Contact: {request.delivery.contactPerson.name}</p>
                    {request.delivery.contactPerson.phone && (
                      <p className="text-sm text-text-secondary">Tél: {request.delivery.contactPerson.phone}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

         
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Trajet associé</h2>
            <div className="space-y-2">
              <p className="text-text-secondary">
                <span className="font-medium">Itinéraire:</span> {request.trip?.departure?.city} →{" "}
                {request.trip?.destination?.city}
              </p>
              <p className="text-text-secondary">
                <span className="font-medium">Départ:</span>{" "}
                {new Date(request.trip?.departureDate).toLocaleString("fr-FR")}
              </p>
              <p className="text-text-secondary">
                <span className="font-medium">Arrivée:</span>{" "}
                {new Date(request.trip?.arrivalDate).toLocaleString("fr-FR")}
              </p>
            </div>
          </Card>

        
          {(request.message || request.driverResponse?.message) && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Messages</h2>
              <div className="space-y-4">
                {request.message && (
                  <div>
                    <h3 className="font-medium text-text-primary">Message de l'expéditeur</h3>
                    <p className="text-text-secondary">{request.message}</p>
                  </div>
                )}
                {request.driverResponse?.message && (
                  <div>
                    <h3 className="font-medium text-text-primary">Réponse du conducteur</h3>
                    <p className="text-text-secondary">{request.driverResponse.message}</p>
                    <p className="text-xs text-text-secondary mt-1">
                      {new Date(request.driverResponse.respondedAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

         
          {request.status !== "pending" && request.status !== "rejected" && request.status !== "cancelled" && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Suivi</h2>
              <div className="space-y-4">
                <div
                  className={`flex items-center space-x-3 ${request.tracking?.pickupConfirmed?.confirmed ? "text-success" : "text-text-secondary"}`}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Collecte confirmée</span>
                  {request.tracking?.pickupConfirmed?.confirmedAt && (
                    <span className="text-sm">
                      - {new Date(request.tracking.pickupConfirmed.confirmedAt).toLocaleString("fr-FR")}
                    </span>
                  )}
                </div>

                <div
                  className={`flex items-center space-x-3 ${request.tracking?.inTransit?.confirmed ? "text-success" : "text-text-secondary"}`}
                >
                  <Package className="w-5 h-5" />
                  <span>En transit</span>
                  {request.tracking?.inTransit?.confirmedAt && (
                    <span className="text-sm">
                      - {new Date(request.tracking.inTransit.confirmedAt).toLocaleString("fr-FR")}
                    </span>
                  )}
                </div>

                <div
                  className={`flex items-center space-x-3 ${request.tracking?.delivered?.confirmed ? "text-success" : "text-text-secondary"}`}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Livraison confirmée</span>
                  {request.tracking?.delivered?.confirmedAt && (
                    <span className="text-sm">
                      - {new Date(request.tracking.delivered.confirmedAt).toLocaleString("fr-FR")}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

       
        <div className="space-y-6">
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">{isDriver ? "Expéditeur" : "Conducteur"}</h2>

            {isDriver ? (
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">{request.sender?.firstName?.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">
                    {request.sender?.firstName} {request.sender?.lastName}
                  </h3>
                  <p className="text-sm text-text-secondary">Expéditeur</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">{request.trip?.driver?.firstName?.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">
                    {request.trip?.driver?.firstName} {request.trip?.driver?.lastName}
                  </h3>
                  <p className="text-sm text-text-secondary">Conducteur</p>
                </div>
              </div>
            )}

            {(request.status === "accepted" || request.status === "in_transit") && (
              <Button className="w-full" onClick={() => navigate(`/chat/${request._id}`)}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Ouvrir le chat
              </Button>
            )}
          </Card>

         
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Actions</h2>
            <div className="space-y-3">
              
              {isDriver && request.status === "pending" && (
                <>
                  <Button className="w-full" onClick={handleAcceptRequest} loading={acceptRequestMutation.isLoading}>
                    Accepter la demande
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleRejectRequest}
                    loading={rejectRequestMutation.isLoading}
                  >
                    Refuser la demande
                  </Button>
                </>
              )}

              {isDriver && request.status === "accepted" && (
                <Button className="w-full" onClick={handleConfirmPickup} loading={confirmPickupMutation.isLoading}>
                  Confirmer la collecte
                </Button>
              )}

              {isDriver && request.status === "in_transit" && (
                <Button className="w-full" onClick={handleConfirmDelivery} loading={confirmDeliveryMutation.isLoading}>
                  Confirmer la livraison
                </Button>
              )}

              
              {isSender && (request.status === "pending" || request.status === "accepted") && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCancelRequest}
                  loading={cancelRequestMutation.isLoading}
                >
                  Annuler la demande
                </Button>
              )}

              {isSender && request.status === "in_transit" && (
                <Button className="w-full" onClick={handleConfirmDelivery} loading={confirmDeliveryMutation.isLoading}>
                  Confirmer la réception
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default RequestDetailPage
