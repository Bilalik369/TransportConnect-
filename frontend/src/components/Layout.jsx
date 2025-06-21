import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useSocket } from "../contexts/SocketContext"
import { Home, Truck, Package, MessageCircle, User, LogOut, Menu, X, Shield, Bell } from "lucide-react"
import clsx from "clsx"

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { isConnected } = useSocket()
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
    { name: "Tableau de bord", href: "/dashboard", icon: Home },
    {
      name: user?.role === "conducteur" ? "Mes trajets" : "Rechercher",
      href: "/trips",
      icon: Truck,
    },
    { name: "Demandes", href: "/requests", icon: Package },
    { name: "Messages", href: "/chat", icon: MessageCircle },
    { name: "Profil", href: "/profile", icon: User },
  ]

  if (user?.role === "admin") {
    navigation.push({ name: "Administration", href: "/admin", icon: Shield })
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-background">
    
      <div className={clsx("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold text-primary">TransportConnect</h2>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6 text-text-secondary" />
            </button>
          </div>
          <nav className="mt-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    "flex items-center px-4 py-3 text-sm font-medium transition-colors",
                    location.pathname === item.href
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:bg-input-background hover:text-primary",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

    
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white shadow-lg">
          <div className="flex items-center px-6 py-4 border-b">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <h2 className="ml-3 text-xl font-bold text-primary">TransportConnect</h2>
            </div>
          </div>

          <nav className="mt-6 flex-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    "flex items-center px-6 py-3 text-sm font-medium transition-colors",
                    location.pathname === item.href
                      ? "bg-primary text-white border-r-4 border-text-primary"
                      : "text-text-secondary hover:bg-input-background hover:text-primary",
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-6 border-t">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">{user?.firstName?.charAt(0)}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-text-primary">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-text-secondary capitalize">{user?.role}</p>
              </div>
              <div className={clsx("ml-auto w-3 h-3 rounded-full", isConnected ? "bg-success" : "bg-error")} />
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm text-text-secondary hover:text-error transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

    
      <div className="lg:pl-64">
      
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setSidebarOpen(true)} className="text-text-secondary hover:text-primary">
              <Menu className="w-6 h-6" />
            </button>

            <h1 className="text-lg font-semibold text-primary">TransportConnect</h1>

            <div className="flex items-center space-x-2">
              <div className={clsx("w-3 h-3 rounded-full", isConnected ? "bg-success" : "bg-error")} />
              <Bell className="w-5 h-5 text-text-secondary" />
            </div>
          </div>
        </div>

       
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

export default Layout
