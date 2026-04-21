import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get("/groups");
      setGroups(res.data.groups || []);
    } catch {
      alert("Failed to fetch groups");
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/groups", {
        name: groupName,
        members: []
      });

      setGroupName("");
      setShowForm(false);
      fetchGroups();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />

      <main className="dashboard">
        <div className="page-wrap">
          <div className="section-header">
            <div>
              <h2>My Groups</h2>
              <p>Open a group to add expenses and track balances in real time.</p>
            </div>

            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? "Close" : "Create Group"}
            </button>
          </div>

          {showForm && (
            <section className="card card-pad" style={{ marginBottom: "14px" }}>
              <form className="form-stack" onSubmit={handleCreateGroup}>
                <input
                  className="input"
                  type="text"
                  placeholder="Group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Group"}
                </button>
              </form>
            </section>
          )}

          {groups.length === 0 ? (
            <section className="card empty-state">
              <h3>No groups yet</h3>
              <p>Create your first group to start splitting expenses.</p>
            </section>
          ) : (
            <section className="group-list">
              {groups.map((group) => (
                <article
                  key={group._id}
                  className="card group-card"
                  onClick={() => navigate(`/group/${group._id}`)}
                >
                  <div>
                    <h3>{group.name}</h3>
                    <p>Created by {group.createdBy?.name || "Unknown"}</p>
                  </div>
                  <span className="pill">View details</span>
                </article>
              ))}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
