import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  Car,
  Package,
  MessageCircle,
  Star,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Settings,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Download,
} from "lucide-react";
import Layout from "../../components/Layout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";

const TABS = [
  { id: "dashboard", name: "Vue d'ensemble", icon: BarChart3 },
  { id: "users", name: "Utilisateurs", icon: Users },
  { id: "trips", name: "Trajets", icon: Car },
  { id: "requests", name: "Demandes", icon: Package },
  { id: "reports", name: "Rapports", icon: Activity },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => adminAPI.getDashboardStats(),
    enabled: activeTab === "dashboard",
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: [
      "admin",
      "users",
      currentPage,
      searchTerm,
      filterRole,
      filterStatus,
    ],
    queryFn: () =>
      adminAPI.getUsers({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        role: filterRole,
        status: filterStatus,
      }),
    enabled: activeTab === "users",
  });

  const { data: tripsData, isLoading: tripsLoading } = useQuery({
    queryKey: ["admin", "trips", currentPage],
    queryFn: () => adminAPI.getTrips({ page: currentPage, limit: 10 }),
    enabled: activeTab === "trips",
  });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ["admin", "requests", currentPage],
    queryFn: () => adminAPI.getRequests({ page: currentPage, limit: 10 }),
    enabled: activeTab === "requests",
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: (userId) => adminAPI.toggleUserStatus(userId),
    onSuccess: () => {
      toast.success("Statut utilisateur mis à jour");
      queryClient.invalidateQueries(["admin", "users"]);
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du statut");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => adminAPI.deleteUser(userId),
    onSuccess: () => {
      toast.success("Utilisateur supprimé");
      queryClient.invalidateQueries(["admin", "users"]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la suppression",
      );
    },
  });

  const handleToggleUserStatus = (userId) => {
    if (
      confirm("Êtes-vous sûr de vouloir changer le statut de cet utilisateur ?")
    ) {
      toggleUserStatusMutation.mutate(userId);
    }
  };

  const handleDeleteUser = (userId) => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.",
      )
    ) {
      deleteUserMutation.mutate(userId);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = "primary" }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div
              className={`flex items-center mt-2 text-sm ${
                trend > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-lg ${
            color === "primary"
              ? "bg-blue-100"
              : color === "success"
                ? "bg-green-100"
                : color === "warning"
                  ? "bg-yellow-100"
                  : "bg-purple-100"
          }`}
        >
          <Icon
            className={`w-6 h-6 ${
              color === "primary"
                ? "text-blue-600"
                : color === "success"
                  ? "text-green-600"
                  : color === "warning"
                    ? "text-yellow-600"
                    : "text-purple-600"
            }`}
          />
        </div>
      </div>
    </Card>
  );

  const renderDashboard = () => {
    if (dashboardLoading) return <LoadingSpinner />;

    const stats = dashboardData?.data?.stats;
    const recent = dashboardData?.data?.recent;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Utilisateurs"
            value={stats?.totalUsers || 0}
            icon={Users}
            color="primary"
          />
          <StatCard
            title="Trajets"
            value={stats?.totalTrips || 0}
            icon={Car}
            color="success"
          />
          <StatCard
            title="Demandes"
            value={stats?.totalRequests || 0}
            icon={Package}
            color="warning"
          />
          <StatCard
            title="Conversations"
            value={stats?.totalChats || 0}
            icon={MessageCircle}
            color="purple"
          />
          <StatCard
            title="Avis"
            value={stats?.totalReviews || 0}
            icon={Star}
            color="primary"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Users */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Nouveaux utilisateurs
            </h3>
            <div className="space-y-3">
              {recent?.users?.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-800"
                        : user.role === "conducteur"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Trips */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Trajets récents
            </h3>
            <div className="space-y-3">
              {recent?.trips?.map((trip) => (
                <div
                  key={trip._id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {trip.departureCity} → {trip.destinationCity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Par {trip.driver?.firstName} {trip.driver?.lastName}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(trip.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Requests */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Demandes récentes
            </h3>
            <div className="space-y-3">
              {recent?.requests?.map((request) => (
                <div
                  key={request._id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {request.departureCity} → {request.destinationCity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Par {request.sender?.firstName} {request.sender?.lastName}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      request.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : request.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : request.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    if (usersLoading) return <LoadingSpinner />;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tous les rôles</option>
            <option value="conducteur">Conducteur</option>
            <option value="expediteur">Expéditeur</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usersData?.data?.docs?.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : user.role === "conducteur"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleToggleUserStatus(user._id)}
                          disabled={toggleUserStatusMutation.isLoading}
                        >
                          {user.isActive ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={deleteUserMutation.isLoading}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {usersData?.data?.totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            {Array.from(
              { length: usersData.data.totalPages },
              (_, i) => i + 1,
            ).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "primary" : "outline"}
                size="small"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "users":
        return renderUsers();
      case "trips":
        return (
          <div className="text-center py-8">
            Gestion des trajets - À implémenter
          </div>
        );
      case "requests":
        return (
          <div className="text-center py-8">
            Gestion des demandes - À implémenter
          </div>
        );
      case "reports":
        return <div className="text-center py-8">Rapports - À implémenter</div>;
      default:
        return null;
    }
  };

  return (
    
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
            <p className="text-gray-600 mt-2">
              Gérez votre plateforme TransportConnect
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="small">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            <Button variant="outline" size="small">
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </div>
   
  );
}
