  "use client"

  import { useState } from "react"
  import { Link } from "react-router-dom"
  import { useQuery } from "react-query"
  import { motion } from "framer-motion"
  import { Package, Clock, CheckCircle, XCircle, Truck, MessageCircle, Eye } from "lucide-react"
  import { useAuth } from "../../contexts/AuthContext"
  import { requestsAPI } from "../../services/api"
  import Card from "../../components/ui/Card"
  import Button from "../../components/ui/Button"
  import LoadingSpinner from "../../components/ui/LoadingSpinner"

  const RequestsPage = () => {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState("all")

    const { data: requestsData, isLoading } = useQuery(
      ["requests", activeTab],
      () => {
        if (user?.role === "conducteur") {
          return requestsAPI.getReceivedRequests({ status: activeTab === "all" ? "" : activeTab })
        } else {
          return requestsAPI.getRequests({ status: activeTab === "all" ? "" : activeTab })
        }
      },
      {
        enabled: !!user,
      },
    )

    const requests = requestsData?.data?.requests || []

    const getStatusIcon = (status) => {
      switch (status) {
        case "pending":
          return <Clock className="w-4 h-4 text-warning" />
        case "accepted":
          return <CheckCircle className="w-4 h-4 text-success" />
        case "rejected":
          return <XCircle className="w-4 h-4 text-error" />
        case "in_transit":
          return <Truck className="w-4 h-4 text-info" />
        case "delivered":
          return <CheckCircle className="w-4 h-4 text-success" />
        case "cancelled":
          return <XCircle className="w-4 h-4 text-error" />
        default:
          return <Package className="w-4 h-4 text-text-secondary" />
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

    const getStatusColor = (status) => {
      switch (status) {
        case "pending":
          return "bg-warning bg-opacity-20 text-warning"
        case "accepted":
          return "bg-success bg-opacity-20 text-success"
        case "rejected":
          return "bg-error bg-opacity-20 text-error"
        case "in_transit":
          return "bg-info bg-opacity-20 text-info"
        case "delivered":
          return "bg-success bg-opacity-20 text-success"
        case "cancelled":
          return "bg-error bg-opacity-20 text-error"
        default:
          return "bg-placeholder-text bg-opacity-20 text-placeholder-text"
      }
    }

    const tabs = [
      { id: "all", label: "Toutes", count: requests.length },
      { id: "pending", label: "En attente", count: requests.filter((r) => r.status === "pending").length },
      { id: "accepted", label: "Acceptées", count: requests.filter((r) => r.status === "accepted").length },
      { id: "in_transit", label: "En transit", count: requests.filter((r) => r.status === "in_transit").length },
      { id: "delivered", label: "Livrées", count: requests.filter((r) => r.status === "delivered").length },
    ]

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            {user?.role === "conducteur" ? "Demandes reçues" : "Mes demandes"}
          </h1>
          <p className="text-text-secondary mt-1">
            {user?.role === "conducteur"
              ? "Gérez les demandes de transport reçues"
              : "Suivez l'état de vos demandes de transport"}
          </p>
        </div>

        {/* Tabs */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "bg-input-background text-text-secondary hover:bg-primary hover:text-white"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </Card>

        {/* Requests List */}
        <div>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-4">
              {requests
                .filter((request) => activeTab === "all" || request.status === activeTab)
                .map((request) => (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-text-primary">{request.cargo.description}</h3>
                            <div
                              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}
                            >
                              {getStatusIcon(request.status)}
                              <span>{getStatusLabel(request.status)}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-text-secondary">
                            <div>
                              <span className="font-medium">Collecte:</span>
                              <p>
                                {request.pickup.address}, {request.pickup.city}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Livraison:</span>
                              <p>
                                {request.delivery.address}, {request.delivery.city}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Trajet:</span>
                              <p>
                                {request.trip?.departure?.city} → {request.trip?.destination?.city}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-primary">{request.price}€</div>
                          <div className="text-sm text-text-secondary">{request.cargo.weight}kg</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-4">
                          {user?.role === "conducteur" ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  {request.sender?.firstName?.charAt(0)}
                                </span>
                              </div>
                              <span className="text-sm text-text-primary">
                                {request.sender?.firstName} {request.sender?.lastName}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  {request.trip?.driver?.firstName?.charAt(0)}
                                </span>
                              </div>
                              <span className="text-sm text-text-primary">
                                {request.trip?.driver?.firstName} {request.trip?.driver?.lastName}
                              </span>
                            </div>
                          )}

                          <span className="text-xs text-text-secondary">
                            {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {(request.status === "accepted" || request.status === "in_transit") && (
                            <Link to={`/chat/${request._id}`}>
                              <Button variant="outline" size="small">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                Chat
                              </Button>
                            </Link>
                          )}

                          <Link to={`/requests/${request._id}`}>
                            <Button variant="outline" size="small">
                              <Eye className="w-4 h-4 mr-1" />
                              Détails
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <Package className="w-16 h-16 text-placeholder-text mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">Aucune demande trouvée</h3>
              <p className="text-text-secondary mb-6">
                {user?.role === "conducteur"
                  ? "Vous n'avez pas encore reçu de demandes."
                  : "Vous n'avez pas encore fait de demandes."}
              </p>
              {user?.role !== "conducteur" && (
                <Link to="/trips">
                  <Button>
                    <Package className="w-4 h-4 mr-2" />
                    Rechercher un trajet
                  </Button>
                </Link>
              )}
            </Card>
          )}
        </div>
      </div>
    )
  }

  export default RequestsPage
