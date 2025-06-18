import dotenv from "dotenv"
dotenv.config()

console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);


import { sendWelcomeEmail } from "../utils/emailService.js"

const user = {
  email: "bilal11iken@gmail.com",
  firstName: "",
  role: "conducteur",
}

sendWelcomeEmail(user)
  .then(() => console.log(" Email envoyé avec succès"))
  .catch((err) => console.error(" Échec de l'envoi:", err))
