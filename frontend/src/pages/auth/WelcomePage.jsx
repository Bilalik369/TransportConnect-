import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Truck, MessageCircle, Star, Shield, Clock, Users } from "lucide-react"
import Button from "../../components/ui/Button"

const WelcomePage = () => {
  const features = [
    {
      icon: Truck,
      title: "Transport sécurisé",
      description: "Transporteurs vérifiés et assurés",
    },
    {
      icon: MessageCircle,
      title: "Chat en temps réel",
      description: "Communication directe avec les transporteurs",
    },
    {
      icon: Star,
      title: "Évaluations fiables",
      description: "Système de notation transparent",
    },
    {
      icon: Shield,
      title: "Paiement sécurisé",
      description: "Transactions protégées",
    },
    {
      icon: Clock,
      title: "Suivi en temps réel",
      description: "Suivez vos colis en direct",
    },
    {
      icon: Users,
      title: "Communauté active",
      description: "Réseau de transporteurs professionnels",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card-background">
      
      <header className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-primary">TransportConnect</h1>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-text-secondary hover:text-primary transition-colors">
              Se connecter
            </Link>
            <Link to="/register">
              <Button variant="outline" size="small">
                S'inscrire
              </Button>
            </Link>
          </div>
        </div>
      </header>

    
      <section className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight">
              Connectez-vous avec des
              <span className="text-primary"> transporteurs</span> de confiance
            </h2>

            <p className="text-xl text-text-secondary mb-8 leading-relaxed">
              La plateforme qui révolutionne le transport de marchandises. Trouvez le transporteur idéal ou proposez vos
              services en toute sécurité.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="large" className="w-full sm:w-auto">
                  Commencer maintenant
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="large" className="w-full sm:w-auto">
                  Se connecter
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="bg-gradient-to-r from-primary to-text-secondary rounded-2xl p-6 text-white mb-6">
                <h3 className="text-2xl font-bold mb-2">Trajet Beni mellal → Fes</h3>
                <p className="opacity-90">Départ: 25 Jui 2025, 08:00</p>
                <p className="opacity-90">Capacité: 500kg disponible</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">JD</span>
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">Iken bilal</p>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-text-secondary ml-1">4.9</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">25DH/kg</p>
                  <p className="text-sm text-text-secondary">Prix compétitif</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-text-primary mb-4">Pourquoi choisir TransportConnect ?</h3>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Une plateforme complète qui simplifie le transport de marchandises avec des fonctionnalités innovantes et
              sécurisées.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center p-6 rounded-2xl hover:bg-input-background transition-colors"
                >
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-text-primary mb-2">{feature.title}</h4>
                  <p className="text-text-secondary">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary to-text-secondary py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h3 className="text-4xl font-bold text-white mb-4">Prêt à commencer ?</h3>
            <p className="text-xl text-white opacity-90 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'utilisateurs qui font confiance à TransportConnect pour leurs besoins de
              transport.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="secondary" size="large" className=" text-primary hover:bg-gray-100">
                  Créer un compte gratuit
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="large"
                  className="border-white text-white hover:bg-white hover:text-primary"
                >
                  Se connecter
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

   
      <footer className="bg-text-dark text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold">TransportConnect</h4>
              </div>
              <p className="text-gray-300">La plateforme de référence pour le transport de marchandises.</p>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Produit</h5>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Tarifs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Sécurité
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Centre d'aide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Légal</h5>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Conditions d'utilisation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Politique de confidentialité
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Mentions légales
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 TransportConnect. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default WelcomePage
