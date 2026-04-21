import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function ExpenseDetails() {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isEdit = new URLSearchParams(location.search).get("edit") === "true";

  const [expense, setExpense] = useState(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetchExpense();
  }, []);

  const fetchExpense = async () => {
    try {
      const res = await api.get(`/expenses/${expenseId}`);
      setExpense(res.data.expense);
      setDescription(res.data.expense.description);
      setAmount(res.data.expense.amount);
    } catch {
      alert("Failed to load expense");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/expenses/${expenseId}`, {
        description,
        amount
      });

      alert("Expense updated");
      const groupId = expense.group?._id || expense.group;
      navigate(`/group/${groupId}`);
    } catch {
      alert("Failed to update expense");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure?");
    if (!confirmDelete) return;

    const groupId = expense.group?._id || expense.group;

    try {
      await api.delete(`/expenses/${expenseId}`);
      alert("Expense deleted");
      navigate(`/group/${groupId}`);
    } catch {
      alert("Failed to delete expense");
    }
  };

  const handleEdit = () => {
    navigate(`/expense/${expenseId}?edit=true`);
  };

  if (!expense) {
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

  return (
    <div className="app-shell">
      <Navbar />
      <main className="details-page">
        <div className="page-wrap">
          <section className="card card-pad">
            <div className="section-header" style={{ marginBottom: "8px" }}>
              <h2>{expense.description}</h2>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn btn-ghost" onClick={handleEdit}>Edit</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>

            {isEdit ? (
              <form className="form-stack" onSubmit={handleUpdate}>
                <input
                  className="input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  required
                />

                <input
                  className="input"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                  required
                />

                <button className="btn btn-primary" type="submit">Update Expense</button>
              </form>
            ) : (
              <>
                <ul className="kv-list" style={{ marginBottom: "12px" }}>
                  <li>
                    <strong>Amount:</strong> Rs {expense.amount}
                  </li>
                  <li>
                    <strong>Paid by:</strong> {expense.paidBy?.name || "Unknown"}
                  </li>
                </ul>

                <h3 style={{ marginBottom: "8px" }}>Splits</h3>
                <ul className="split-list card card-pad" style={{ background: "var(--surface-soft)" }}>
                  {expense.splits.map((s, i) => (
                    <li key={`${s.user?._id || i}-${i}`}>
                      {s.user?.name || "Unknown"}: Rs {s.amount}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
