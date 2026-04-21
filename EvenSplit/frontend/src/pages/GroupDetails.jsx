import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [participants, setParticipants] = useState([]);

  const [expenses, setExpenses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [balances, setBalances] = useState({});
  const [email, setEmail] = useState("");
  const [settlements, setSettlements] = useState([]);

  const [splits, setSplits] = useState([]);
  const [splitType, setSplitType] = useState("equal");

  useEffect(() => {
    fetchGroup();
    fetchExpenses();
    fetchBalances();
    fetchSettlements();
  }, [id, page]);

  useEffect(() => {
    if (group) {
      setSplits(
        group.members.map((member) => ({
          user: member._id,
          amount: 0,
          percentage: 0
        }))
      );
    }
  }, [group]);

  const fetchGroup = async () => {
    try {
      const res = await api.get(`/groups/${id}`);
      setGroup(res.data.group);
    } catch {
      alert("Failed to load group");
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    const res = await api.get(`/expenses/group/${id}?page=${page}&limit=5`);
    setExpenses(res.data.expenses || []);
    setTotalPages(res.data.totalPages || 1);
  };

  const fetchBalances = async () => {
    const res = await api.get(`/expenses/balance/${id}`);
    setBalances(res.data.balances || {});
  };

  const fetchSettlements = async () => {
    const res = await api.get(`/expenses/settlements/${id}`);
    setSettlements(res.data.settlements || []);
  };

  const handleCheckboxChange = (userId) => {
    setParticipants((prev) =>
      prev.includes(userId) ? prev.filter((pid) => pid !== userId) : [...prev, userId]
    );
  };

  const handleSplitChange = (userId, field, value) => {
    setSplits((prev) =>
      prev.map((s) => (s.user === userId ? { ...s, [field]: Number(value) } : s))
    );
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    try {
      const filteredSplits = splits
        .filter((s) => participants.includes(s.user))
        .filter((s) => (splitType === "exact" ? s.amount > 0 : s.percentage > 0));

      await api.post("/expenses", {
        groupId: id,
        description,
        amount: Number(amount),
        participants,
        splitType,
        splitsInput: splitType === "equal" ? [] : filteredSplits
      });

      alert("Expense added");
      setDescription("");
      setAmount("");
      setParticipants([]);
      fetchExpenses();
      fetchBalances();
      fetchSettlements();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add expense");
    }
  };

  const handleAddMember = async () => {
    try {
      await api.post(`/groups/${id}/add-member`, { email });
      setEmail("");
      fetchGroup();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add member");
    }
  };

  const handleDeleteGroup = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this group?");
    if (!confirmed) return;

    try {
      await api.delete(`/groups/${id}`);
      alert("Group deleted successfully");
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete group");
    }
  };

  const getUserName = (userId) => group?.members.find((m) => m._id === userId)?.name || "Unknown";

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="details-page">
          <div className="page-wrap">
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="details-page">
          <div className="page-wrap">
            <p>Group not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main className="details-page">
        <div className="page-wrap details-grid">
          <section className="section-header">
            <div>
              <h2>{group.name}</h2>
              <p>Manage members, expenses, balances, and settlements.</p>
            </div>
            <button className="btn btn-danger" onClick={handleDeleteGroup}>
              Delete Group
            </button>
          </section>

          <section className="card card-pad">
            <h3 style={{ marginBottom: "8px" }}>Members</h3>
            <ul className="member-list">
              {group.members.map((m) => (
                <li key={m._id}>
                  <strong>{m.name}</strong>
                  <p>{m.email}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="card card-pad">
            <h3 style={{ marginBottom: "10px" }}>Add Member</h3>
            <div className="form-stack" style={{ gridTemplateColumns: "1fr auto" }}>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
              <button className="btn btn-primary" onClick={handleAddMember}>Add</button>
            </div>
          </section>

          <section className="card card-pad">
            <h3 style={{ marginBottom: "10px" }}>Add Expense</h3>

            <form className="form-stack" onSubmit={handleAddExpense}>
              <input
                className="input"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              <input
                className="input"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />

              <select
                className="select"
                value={splitType}
                onChange={(e) => setSplitType(e.target.value)}
              >
                <option value="equal">Equal</option>
                <option value="exact">Exact</option>
                <option value="percentage">Percentage</option>
              </select>

              <div className="card card-pad" style={{ background: "var(--surface-soft)" }}>
                <h4 style={{ marginBottom: "8px" }}>Participants</h4>
                {group.members.map((m) => (
                  <label key={m._id} style={{ display: "block", marginBottom: "6px" }}>
                    <input
                      type="checkbox"
                      checked={participants.includes(m._id)}
                      onChange={() => handleCheckboxChange(m._id)}
                    />{" "}
                    {m.name}
                  </label>
                ))}
              </div>

              {splitType !== "equal" && (
                <div className="card card-pad" style={{ background: "var(--surface-soft)" }}>
                  <h4 style={{ marginBottom: "8px" }}>
                    {splitType === "exact" ? "Exact amount" : "Percentage split"}
                  </h4>

                  {group.members
                    .filter((m) => participants.includes(m._id))
                    .map((m) => {
                      const currentSplit = splits.find((s) => s.user === m._id);
                      return (
                        <div key={m._id} style={{ marginBottom: "8px" }}>
                          <strong>{m.name}</strong>
                          <input
                            className="input"
                            style={{ marginTop: "6px" }}
                            value={
                              splitType === "exact"
                                ? currentSplit?.amount || ""
                                : currentSplit?.percentage || ""
                            }
                            onChange={(e) =>
                              handleSplitChange(
                                m._id,
                                splitType === "exact" ? "amount" : "percentage",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      );
                    })}
                </div>
              )}

              <button className="btn btn-primary" type="submit">Add Expense</button>
            </form>
          </section>

          <section className="card card-pad">
            <h3 style={{ marginBottom: "8px" }}>Expenses</h3>
            <div className="expense-grid">
              {expenses.length === 0 && <p>No expenses yet.</p>}
              {expenses.map((exp) => (
                <article
                  key={exp._id}
                  className="card card-pad expense-card"
                  onClick={() => navigate(`/expense/${exp._id}`)}
                >
                  <div className="expense-row">
                    <strong>{exp.description}</strong>
                    <span>Amount: Rs {exp.amount}</span>
                    <span>Paid by: {exp.paidBy?.name || "Unknown"}</span>
                    <span>{new Date(exp.createdAt).toLocaleDateString()}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="pagination" style={{ marginTop: "10px" }}>
              <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Prev
              </button>
              <span>Page {page} / {totalPages}</span>
              <button
                className="btn btn-ghost"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </section>

          <section className="card card-pad badge-soft-warning">
            <h3 style={{ marginBottom: "8px" }}>Balances</h3>
            <ul className="kv-list">
              {Object.entries(balances)
                .filter(([, amt]) => amt !== 0)
                .map(([uid, amt]) => (
                  <li key={uid}>
                    {amt > 0
                      ? `${getUserName(uid)} should receive Rs ${amt}`
                      : `${getUserName(uid)} owes Rs ${Math.abs(amt)}`}
                  </li>
                ))}
            </ul>
          </section>

          <section className="card card-pad badge-soft-success">
            <h3 style={{ marginBottom: "8px" }}>Settlements</h3>
            <ul className="kv-list">
              {settlements.length === 0 && <li>No settlements yet.</li>}
              {settlements.map((s, i) => (
                <li key={`${s.from}-${s.to}-${i}`}>
                  {getUserName(s.from)} pays Rs {s.amount} to {getUserName(s.to)}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
