import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { tasksAPI } from "../api";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  PENDING: "var(--warning)", IN_PROGRESS: "var(--primary)",
  COMPLETED: "var(--success)", CANCELLED: "var(--danger)",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          tasksAPI.getStats(),
          tasksAPI.getAll({ limit: 5, sortBy: "createdAt", sortOrder: "desc" }),
        ]);
        setStats(statsRes.data.data);
        setRecentTasks(tasksRes.data.data);
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const statusMap = {};
  stats?.byStatus?.forEach((s) => { statusMap[s.status] = s._count.status; });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">👋 Hey, {user?.name?.split(" ")[0]}!</h1>
          <p className="page-subtitle">Here's what's happening with your tasks.</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Tasks</div>
          <div className="stat-value">{stats?.total ?? 0}</div>
        </div>
        {["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((s) => (
          <div className="stat-card" key={s}>
            <div className="stat-label">{s.replace("_", " ")}</div>
            <div className="stat-value" style={{ color: STATUS_COLORS[s] }}>
              {statusMap[s] ?? 0}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 style={{ marginBottom: "1rem", fontSize: "1rem", fontWeight: 700 }}>Recent Tasks</h2>
        {recentTasks.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📭</div>
            <p className="empty-text">No tasks yet. Create your first one!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task) => (
                  <tr key={task.id}>
                    <td style={{ fontWeight: 500 }}>{task.title}</td>
                    <td>
                      <span className={`badge badge-${task.status.toLowerCase()}`}>
                        {task.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
