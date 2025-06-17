import { body, param, query, validationResult } from "express-validator"

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Erreurs de validation",
      errors: errors.array(),
    })
  }
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


