import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { Truck, ArrowLeft, Mail } from "lucide-react"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import toast from "react-hot-toast"

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      
      await new Promise((resolve) => setTimeout(resolve, 2000)) 
      setEmailSent(true)
      toast.success("Email de réinitialisation envoyé !")
    } catch (error) {
      toast.error("Erreur lors de l'envoi de l'email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
     
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-primary">TransportConnect</h1>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Mot de passe oublié ?</h2>
          <p className="text-text-secondary">
            {emailSent ? "Vérifiez votre boîte email" : "Entrez votre email pour recevoir un lien de réinitialisation"}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {emailSent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-success bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Email envoyé !</h3>
              <p className="text-text-secondary mb-6">
                Nous avons envoyé un lien de réinitialisation à votre adresse email. Vérifiez votre boîte de réception
                et suivez les instructions.
              </p>
              <Link to="/login">
                <Button className="w-full">Retour à la connexion</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Adresse email"
                type="email"
                placeholder="votre@email.com"
                error={errors.email?.message}
                {...register("email", {
                  required: "L'email est requis",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Format d'email invalide",
                  },
                })}
              />

              <Button type="submit" loading={loading} className="w-full" size="large">
                Envoyer le lien de réinitialisation
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center text-primary hover:text-text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la connexion
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ForgotPasswordPage
