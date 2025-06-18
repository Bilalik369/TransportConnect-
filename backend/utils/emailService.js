
import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config({ path: "../.env" });  



// console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
// console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
// console.log("EMAIL_SECURE:", process.env.EMAIL_SECURE);
// console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_HOST from env:", process.env.EMAIL_HOST);

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

export const sendNotificationEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"TransportConnect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html:
        html ||
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">TransportConnect</h2>
          <p>${text}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Ceci est un email automatique, merci de ne pas répondre.
          </p>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Email envoyé:", info.messageId)
    return info
  } catch (error) {
    console.error("Erreur envoi email:", error)
    throw error
  }
}

export const sendWelcomeEmail = async (user) => {
  const subject = "Bienvenue sur TransportConnect !"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Bienvenue sur TransportConnect !</h2>
      <p>Bonjour ${user.firstName},</p>
      <p>Votre compte ${user.role} a été créé avec succès.</p>
      <p>Vous pouvez maintenant commencer à utiliser notre plateforme pour ${
        user.role === "conducteur"
          ? "publier vos trajets et transporter des colis"
          : "trouver des trajets et expédier vos colis"
      }.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Accéder à la plateforme
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        Ceci est un email automatique, merci de ne pas répondre.
      </p>
    </div>
  `

  return sendNotificationEmail(user.email, subject, "", html)
}

export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
  const subject = "Réinitialisation de votre mot de passe"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Réinitialisation de mot de passe</h2>
      <p>Bonjour ${user.firstName},</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Réinitialiser mon mot de passe
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">
        Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        Ceci est un email automatique, merci de ne pas répondre.
      </p>
    </div>
  `

  return sendNotificationEmail(user.email, subject, "", html)
}
