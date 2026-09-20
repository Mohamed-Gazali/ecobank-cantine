import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RouteProtegee from "./components/RouteProtegee";
import Layout from "./components/Layout";
import Connexion from "./pages/Connexion";
import Inscription from "./pages/Inscription";

import EmployeDashboard from "./pages/employe/EmployeDashboard";
import EmployeHistorique from "./pages/employe/EmployeHistorique";
import EmployeAvis from "./pages/employe/EmployeAvis";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCommandes from "./pages/admin/AdminCommandes";
import AdminMenuJour from "./pages/admin/AdminMenuJour";
import AdminHistorique from "./pages/admin/AdminHistorique";
import AdminParametres from "./pages/admin/AdminParametres";
import AdminAvis from "./pages/admin/AdminAvis";

const ITEMS_EMPLOYE = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/historique", label: "Mes commandes" },
  { to: "/avis", label: "Donner un avis" },
];

const ITEMS_ADMIN = [
  { to: "/dashboard", label: "Dashboard", end: true },
  { to: "/dashboard/commandes", label: "Commandes" },
  { to: "/dashboard/menu-jour", label: "Plat du jour" },
  { to: "/dashboard/historique", label: "Historique" },
  { to: "/dashboard/avis", label: "Avis" },
  { to: "/dashboard/parametres", label: "Paramètres" },
];

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />

        <Route
          element={
            <RouteProtegee roleRequis="employe">
              <Layout titre="Cantine du midi" items={ITEMS_EMPLOYE} />
            </RouteProtegee>
          }
        >
          <Route path="/" element={<EmployeDashboard />} />
          <Route path="/historique" element={<EmployeHistorique />} />
          <Route path="/avis" element={<EmployeAvis />} />
        </Route>

        <Route
          element={
            <RouteProtegee roleRequis="restaurant">
              <Layout titre="Cantine Ecobank" sousTitre="Espace restaurant" items={ITEMS_ADMIN} />
            </RouteProtegee>
          }
        >
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/dashboard/commandes" element={<AdminCommandes />} />
          <Route path="/dashboard/menu-jour" element={<AdminMenuJour />} />
          <Route path="/dashboard/historique" element={<AdminHistorique />} />
          <Route path="/dashboard/avis" element={<AdminAvis />} />
          <Route path="/dashboard/parametres" element={<AdminParametres />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
