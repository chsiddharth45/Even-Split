import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      if (res.data.user?.name) {
        localStorage.setItem("userName", res.data.user.name);
      }
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
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
              <h2>Split smarter, settle faster.</h2>
              <p>Track group expenses with less confusion and cleaner balances.</p>
            </div>
            <p>Live overview of who paid, who owes, and who should receive.</p>
          </aside>

          <div className="auth-panel">
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-sub">Login to continue managing your groups.</p>

            <form className="form-stack" onSubmit={handleLogin}>
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
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            <p className="switch-text">
              New user?{" "}
              <button className="switch-link" onClick={() => navigate("/register")}>Register</button>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
