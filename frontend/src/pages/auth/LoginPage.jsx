import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { Eye, EyeOff, Truck } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || "/dashboard"

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const result = await login(data.email, data.password)
      if (result.success) {
        navigate(from, { replace: true })
      }
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
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-primary">TransportConnect</h1>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Bon retour !</h2>
          <p className="text-text-secondary">Connectez-vous à votre compte</p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
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
            </div>

            <div className="relative">
              <Input
                label="Mot de passe"
                type={showPassword ? "text" : "password"}
                placeholder="Votre mot de passe"
                error={errors.password?.message}
                {...register("password", {
                  required: "Le mot de passe est requis",
                  minLength: {
                    value: 6,
                    message: "Le mot de passe doit contenir au moins 6 caractères",
                  },
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-text-secondary hover:text-primary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                <span className="ml-2 text-sm text-text-secondary">Se souvenir de moi</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:text-text-primary">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="large">
              Se connecter
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-secondary">
              Vous n'avez pas de compte ?{" "}
              <Link to="/register" className="text-primary hover:text-text-primary font-semibold">
                Créer un compte
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LoginPage
