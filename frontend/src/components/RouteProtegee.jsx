import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RouteProtegee({ children, roleRequis }) {
  const { employe, chargement } = useAuth();

  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="font-body text-ink/60">Chargement...</p>
      </div>
    );
  }

  if (!employe) {
    return <Navigate to="/connexion" replace />;
  }

  if (roleRequis && employe.role !== roleRequis) {
    const accueil = employe.role === "restaurant" ? "/dashboard" : "/";
    return <Navigate to={accueil} replace />;
  }

  return children;
}