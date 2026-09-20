import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [employe, setEmploye] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setChargement(false);
      return;
    }
    api
      .get("/auth/moi")
      .then((res) => setEmploye(res.data))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setChargement(false));
  }, []);

  const connecter = (token, employeData) => {
    localStorage.setItem("token", token);
    setEmploye(employeData);
  };

  const deconnecter = () => {
    localStorage.removeItem("token");
    setEmploye(null);
  };

  return (
    <AuthContext.Provider value={{ employe, chargement, connecter, deconnecter }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
