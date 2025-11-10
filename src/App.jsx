// This file is no longer the main entry point
// Router configuration moved to src/router/index.jsx
// App-level functionality can be added here if needed in the future
import { ToastContainer } from "react-toastify";
import Layout from "@/components/organisms/Layout";
import Dashboard from "@/components/pages/Dashboard";
import Transactions from "@/components/pages/Transactions";
import Budgets from "@/components/pages/Budgets";
import Goals from "@/components/pages/Goals";
import Charts from "@/components/pages/Charts";

// App component no longer needed as entry point
// Router configuration handled by RouterProvider in main.jsx
// Layout component now handles the main application structure
export default function App() {
  return null;
}