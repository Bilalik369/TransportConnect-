import { Link } from "react-router-dom"
import { useQuery } from "react-query"
import { motion } from "framer-motion"
import { Plus, Search, Package, MessageCircle, TrendingUp, Clock, MapPin, Star, ArrowRight } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { tripsAPI, requestsAPI, usersAPI } from "../../services/api"
import Card from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import LoadingSpinner from "../../components/ui/LoadingSpinner"

const DashboardPage = () => {
  const { user } = useAuth()


  const { data: stats } = useQuery("user-stats", usersAPI.getStats)
  const { data: recentTrips, isLoading: tripsLoading } = useQuery("recent-trips", () =>
    user?.role === "conducteur" ? tripsAPI.getMyTrips({ limit: 5 }) : tripsAPI.getTrips({ limit: 5 }),
  )
  const { data: recentRequests, isLoading: requestsLoading } = useQuery("recent-requests", () =>
    user?.role === "conducteur" ? requestsAPI.getReceivedRequests({ limit: 5 }) : requestsAPI.getRequests({ limit: 5 }),
  )

  const quickActions =
    user?.role === "conducteur"
      ? [
          {
            title: "Nouveau trajet",
            description: "Créer un nouveau trajet",
            icon: Plus,
            href: "/trips/create",
            color: "bg-primary",
          },
          {
            title: "Mes trajets",
            description: "Gérer mes trajets",
            icon: Package,
            href: "/trips",
            color: "bg-text-secondary",
          },
          {
            title: "Demandes reçues",
            description: "Voir les demandes",
            icon: MessageCircle,
            href: "/requests",
            color: "bg-info",
          },
        ]
      : [
          {
            title: "Rechercher",
            description: "Trouver un trajet",
            icon: Search,
            href: "/trips",
            color: "bg-primary",
          },
          {
            title: "Mes demandes",
            description: "Suivre mes demandes",
            icon: Package,
            href: "/requests",
            color: "bg-text-secondary",
          },
          {
            title: "Messages",
            description: "Mes conversations",
            icon: MessageCircle,
            href: "/chat",
            color: "bg-info",
          },
        ]

  const statsCards = [
    {
      title: user?.role === "conducteur" ? "Trajets effectués" : "Demandes envoyées",
      value: stats?.data?.totalTrips || stats?.data?.totalRequests || 0,
      icon: Package,
      color: "text-primary",
    },
    {
      title: "Note moyenne",
      value: stats?.data?.averageRating ? `${stats.data.averageRating}/5` : "N/A",
      icon: Star,
      color: "text-warning",
    },
    {
      title: "Messages",
      value: "12",
      icon: MessageCircle,
      color: "text-info",
    },
  ]

  return (
    <div className="p-6 space-y-8">
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="bg-gradient-to-r from-primary to-text-secondary rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Bonjour {user?.firstName} ! 👋</h1>
          <p className="text-xl opacity-90 mb-6">
            {user?.role === "conducteur"
              ? "Gérez vos trajets et transportez en toute sécurité"
              : "Trouvez le transporteur idéal pour vos colis"}
          </p>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Dernière connexion: {new Date().toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Compte {user?.role}</span>
            </div>
          </div>
        </div>
      </motion.div>

     
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="text-center">
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.color} bg-opacity-10 mb-4`}
              >
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-1">{stat.value}</h3>
              <p className="text-text-secondary">{stat.title}</p>
            </Card>
          )
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-text-primary mb-6">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link key={action.title} to={action.href}>
                <Card className="text-center group cursor-pointer">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${action.color} text-white mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">{action.title}</h3>
                  <p className="text-text-secondary">{action.description}</p>
                </Card>
              </Link>
            )
          })}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Trips */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">
              {user?.role === "conducteur" ? "Mes trajets récents" : "Trajets disponibles"}
            </h2>
            <Link to="/trips">
              <Button variant="ghost" size="small">
                Voir tout <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {tripsLoading ? (
              <LoadingSpinner />
            ) : recentTrips?.data?.trips?.length > 0 ? (
              recentTrips.data.trips.map((trip) => (
                <Card key={trip._id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-text-secondary" />
                      <span className="font-semibold text-text-primary">
                        {trip.departure.city} → {trip.destination.city}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-primary">{trip.pricePerKg}€/kg</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <span>{new Date(trip.departureDate).toLocaleDateString("fr-FR")}</span>
                    <span>{trip.availableCapacity.weight}kg disponible</span>
                  </div>

                  {user?.role !== "conducteur" && (
                    <div className="flex items-center mt-3 space-x-2">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{trip.driver?.firstName?.charAt(0)}</span>
                      </div>
                      <span className="text-sm text-text-primary">
                        {trip.driver?.firstName} {trip.driver?.lastName}
                      </span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-warning fill-current" />
                        <span className="text-xs text-text-secondary ml-1">
                          {trip.driver?.stats?.averageRating?.toFixed(1) || "N/A"}
                        </span>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <Card className="text-center py-8">
                <Package className="w-12 h-12 text-placeholder-text mx-auto mb-4" />
                <p className="text-text-secondary">Aucun trajet trouvé</p>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Recent Requests */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">
              {user?.role === "conducteur" ? "Demandes reçues" : "Mes demandes"}
            </h2>
            <Link to="/requests">
              <Button variant="ghost" size="small">
                Voir tout <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {requestsLoading ? (
              <LoadingSpinner />
            ) : recentRequests?.data?.requests?.length > 0 ? (
              recentRequests.data.requests.map((request) => (
                <Card key={request._id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-text-secondary" />
                      <span className="font-semibold text-text-primary">
                        {request.cargo?.description?.substring(0, 30)}...
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        request.status === "pending"
                          ? "bg-warning bg-opacity-20 text-warning"
                          : request.status === "accepted"
                            ? "bg-success bg-opacity-20 text-success"
                            : request.status === "rejected"
                              ? "bg-error bg-opacity-20 text-error"
                              : "bg-placeholder-text bg-opacity-20 text-placeholder-text"
                      }`}
                    >
                      {request.status === "pending"
                        ? "En attente"
                        : request.status === "accepted"
                          ? "Acceptée"
                          : request.status === "rejected"
                            ? "Refusée"
                            : request.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <span>{request.cargo?.weight}kg</span>
                    <span>{request.price}€</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-text-secondary mt-2">
                    <span>
                      {request.pickup?.city} → {request.delivery?.city}
                    </span>
                    <span>{new Date(request.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-placeholder-text mx-auto mb-4" />
                <p className="text-text-secondary">Aucune demande trouvée</p>
              </Card>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DashboardPage
