import { BrowserRouter, Routes, Route} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import GroupDetails from "./pages/GroupDetails";
import ExpenseDetails from "./pages/ExpenseDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/group/:id" element={<GroupDetails />} />
        <Route path="/expense/:expenseId" element={<ExpenseDetails />} />
      </Routes>
    </BrowserRouter>
  );
} 

export default App;