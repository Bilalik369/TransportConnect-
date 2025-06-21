import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "react-query"
import { motion } from "framer-motion"
import { Plus, Search, Filter, MapPin, Calendar, Weight, Star, Truck } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { tripsAPI } from "../../services/api"
import Card from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import { CARGO_TYPES } from "../../config/constants"

const TripsPage = () => {
  const { user } = useAuth()
  const [filters, setFilters] = useState({
    departure: "",
    destination: "",
    date: "",
    cargoType: "",
    status: "active",
  })
  const [showFilters, setShowFilters] = useState(false)

  const {
    data: tripsData,
    isLoading,
    refetch,
  } = useQuery(
    ["trips", filters],
    () => {
      if (user?.role === "conducteur") {
        return tripsAPI.getMyTrips(filters)
      } else {
        return tripsAPI.getTrips(filters)
      }
    },
    {
      enabled: !!user,
    },
  )

  const trips = tripsData?.data?.trips || []

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      departure: "",
      destination: "",
      date: "",
      cargoType: "",
      status: "active",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-success bg-opacity-20 text-success"
      case "completed":
        return "bg-info bg-opacity-20 text-info"
      case "cancelled":
        return "bg-error bg-opacity-20 text-error"
      default:
        return "bg-placeholder-text bg-opacity-20 text-placeholder-text"
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case "active":
        return "Actif"
      case "completed":
        return "Terminé"
      case "cancelled":
        return "Annulé"
      default:
        return status
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            {user?.role === "conducteur" ? "Mes trajets" : "Rechercher un trajet"}
          </h1>
          <p className="text-text-secondary mt-1">
            {user?.role === "conducteur"
              ? "Gérez vos trajets et suivez vos demandes"
              : "Trouvez le trajet parfait pour vos colis"}
          </p>
        </div>

        {user?.role === "conducteur" && (
          <Link to="/trips/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau trajet
            </Button>
          </Link>
        )}
      </div>

     
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Filtres de recherche</h3>
          <Button variant="ghost" size="small" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? "Masquer" : "Afficher"} les filtres
          </Button>
        </div>

        <motion.div
          initial={false}
          animate={{ height: showFilters ? "auto" : 0, opacity: showFilters ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
            <Input
              placeholder="Ville de départ"
              value={filters.departure}
              onChange={(e) => handleFilterChange("departure", e.target.value)}
            />

            <Input
              placeholder="Ville de destination"
              value={filters.destination}
              onChange={(e) => handleFilterChange("destination", e.target.value)}
            />

            <Input
              type="date"
              placeholder="Date de départ"
              value={filters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
            />

            <select
              className="input-field"
              value={filters.cargoType}
              onChange={(e) => handleFilterChange("cargoType", e.target.value)}
            >
              <option value="">Tous les types</option>
              {CARGO_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-4">
              {user?.role === "conducteur" && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-text-primary">Statut:</label>
                  <select
                    className="input-field py-1 text-sm"
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                  >
                    <option value="active">Actifs</option>
                    <option value="completed">Terminés</option>
                    <option value="cancelled">Annulés</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="small" onClick={clearFilters}>
                Effacer
              </Button>
              <Button size="small" onClick={() => refetch()}>
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </Button>
            </div>
          </div>
        </motion.div>
      </Card>

   
      <div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : trips.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trips.map((trip) => (
              <motion.div
                key={trip._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 cursor-pointer" onClick={() => {}}>
                
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-text-primary text-lg">
                          {trip.departure.city} → {trip.destination.city}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{trip.pricePerKg}DH/kg</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(trip.status)}`}>
                        {getStatusLabel(trip.status)}
                      </span>
                    </div>
                  </div>

                 
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-text-secondary" />
                      <span className="text-sm text-text-secondary">
                        {new Date(trip.departureDate).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Weight className="w-4 h-4 text-text-secondary" />
                      <span className="text-sm text-text-secondary">{trip.availableCapacity.weight}kg disponible</span>
                    </div>
                  </div>

                
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {trip.acceptedCargoTypes.slice(0, 3).map((type) => (
                        <span
                          key={type}
                          className="px-2 py-1 bg-input-background text-text-secondary text-xs rounded-lg"
                        >
                          {CARGO_TYPES.find((t) => t.value === type)?.label || type}
                        </span>
                      ))}
                      {trip.acceptedCargoTypes.length > 3 && (
                        <span className="px-2 py-1 bg-input-background text-text-secondary text-xs rounded-lg">
                          +{trip.acceptedCargoTypes.length - 3} autres
                        </span>
                      )}
                    </div>
                  </div>

            
                  {user?.role !== "conducteur" && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">{trip.driver?.firstName?.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-text-primary">
                            {trip.driver?.firstName} {trip.driver?.lastName}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-warning fill-current" />
                            <span className="text-sm text-text-secondary">
                              {trip.driver?.stats?.averageRating?.toFixed(1) || "N/A"}
                            </span>
                            {trip.driver?.isVerified && <span className="text-xs text-success ml-2">✓ Vérifié</span>}
                          </div>
                        </div>
                      </div>

                      <Link to={`/requests/create/${trip._id}`}>
                        <Button size="small">Faire une demande</Button>
                      </Link>
                    </div>
                  )}

                  {user?.role === "conducteur" && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-4 text-sm text-text-secondary">
                        <span>{trip.requests?.length || 0} demande(s)</span>
                        <span>{trip.acceptedRequests?.length || 0} acceptée(s)</span>
                        <span>{trip.totalEarnings || 0}DH gagné(s)</span>
                      </div>

                      <Link to={`/trips/${trip._id}`}>
                        <Button variant="outline" size="small">
                          Voir détails
                        </Button>
                      </Link>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Truck className="w-16 h-16 text-placeholder-text mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">Aucun trajet trouvé</h3>
            <p className="text-text-secondary mb-6">
              {user?.role === "conducteur"
                ? "Vous n'avez pas encore créé de trajet."
                : "Aucun trajet ne correspond à vos critères de recherche."}
            </p>
            {user?.role === "conducteur" && (
              <Link to="/trips/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer mon premier trajet
                </Button>
              </Link>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}

export default TripsPage
