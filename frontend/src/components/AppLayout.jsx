// Layout comun pentru paginile aplicației (topbar + conținut)

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function AppLayout({ title, children }) {
  const navigate = useNavigate();

  // Citește utilizatorul logat din localStorage
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  // Șterge datele de autentificare și revine la login
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  }

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div>
          <div style={styles.h1}>{title}</div>
          <div style={styles.sub}>
            Logged in as <b>{user?.role || "?"}</b>{" "}
            {user?.email ? `• ${user.email}` : ""}
          </div>
        </div>

        <button onClick={logout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      <div>{children}</div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    padding: 22,
    color: "#e5e7eb",
    background:
      "radial-gradient(1200px 600px at 15% 10%, rgba(99,102,241,0.20), transparent 55%), radial-gradient(900px 500px at 85% 25%, rgba(16,185,129,0.14), transparent 55%), #0b1020",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(17,24,39,0.55)",
    backdropFilter: "blur(10px)",
  },
  h1: { fontSize: 18, fontWeight: 900 },
  sub: { fontSize: 12, opacity: 0.75, marginTop: 2 },
  logoutBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#e5e7eb",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 800,
  },
};
