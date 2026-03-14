import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      await register(form.name, form.email, form.password);
      toast.success("Account created! Welcome 🎉");
      navigate("/dashboard");
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const fieldErrors = {};
        apiErrors.forEach((e) => { fieldErrors[e.field] = e.message; });
        setErrors(fieldErrors);
      } else {
        toast.error(err.response?.data?.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">⚡</div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Start managing your tasks today</p>

        <form onSubmit={handleSubmit}>
          {["name", "email", "password"].map((field) => (
            <div className="form-group" key={field}>
              <label style={{ textTransform: "capitalize" }}>{field}</label>
              <input
                name={field}
                type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                className="form-control"
                placeholder={field === "name" ? "John Doe" : field === "email" ? "you@example.com" : "Min 8 chars, upper+lower+number"}
                value={form[field]}
                onChange={handleChange}
                required
              />
              {errors[field] && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors[field]}</p>}
            </div>
          ))}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner" /> : "Create Account"}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
