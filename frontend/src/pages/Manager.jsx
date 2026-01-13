// Pagina Manager: creare task-uri, asignare către executori și închidere task-uri

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";

const API_URL = "https://task-planner-tw-1.onrender.com";

export default function Manager() {
  // Token JWT pentru apeluri către backend
  const token = localStorage.getItem("token");

  const [tasks, setTasks] = useState([]);
  const [executors, setExecutors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Datele formularului de creare task
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [msg, setMsg] = useState("");
  const [msgKind, setMsgKind] = useState("info"); // info | error | success

  // Select executor pentru fiecare task (taskId -> executorId)
  const [assignPick, setAssignPick] = useState({});

  // Helper pentru apeluri API autentificate
  async function api(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
    return data;
  }

  // Încarcă lista de executori (pentru asignare)
  async function loadExecutors() {
    const users = await api("/api/users");
    const execs = (Array.isArray(users) ? users : []).filter((u) => u.role === "EXECUTOR");
    setExecutors(execs);
  }

  // Încarcă task-urile managerului curent
  async function loadTasks() {
    const data = await api("/api/tasks");
    setTasks(Array.isArray(data) ? data : []);
  }

  // Refresh general (task-uri + executori)
  async function refreshAll() {
    setLoading(true);
    setMsg("");
    try {
      await Promise.all([loadTasks(), loadExecutors()]);
    } catch (e) {
      setMsgKind("error");
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Creează un task nou (status OPEN)
  async function createTask(e) {
    e.preventDefault();
    setMsg("");

    if (!title.trim() || !description.trim()) {
      setMsgKind("error");
      setMsg("Title & description are required.");
      return;
    }

    try {
      await api("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      });

      setTitle("");
      setDescription("");

      setMsgKind("success");
      setMsg("Task created (OPEN).");
      await loadTasks();
    } catch (e) {
      setMsgKind("error");
      setMsg(e.message);
    }
  }

  // Asignează task-ul unui executor (PENDING)
  async function assignTask(taskId) {
    const executorId = Number(assignPick[taskId] || 0);
    if (!executorId) {
      setMsgKind("error");
      setMsg("Pick an executor first.");
      return;
    }

    try {
      await api(`/api/tasks/${taskId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: executorId }),
      });

      setMsgKind("success");
      setMsg(`Assigned task #${taskId} (PENDING).`);
      await loadTasks();
    } catch (e) {
      setMsgKind("error");
      setMsg(e.message);
    }
  }

  // Închide un task finalizat (CLOSED)
  async function closeTask(taskId) {
    try {
      await api(`/api/tasks/${taskId}/close`, { method: "POST" });

      setMsgKind("success");
      setMsg(`Closed task #${taskId} (CLOSED).`);
      await loadTasks();
    } catch (e) {
      setMsgKind("error");
      setMsg(e.message);
    }
  }

  // Badge vizual pentru status
  function badge(status) {
    const base = {
      padding: "6px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 800,
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(255,255,255,0.06)",
      display: "inline-block",
    };
    if (status === "OPEN") return <span style={{ ...base, background: "rgba(99,102,241,0.16)" }}>OPEN</span>;
    if (status === "PENDING") return <span style={{ ...base, background: "rgba(245,158,11,0.16)" }}>PENDING</span>;
    if (status === "COMPLETED") return <span style={{ ...base, background: "rgba(16,185,129,0.16)" }}>COMPLETED</span>;
    if (status === "CLOSED") return <span style={{ ...base, background: "rgba(148,163,184,0.16)" }}>CLOSED</span>;
    return <span style={base}>{status}</span>;
  }

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppLayout title="Manager Dashboard">
      <div style={{ marginBottom: 12, display: "flex", gap: 10, alignItems: "center" }}>
        <Link to="/history" style={styles.link}>
          Go to History →
        </Link>

        <button onClick={refreshAll} style={styles.btnGhost} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div style={styles.grid}>
        {/* Formular creare task */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Create task</div>
          <div style={styles.cardSub}>
            New tasks start as <b>OPEN</b>
          </div>

          <form onSubmit={createTask} style={{ display: "grid", gap: 10, marginTop: 14 }}>
            <label style={styles.label}>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement login page"
              style={styles.input}
            />

            <label style={styles.label}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What needs to be done? Acceptance criteria?"
              rows={5}
              style={{ ...styles.input, resize: "vertical" }}
            />

            <button style={styles.btnPrimary} disabled={loading}>
              + Create
            </button>
          </form>

          {msg ? (
            <div
              style={{
                ...styles.msg,
                ...(msgKind === "error" ? styles.msgError : {}),
                ...(msgKind === "success" ? styles.msgSuccess : {}),
              }}
            >
              {msg}
            </div>
          ) : null}
        </div>

        {/* Listă task-uri */}
        <div style={{ ...styles.card, overflow: "hidden" }}>
          <div>
            <div style={styles.cardTitle}>My tasks</div>
            <div style={styles.cardSub}>Assign OPEN tasks • Close COMPLETED tasks</div>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Assignment</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={styles.empty}>
                      No tasks yet. Create one on the left.
                    </td>
                  </tr>
                ) : (
                  tasks.map((t) => (
                    <tr key={t.id}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 900 }}>{t.title}</div>
                        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>{t.description}</div>
                      </td>

                      <td style={styles.td}>{badge(t.status)}</td>

                      <td style={styles.td}>
                        {t.status === "OPEN" ? (
                          <select
                            value={assignPick[t.id] || ""}
                            onChange={(e) => setAssignPick((p) => ({ ...p, [t.id]: e.target.value }))}
                            style={styles.select}
                          >
                            <option value="">Pick executor...</option>
                            {executors.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name} ({u.email})
                              </option>
                            ))}
                          </select>
                        ) : t.assignedToId ? (
                          <span style={{ opacity: 0.85 }}>Executor #{t.assignedToId}</span>
                        ) : (
                          <span style={{ opacity: 0.7 }}>—</span>
                        )}
                      </td>

                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {t.status === "OPEN" ? (
                            <button style={styles.btnSmall} onClick={() => assignTask(t.id)} type="button">
                              Assign → PENDING
                            </button>
                          ) : null}

                          {t.status === "COMPLETED" ? (
                            <button style={styles.btnSmall} onClick={() => closeTask(t.id)} type="button">
                              Close → CLOSED
                            </button>
                          ) : null}

                          {t.status !== "OPEN" && t.status !== "COMPLETED" ? (
                            <span style={{ fontSize: 12, opacity: 0.7 }}>No action</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={styles.footerNote}>
            Flow: <b>OPEN → PENDING → COMPLETED → CLOSED</b>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const styles = {
  link: { color: "#e5e7eb", opacity: 0.85, textDecoration: "none", fontWeight: 800, fontSize: 13 },

  grid: { display: "grid", gridTemplateColumns: "420px 1fr", gap: 18, alignItems: "start" },

  card: {
    borderRadius: 18,
    background: "rgba(17,24,39,0.65)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
    padding: 18,
    backdropFilter: "blur(10px)",
  },

  cardTitle: { fontSize: 15, fontWeight: 900 },
  cardSub: { fontSize: 12, opacity: 0.75, marginTop: 4 },

  label: { fontSize: 12, opacity: 0.85, marginTop: 4 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.22)",
    color: "#e5e7eb",
    outline: "none",
  },
  select: {
    width: "100%",
    padding: "10px 10px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.22)",
    color: "#e5e7eb",
    outline: "none",
  },

  btnPrimary: {
    marginTop: 6,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "linear-gradient(90deg, rgba(99,102,241,0.9), rgba(16,185,129,0.85))",
    color: "#07101f",
    fontWeight: 900,
    cursor: "pointer",
  },
  btnGhost: {
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#e5e7eb",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 800,
  },
  btnSmall: {
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#e5e7eb",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 800,
  },

  msg: { marginTop: 12, padding: "10px 12px", borderRadius: 12, fontSize: 13, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" },
  msgError: { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)" },
  msgSuccess: { background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.35)" },

  tableWrap: { marginTop: 14, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: 12, opacity: 0.75, padding: "12px 12px", background: "rgba(0,0,0,0.22)", borderBottom: "1px solid rgba(255,255,255,0.10)" },
  td: { padding: "12px 12px", verticalAlign: "top", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  empty: { padding: 16, opacity: 0.75 },

  footerNote: { marginTop: 12, fontSize: 12, opacity: 0.75 },
};
