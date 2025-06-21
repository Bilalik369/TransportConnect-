import { body, param, query, validationResult } from "express-validator"

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Erreurs de validation",
        errors: errors.array(),
      })
    }
   next()
  }
  


export const validateRegister = [
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Le prénom doit contenir entre 2 et 50 caractères"),
  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Le nom doit contenir entre 2 et 50 caractères"),
  body("email").trim().isEmail().normalizeEmail().withMessage("Email invalide"),
  body("phone")
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage("Numéro de téléphone invalide"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
  body("role")
    .isIn(["conducteur", "expediteur"])
    .withMessage("Rôle invalide"),
  handleValidationErrors,
]


export const validateLogin = [
  body("email").trim().isEmail().normalizeEmail().withMessage("Email invalide"),
  body("password").notEmpty().withMessage("Mot de passe requis"),
  handleValidationErrors,
]

export const validateTrip = [
  body("departure.address").trim().notEmpty().withMessage("Adresse de départ requise"),
  body("departure.city").trim().notEmpty().withMessage("Ville de départ requise"),
  body("destination.address").trim().notEmpty().withMessage("Adresse de destination requise"),
  body("destination.city").trim().notEmpty().withMessage("Ville de destination requise"),
  body("departureDate")
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value <= new Date()) {
        throw new Error("La date de départ doit être dans le futur")
      }
      return true
    }),
  body("arrivalDate")
    .isISO8601()
    .toDate()
    .custom((value, { req }) => {
      if (value <= new Date(req.body.departureDate)) {
        throw new Error("La date d'arrivée doit être après la date de départ")
      }
      return true
    }),
  body("availableCapacity.weight").isFloat({ min: 1 }).withMessage("La capacité de poids doit être supérieure à 0"),
  body("pricePerKg").isFloat({ min: 0 }).withMessage("Le prix par kg ne peut pas être négatif"),
  body("acceptedCargoTypes").isArray({ min: 1 }).withMessage("Au moins un type de cargaison doit être sélectionné"),
  handleValidationErrors,
]


export const validateRequest = [
  body("cargo.description")
    .trim()
    .isLength({ min: 10, max: 300 })
    .withMessage("La description doit contenir entre 10 et 300 caractères"),
  body("cargo.weight").isFloat({ min: 0.1 }).withMessage("Le poids doit être supérieur à 0"),
  body("cargo.dimensions.length").isFloat({ min: 1 }).withMessage("La longueur doit être supérieure à 0"),
  body("cargo.dimensions.width").isFloat({ min: 1 }).withMessage("La largeur doit être supérieure à 0"),
  body("cargo.dimensions.height").isFloat({ min: 1 }).withMessage("La hauteur doit être supérieure à 0"),
  body("cargo.type")
    .isIn(["fragile", "liquide", "dangereux", "alimentaire", "electronique", "textile", "mobilier", "autre"])
    .withMessage("Type de cargaison invalide"),
  body("pickup.address").trim().notEmpty().withMessage("Adresse de collecte requise"),
  body("pickup.city").trim().notEmpty().withMessage("Ville de collecte requise"),
  body("delivery.address").trim().notEmpty().withMessage("Adresse de livraison requise"),
  body("delivery.city").trim().notEmpty().withMessage("Ville de livraison requise"),
  handleValidationErrors,
]


export const validateReview = [
  body("rating").isInt({ min: 1, max: 5 }).withMessage("La note doit être entre 1 et 5"),
  body("comment")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Le commentaire ne peut pas dépasser 300 caractères"),
  body("criteria.punctuality")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("La note de ponctualité doit être entre 1 et 5"),
  body("criteria.communication")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("La note de communication doit être entre 1 et 5"),
  body("criteria.cargoHandling")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("La note de manipulation doit être entre 1 et 5"),
  body("criteria.professionalism")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("La note de professionnalisme doit être entre 1 et 5"),
  handleValidationErrors,
]

export const validateObjectId = (paramName) => [
  param(paramName).isMongoId().withMessage(`${paramName} invalide`),
  handleValidationErrors,
]


export const validateTripSearch = [
  query("departure")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage("La ville de départ doit contenir au moins 2 caractères"),

  query("destination")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage("La ville de destination doit contenir au moins 2 caractères"),

  query("date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Format de date invalide"),

  query("cargoType")
    .optional({ checkFalsy: true })
    .isIn([
      "fragile", "liquide", "dangereux", "alimentaire",
      "electronique", "textile", "mobilier", "autre"
    ])
    .withMessage("Type de cargaison invalide"),

  query("maxWeight")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0.1 })
    .withMessage("Le poids maximum doit être supérieur à 0"),

  query("page")
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Le numéro de page doit être supérieur à 0"),

  query("limit")
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 50 })
    .withMessage("La limite doit être entre 1 et 50"),

  handleValidationErrors,
]