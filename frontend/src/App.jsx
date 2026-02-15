import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import TheatreSelection from "./pages/TheatreSelection";
import SeatSelection from "./pages/SeatSelection";
import TicketPage from "./pages/TicketPage";
import MyTickets from "./pages/MyTickets";
import AdminDashboard from "./pages/AdminDashboard";



function ProtectedRoute({ children, adminOnly }) {

  const { user, loading, isAdmin } = useAuth();

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  }

  if (!user) {

    return <Navigate to="/login" replace />;

  }

  if (adminOnly && !isAdmin) {

    return <Navigate to="/" replace />;

  }

  return children;

}



export default function App() {

  return (

    <Routes>

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />


      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >

        <Route index element={<Home />} />

        <Route
          path="movie/:movieId/theatres"
          element={<TheatreSelection />}
        />

        <Route
          path="movie/:movieId/theatre/:theatreId/seats"
          element={<SeatSelection />}
        />

        <Route
          path="ticket/:bookingId"
          element={<TicketPage />}
        />

        <Route
          path="my-tickets"
          element={<MyTickets />}
        />

        <Route
          path="admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

      </Route>


      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>

  );

}
