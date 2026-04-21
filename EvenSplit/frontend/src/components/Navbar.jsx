import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthed = Boolean(localStorage.getItem("token"));
  const isAuthPage = location.pathname === "/" || location.pathname === "/register";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const userInitial = localStorage.getItem("userName")?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="top-nav">
      <div className="top-nav__content">
        <div className="brand" onClick={() => navigate(isAuthed ? "/dashboard" : "/") }>
          <div className="brand__dot">$</div>
          <span className="brand__text">EvenSplit</span>
        </div>

        {isAuthed && (
          <div className="nav-links">
            <button className="nav-link" onClick={() => navigate("/dashboard")}>Dashboard</button>
            <button className="nav-link" onClick={() => navigate("/dashboard")}>Groups</button>
          </div>
        )}

        <div className="nav-side">
          {isAuthed ? (
            <>
              <div className="avatar">{userInitial}</div>
              <button className="btn btn-accent" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            !isAuthPage && (
              <button className="btn btn-primary" onClick={() => navigate("/")}>Login</button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
