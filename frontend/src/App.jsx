// Router-ul principal al aplicației + pagina de Login

import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import Admin from "./pages/Admin";
import Manager from "./pages/Manager";
import Executor from "./pages/Executor";
import History from "./pages/History";

import ProtectedRoute from "./components/ProtectedRoute";

const API_URL = "http://localhost:7000";

// Definește rutele și protejează accesul în funcție de rol
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowRoles={["ADMIN"]}>
            <Admin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager"
        element={
          <ProtectedRoute allowRoles={["MANAGER"]}>
            <Manager />
          </ProtectedRoute>
        }
      />

      <Route
        path="/executor"
        element={
          <ProtectedRoute allowRoles={["EXECUTOR"]}>
            <Executor />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute allowRoles={["ADMIN", "MANAGER", "EXECUTOR"]}>
            <History />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Login />} />
    </Routes>
  );
}

// Pagina de autentificare: trimite email/parolă și salvează token-ul
function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [kind, setKind] = useState("info"); // info | error | success

  // Face login pe backend și redirecționează după rol
  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setKind("info");

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setKind("error");
        setMessage(data?.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setKind("success");
      setMessage(`Login OK ✅  Role: ${data.user.role}`);

      if (data.user.role === "ADMIN") navigate("/admin");
      if (data.user.role === "MANAGER") navigate("/manager");
      if (data.user.role === "EXECUTOR") navigate("/executor");
    } catch (err) {
      setKind("error");
      setMessage("Server error. Is backend running on :7000?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>✓</div>
          <div>
            <div style={styles.title}>Task Planner</div>
            <div style={styles.subtitle}>Sign in to continue</div>
          </div>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            autoComplete="username"
            style={styles.input}
          />

          <label style={styles.label}>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
            style={styles.input}
          />

          <button
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {message ? (
            <div
              style={{
                ...styles.message,
                ...(kind === "error" ? styles.messageError : {}),
                ...(kind === "success" ? styles.messageSuccess : {}),
              }}
            >
              {message}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background:
      "radial-gradient(1200px 600px at 20% 10%, rgba(99,102,241,0.25), transparent 55%), radial-gradient(1000px 500px at 80% 30%, rgba(16,185,129,0.18), transparent 55%), #0b1020",
    color: "#e5e7eb",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 18,
    background: "rgba(17,24,39,0.7)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
    padding: 22,
    backdropFilter: "blur(10px)",
  },
  header: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: 18,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "rgba(99,102,241,0.18)",
    border: "1px solid rgba(99,102,241,0.35)",
    fontWeight: 800,
    fontSize: 18,
  },
  title: { fontSize: 20, fontWeight: 800, letterSpacing: 0.2 },
  subtitle: { fontSize: 13, opacity: 0.8, marginTop: 2 },
  form: { display: "grid", gap: 10 },
  label: { fontSize: 12, opacity: 0.85, marginTop: 4 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.25)",
    color: "#e5e7eb",
    outline: "none",
  },
  button: {
    marginTop: 6,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background:
      "linear-gradient(90deg, rgba(99,102,241,0.9), rgba(16,185,129,0.85))",
    color: "#07101f",
    fontWeight: 800,
    cursor: "pointer",
  },
  message: {
    marginTop: 8,
    padding: "10px 12px",
    borderRadius: 12,
    fontSize: 13,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  messageError: {
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.35)",
  },
  messageSuccess: {
    background: "rgba(16,185,129,0.12)",
    border: "1px solid rgba(16,185,129,0.35)",
  },
};
