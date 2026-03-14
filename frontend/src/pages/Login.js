import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
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
      await login(form.email, form.password);
      toast.success("Welcome back! 🎉");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const fieldErrors = {};
        apiErrors.forEach((e) => { fieldErrors[e.field] = e.message; });
        setErrors(fieldErrors);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">⚡</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your TaskFlow account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              name="email" type="email" className="form-control"
              placeholder="you@example.com" value={form.email}
              onChange={handleChange} required autoFocus
            />
            {errors.email && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.email}</p>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              name="password" type="password" className="form-control"
              placeholder="••••••••" value={form.password}
              onChange={handleChange} required
            />
            {errors.password && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.password}</p>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner" /> : "Sign In"}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
