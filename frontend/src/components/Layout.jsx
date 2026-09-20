import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ titre, sousTitre, items }) {
  const [ouvert, setOuvert] = useState(false);
  const { deconnecter } = useAuth();

  const NavContenu = () => (
    <nav className="flex-1 px-3 space-y-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setOuvert(false)}
          className={({ isActive }) =>
            `block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive
                ? "bg-white text-brand"
                : "text-white/75 hover:bg-white/10"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-paper md:flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:py-6 bg-brand">
        <div className="px-5 mb-6">
          <p className="font-display font-semibold text-white">{titre}</p>
          {sousTitre && <p className="text-xs text-white/60">{sousTitre}</p>}
        </div>
        <NavContenu />
        <div className="px-3 mt-4">
          <button
            onClick={deconnecter}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/10"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Barre du haut mobile */}
      <div className="md:hidden flex items-center justify-between px-5 py-4 bg-brand">
        <div>
          <p className="font-display font-semibold text-white">{titre}</p>
          {sousTitre && <p className="text-xs text-white/60">{sousTitre}</p>}
        </div>
        <button
          onClick={() => setOuvert(!ouvert)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white"
          aria-label="Menu"
        >
          ☰
        </button>
      </div>

      {/* Menu déroulant mobile */}
      {ouvert && (
        <div className="md:hidden bg-brand-dark py-3">
          <NavContenu />
          <div className="px-3 mt-2">
            <button
              onClick={deconnecter}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/10"
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
