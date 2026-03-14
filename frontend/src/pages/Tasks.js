import React, { useEffect, useState, useCallback } from "react";
import { tasksAPI } from "../api";
import toast from "react-hot-toast";

const EMPTY_FORM = { title: "", description: "", status: "PENDING", priority: "MEDIUM", dueDate: "" };

function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(task ? {
    title: task.title, description: task.description || "",
    status: task.status, priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
  } : EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, dueDate: form.dueDate || undefined };
      if (task) {
        await tasksAPI.update(task.id, payload);
        toast.success("Task updated!");
      } else {
        await tasksAPI.create(payload);
        toast.success("Task created!");
      }
      onSave();
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const fe = {};
        apiErrors.forEach((e) => { fe[e.field] = e.message; });
        setErrors(fe);
      } else {
        toast.error(err.response?.data?.message || "Failed to save task");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{task ? "Edit Task" : "New Task"}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input name="title" className="form-control" value={form.title} onChange={handleChange} required placeholder="Task title" />
            {errors.title && <p style={{ color: "var(--danger)", fontSize: "0.8rem" }}>{errors.title}</p>}
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" className="form-control" value={form.description} onChange={handleChange} rows={3} placeholder="Optional description" style={{ resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label>Status</label>
              <select name="status" className="form-control" value={form.status} onChange={handleChange}>
                {["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" className="form-control" value={form.priority} onChange={handleChange}>
                {["LOW", "MEDIUM", "HIGH"].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input name="dueDate" type="date" className="form-control" value={form.dueDate} onChange={handleChange} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : task ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", priority: "", search: "" });
  const [modal, setModal] = useState(null); // null | "create" | task object
  const [deleteId, setDeleteId] = useState(null);

  const fetchTasks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const res = await tasksAPI.getAll(params);
      setTasks(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTasks(1); }, [fetchTasks]);

  const handleDelete = async () => {
    try {
      await tasksAPI.delete(deleteId);
      toast.success("Task deleted");
      setDeleteId(null);
      fetchTasks(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">✅ Tasks</h1>
          <p className="page-subtitle">{pagination.total} task{pagination.total !== 1 ? "s" : ""} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal("create")}>+ New Task</button>
      </div>

      <div className="filters">
        <input className="form-control search-input" placeholder="🔍 Search tasks..." value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <select className="form-control" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          {["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
        <select className="form-control" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All Priorities</option>
          {["LOW", "MEDIUM", "HIGH"].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : tasks.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📭</div>
            <p className="empty-text">No tasks found</p>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{task.title}</div>
                      {task.description && <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{task.description.slice(0, 60)}{task.description.length > 60 ? "…" : ""}</div>}
                    </td>
                    <td><span className={`badge badge-${task.status.toLowerCase()}`}>{task.status.replace("_", " ")}</span></td>
                    <td><span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span></td>
                    <td style={{ color: "var(--text-muted)" }}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal(task)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(task.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-ghost btn-sm" disabled={pagination.page === 1} onClick={() => fetchTasks(pagination.page - 1)}>← Prev</button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button className="btn btn-ghost btn-sm" disabled={pagination.page === pagination.totalPages} onClick={() => fetchTasks(pagination.page + 1)}>Next →</button>
          </div>
        )}
      </div>

      {(modal === "create" || (modal && modal.id)) && (
        <TaskModal
          task={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchTasks(pagination.page); }}
        />
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 360 }}>
            <h2 className="modal-title">Delete Task?</h2>
            <p style={{ color: "var(--text-muted)", margin: "1rem 0" }}>This action cannot be undone.</p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
