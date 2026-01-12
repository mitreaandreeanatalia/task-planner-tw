// Componentă pentru protejarea rutelor în funcție de autentificare și rol

import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ allowRoles, children }) {
  // Verifică dacă există token-ul
  const token = localStorage.getItem("token");

  // Citește utilizatorul logat
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  // Dacă nu este autentificat, redirecționează la login
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Dacă rolul nu este permis, redirecționează la login
  if (allowRoles && !allowRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Afișează componenta protejată
  return children;
}
