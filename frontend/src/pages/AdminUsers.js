import React, { useEffect, useState, useCallback } from "react";
import { usersAPI } from "../api";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, ...(search && { search }) };
      const res = await usersAPI.getAll(params);
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  const toggleRole = async (user) => {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    try {
      await usersAPI.updateRole(user.id, newRole);
      toast.success(`${user.name} is now ${newRole}`);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleDelete = async () => {
    try {
      await usersAPI.delete(deleteId);
      toast.success("User deleted");
      setDeleteId(null);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">👥 Manage Users</h1>
          <p className="page-subtitle">{pagination.total} registered user{pagination.total !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="filters">
        <input className="form-control search-input" placeholder="🔍 Search users..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : users.length === 0 ? (
          <div className="empty"><div className="empty-icon">👤</div><p>No users found</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Tasks</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 500 }}>{user.name}</td>
                    <td style={{ color: "var(--text-muted)" }}>{user.email}</td>
                    <td><span className={`badge badge-${user.role.toLowerCase()}`}>{user.role}</span></td>
                    <td>{user._count?.tasks ?? 0}</td>
                    <td style={{ color: "var(--text-muted)" }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleRole(user)}
                          title={`Make ${user.role === "ADMIN" ? "User" : "Admin"}`}>
                          {user.role === "ADMIN" ? "⬇️ Demote" : "⬆️ Promote"}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(user.id)}>🗑️</button>
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
            <button className="btn btn-ghost btn-sm" disabled={pagination.page === 1} onClick={() => fetchUsers(pagination.page - 1)}>← Prev</button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button className="btn btn-ghost btn-sm" disabled={pagination.page === pagination.totalPages} onClick={() => fetchUsers(pagination.page + 1)}>Next →</button>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 360 }}>
            <h2 className="modal-title">Delete User?</h2>
            <p style={{ color: "var(--text-muted)", margin: "1rem 0" }}>This will also delete all their tasks. This cannot be undone.</p>
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
