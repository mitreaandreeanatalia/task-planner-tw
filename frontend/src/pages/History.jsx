// Pagina History: istoricul task-urilor (propriu) + pentru manager istoricul unui executor

import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";

const API_URL = "http://localhost:7000";

export default function History() {
  // Token pentru apelurile către backend
  const token = localStorage.getItem("token");

  // Utilizatorul logat (rolul decide ce istoric vede)
  const me = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const isManager = me?.role === "MANAGER";

  const [tasks, setTasks] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Pentru manager: listă de executori + select
  const [users, setUsers] = useState([]);
  const [usersErr, setUsersErr] = useState("");
  const [mode, setMode] = useState("MY"); // MY | EXECUTOR
  const [selectedExecutorId, setSelectedExecutorId] = useState("");

  // Executorii care aparțin managerului curent
  const myExecutors = useMemo(() => {
    if (!isManager) return [];
    return users.filter((u) => u.role === "EXECUTOR" && u.managerId === me.id);
  }, [users, isManager, me?.id]);

  // Încarcă istoricul pentru utilizatorul curent
  async function loadHistory() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${API_URL}/api/tasks/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load history");
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  // Încarcă istoricul pentru un executor selectat (doar manager)
  async function loadExecutorHistory(executorId) {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(
        `${API_URL}/api/tasks/history/executor/${executorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load executor history");
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  // Manager: încarcă utilizatorii pentru dropdown-ul de executori
  async function loadUsers() {
    if (!isManager) return;
    setUsersErr("");
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setUsersErr(e.message);
      setUsers([]);
    }
  }

  useEffect(() => {
    loadHistory();
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manager: schimbă între istoricul propriu și istoricul unui executor
  useEffect(() => {
    if (!isManager) return;

    if (mode === "MY") {
      loadHistory();
      return;
    }

    if (mode === "EXECUTOR") {
      if (!selectedExecutorId) {
        setTasks([]);
        setErr("Select an executor to view history.");
        return;
      }
      loadExecutorHistory(selectedExecutorId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedExecutorId]);

  // Refresh în funcție de modul curent
  function onRefresh() {
    if (isManager && mode === "EXECUTOR" && selectedExecutorId) {
      loadExecutorHistory(selectedExecutorId);
      return;
    }
    loadHistory();
  }

  return (
    <AppLayout title="History">
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <div style={{ fontWeight: 900 }}>Task History</div>
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
              Shows tasks depending on role (manager/executor/admin)
            </div>
          </div>

          <button onClick={onRefresh} style={btn} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Manager: selectează istoricul unui executor */}
        {isManager ? (
          <div style={filterRow}>
            <label style={radio}>
              <input
                type="radio"
                name="mode"
                checked={mode === "MY"}
                onChange={() => {
                  setErr("");
                  setMode("MY");
                }}
              />{" "}
              My history
            </label>

            <label style={radio}>
              <input
                type="radio"
                name="mode"
                checked={mode === "EXECUTOR"}
                onChange={() => {
                  setErr("");
                  setMode("EXECUTOR");
                }}
              />{" "}
              Executor history
            </label>

            {mode === "EXECUTOR" ? (
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <select
                  value={selectedExecutorId}
                  onChange={(e) => setSelectedExecutorId(e.target.value)}
                  style={select}
                >
                  <option value="">Select executor...</option>
                  {myExecutors.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>

                {usersErr ? (
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Users: {usersErr}</div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {err ? <div style={errBox}>{err}</div> : null}

        <div style={{ marginTop: 12, overflow: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.22)" }}>
                <th style={th}>ID</th>
                <th style={th}>Title</th>
                <th style={th}>Status</th>
                <th style={th}>AssignedTo</th>
                <th style={th}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} style={empty}>No history yet.</td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t.id}>
                    <td style={td}>{t.id}</td>
                    <td style={td}>
                      <div style={{ fontWeight: 900 }}>{t.title}</div>
                      <div style={{ fontSize: 12, opacity: 0.75 }}>{t.description}</div>
                    </td>
                    <td style={td}>{t.status}</td>
                    <td style={td}>{t.assignedToId ?? "—"}</td>
                    <td style={td}>{t.updatedAt ? new Date(t.updatedAt).toLocaleString() : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

const card = {
  borderRadius: 18,
  background: "rgba(17,24,39,0.65)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  padding: 18,
  backdropFilter: "blur(10px)",
};

const btn = {
  padding: "8px 10px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "#e5e7eb",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 800,
};

const filterRow = {
  marginTop: 12,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(0,0,0,0.18)",
  display: "flex",
  gap: 14,
  alignItems: "center",
  flexWrap: "wrap",
};

const radio = { fontSize: 12, opacity: 0.9, display: "flex", gap: 6, alignItems: "center" };

const select = {
  padding: "8px 10px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.25)",
  color: "#e5e7eb",
  outline: "none",
  fontSize: 12,
};

const errBox = {
  marginTop: 12,
  padding: "10px 12px",
  borderRadius: 12,
  fontSize: 13,
  background: "rgba(239,68,68,0.12)",
  border: "1px solid rgba(239,68,68,0.35)",
};

const th = {
  textAlign: "left",
  fontSize: 12,
  opacity: 0.75,
  padding: "12px 12px",
  borderBottom: "1px solid rgba(255,255,255,0.10)",
};

const td = {
  padding: "12px 12px",
  verticalAlign: "top",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const empty = { padding: 16, opacity: 0.75 };
