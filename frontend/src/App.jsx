import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { SocketProvider } from "./contexts/SocketContext"
import ProtectedRoute from "./components/ProtectedRoute"
import PublicRoute from "./components/PublicRoute"


import WelcomePage from "./pages/auth/WelcomePage"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"


import DashboardPage from "./pages/dashboard/DashboardPage"
import TripsPage from "./pages/trips/TripsPage"
import TripDetailPage from "./pages/trips/TripDetailPage"
import CreateTripPage from "./pages/trips/CreateTripPage"
import RequestsPage from "./pages/requests/RequestsPage"
import RequestDetailPage from "./pages/requests/RequestDetailPage"
import CreateRequestPage from "./pages/requests/CreateRequestPage"
// import ChatPage from "./pages/chat/ChatPage"
// import ChatDetailPage from "./pages/chat/ChatDetailPage"
// import ProfilePage from "./pages/profile/ProfilePage"
// import AdminPage from "./pages/admin/AdminPage"

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <WelcomePage />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Trips */}
            <Route
              path="/trips"
              element={
                <ProtectedRoute>
                  <TripsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/create"
              element={
                <ProtectedRoute>
                  <CreateTripPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/:id"
              element={
                <ProtectedRoute>
                  <TripDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Requests */}
            <Route
              path="/requests"
              element={
                <ProtectedRoute>
                  <RequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests/create/:tripId"
              element={
                <ProtectedRoute>
                  <CreateRequestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests/:id"
              element={
                <ProtectedRoute>
                  <RequestDetailPage />
                </ProtectedRoute>
              }
            />

           
            {/* <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            /> */}
            {/* <Route
              path="/chat/:requestId"
              element={
                <ProtectedRoute>
                  <ChatDetailPage />
                </ProtectedRoute>
              }
            /> */}

            {/* Profile */}
            {/* <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            /> */}

            {/* Admin */}
            {/* <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminPage />
                </ProtectedRoute>
              }
            /> */}

            {/* Redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
