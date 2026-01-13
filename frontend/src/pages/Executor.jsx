// Pagina Executor: vizualizare task-uri alocate și marcare ca realizate

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";

const API_URL = "https://task-planner-tw-1.onrender.com";

export default function Executor() {
  // Token JWT pentru apeluri către backend
  const token = localStorage.getItem("token");

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgKind, setMsgKind] = useState("info");

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

  // Încarcă task-urile executorului curent
  async function loadMyTasks() {
    setLoading(true);
    setMsg("");
    try {
      const data = await api("/api/tasks/my");
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      setMsgKind("error");
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Marchează un task ca realizat (COMPLETED)
  async function completeTask(taskId) {
    try {
      await api(`/api/tasks/${taskId}/complete`, { method: "POST" });
      setMsgKind("success");
      setMsg(`Task #${taskId} marked as COMPLETED.`);
      await loadMyTasks();
    } catch (e) {
      setMsgKind("error");
      setMsg(e.message);
    }
  }

  // Badge vizual pentru statusul task-ului
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
    if (status === "PENDING") return <span style={{ ...base, background: "rgba(245,158,11,0.16)" }}>PENDING</span>;
    if (status === "COMPLETED") return <span style={{ ...base, background: "rgba(16,185,129,0.16)" }}>COMPLETED</span>;
    if (status === "CLOSED") return <span style={{ ...base, background: "rgba(148,163,184,0.16)" }}>CLOSED</span>;
    return <span style={base}>{status}</span>;
  }

  useEffect(() => {
    loadMyTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppLayout title="Executor Dashboard">
      <div style={{ marginBottom: 12, display: "flex", gap: 10, alignItems: "center" }}>
        <Link to="/history" style={styles.link}>
          Go to History →
        </Link>

        <button onClick={loadMyTasks} style={styles.btnGhost} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div style={styles.card}>
        <div>
          <div style={styles.cardTitle}>My tasks</div>
          <div style={styles.cardSub}>Complete PENDING tasks</div>
        </div>

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

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={3} style={styles.empty}>
                    No tasks assigned to you.
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
                      {t.status === "PENDING" ? (
                        <button style={styles.btnPrimary} onClick={() => completeTask(t.id)}>
                          Complete
                        </button>
                      ) : (
                        <span style={{ opacity: 0.7, fontSize: 12 }}>No action</span>
                      )}
                    </td>
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

const styles = {
  link: { color: "#e5e7eb", opacity: 0.85, textDecoration: "none", fontWeight: 800, fontSize: 13 },
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

  btnPrimary: {
    padding: "8px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "linear-gradient(90deg, rgba(16,185,129,0.9), rgba(99,102,241,0.85))",
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

  msg: { margin: "12px 0", padding: "10px 12px", borderRadius: 12, fontSize: 13, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" },
  msgError: { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)" },
  msgSuccess: { background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.35)" },

  tableWrap: { marginTop: 12, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: 12, opacity: 0.75, padding: "12px 12px", background: "rgba(0,0,0,0.22)", borderBottom: "1px solid rgba(255,255,255,0.10)" },
  td: { padding: "12px 12px", verticalAlign: "top", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  empty: { padding: 16, opacity: 0.75 },
};
