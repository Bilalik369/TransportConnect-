export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000"

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
}

export const CARGO_TYPES = [
  { value: "fragile", label: "Fragile" },
  { value: "liquide", label: "Liquide" },
  { value: "dangereux", label: "Dangereux" },
  { value: "alimentaire", label: "Alimentaire" },
  { value: "electronique", label: "Électronique" },
  { value: "textile", label: "Textile" },
  { value: "mobilier", label: "Mobilier" },
  { value: "autre", label: "Autre" },
]

export const VEHICLE_TYPES = [
  { value: "camion", label: "Camion" },
  { value: "camionnette", label: "Camionnette" },
  { value: "voiture", label: "Voiture" },
  { value: "moto", label: "Moto" },
]

export const REQUEST_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
}

export const TRIP_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
}

export const USER_ROLES = {
  DRIVER: "conducteur",
  SENDER: "expediteur",
  ADMIN: "admin",
}
