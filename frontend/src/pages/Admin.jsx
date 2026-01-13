// Pagina Admin: creare utilizatori (MANAGER/EXECUTOR) + listare utilizatori

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";

const API_URL = "https://task-planner-tw-1.onrender.com";

// Ia token-ul JWT din localStorage pentru request-uri
function getToken() {
  return localStorage.getItem("token");
}

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Datele formularului de create user
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EXECUTOR",
    managerId: "",
  });

  const [msg, setMsg] = useState("");
  const [creating, setCreating] = useState(false);

  // Lista de manageri (pentru asignare când creăm EXECUTOR)
  const managers = useMemo(
    () => users.filter((u) => u.role === "MANAGER"),
    [users]
  );

  // Încarcă lista de utilizatori
  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch {
      setError("Cannot load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handler pentru input-uri
  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  // Trimite request-ul de creare user către backend
  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");

    try {
      setCreating(true);

      const body = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };

      // Pentru EXECUTOR, managerId este obligatoriu
      if (form.role === "EXECUTOR") {
        body.managerId = Number(form.managerId);
      }

      const res = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(data.message || "Error creating user");
        return;
      }

      setMsg("User created successfully ✅");
      setForm({
        name: "",
        email: "",
        password: "",
        role: "EXECUTOR",
        managerId: "",
      });
      fetchUsers();
    } finally {
      setCreating(false);
    }
  }

  // Afișează numele managerului după managerId
  function managerName(managerId) {
    if (!managerId) return "-";
    return users.find((u) => u.id === managerId)?.name || managerId;
  }

  return (
    <AppLayout title="Admin Dashboard">
      <div style={{ marginBottom: 12 }}>
        <Link to="/history" style={styles.link}>
          Go to History →
        </Link>
      </div>

      {/* Formular de creare utilizator */}
      <div style={styles.card}>
        <div style={styles.title}>Create user</div>

        <form onSubmit={onSubmit} style={styles.form}>
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={onChange}
            required
            style={styles.input}
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            required
            style={styles.input}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            required
            style={styles.input}
          />

          <select
            name="role"
            value={form.role}
            onChange={onChange}
            style={styles.input}
          >
            <option value="EXECUTOR">EXECUTOR</option>
            <option value="MANAGER">MANAGER</option>
          </select>

          {form.role === "EXECUTOR" && (
            <select
              name="managerId"
              value={form.managerId}
              onChange={onChange}
              required
              style={styles.input}
            >
              <option value="">Select manager</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          )}

          <button disabled={creating} style={styles.button}>
            {creating ? "Creating..." : "Create"}
          </button>

          {msg && <div style={styles.msg}>{msg}</div>}
        </form>
      </div>

      {/* Listă utilizatori */}
      <div style={{ ...styles.card, marginTop: 16 }}>
        <div style={styles.title}>Users</div>

        {loading && <div>Loading...</div>}
        {error && <div>{error}</div>}

        {!loading && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Manager</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={styles.td}>{u.id}</td>
                  <td style={styles.td}>{u.name}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{u.role}</td>
                  <td style={styles.td}>{managerName(u.managerId)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}

const styles = {
  link: {
    color: "#e5e7eb",
    opacity: 0.85,
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 13,
  },
  card: {
    borderRadius: 18,
    background: "rgba(17,24,39,0.65)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
    padding: 18,
    backdropFilter: "blur(10px)",
  },
  title: { fontSize: 16, fontWeight: 900, marginBottom: 10 },
  form: { display: "grid", gap: 10 },
  input: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.25)",
    color: "#e5e7eb",
  },
  button: {
    marginTop: 6,
    padding: "10px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg,#6366f1,#10b981)",
    fontWeight: 800,
    cursor: "pointer",
  },
  msg: { marginTop: 8, fontSize: 13 },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
    marginTop: 10,
  },
  th: {
    textAlign: "left",
    padding: "10px 8px",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
    fontWeight: 800,
    opacity: 0.9,
  },
  td: {
    padding: "10px 8px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    opacity: 0.85,
  },
};
