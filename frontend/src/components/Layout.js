import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">⚡ TaskFlow</div>
        <nav>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            ✅ My Tasks
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              👥 Manage Users
            </NavLink>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <strong>{user?.name}</strong>
            {user?.role}
          </div>
          <button className="btn btn-ghost btn-full btn-sm" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
