import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/register", { name, email, password });
      alert("User registered successfully");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <section className="hero-auth">
        <div className="auth-grid">
          <aside className="auth-visual">
            <div>
              <h2>Build clear money habits with your group.</h2>
              <p>One shared place for every trip, dinner, and split bill.</p>
            </div>
            <p>Get started in under a minute and keep expenses transparent.</p>
          </aside>

          <div className="auth-panel">
            <h2 className="auth-title">Create account</h2>
            <p className="auth-sub">Start your first split group today.</p>

            <form className="form-stack" onSubmit={handleRegister}>
              <input
                className="input"
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                className="input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="field-row">
                <input
                  className="input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>

            <p className="switch-text">
              Already have an account?{" "}
              <button className="switch-link" onClick={() => navigate("/")}>Login</button>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
