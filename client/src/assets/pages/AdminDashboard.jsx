import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/AdminDashboard.css";

export default function AdminDashboard() {
  const [usersCount, setUsersCount] = useState(0);
  const [hotelsCount, setHotelsCount] = useState(0);
  const [reports, setReports] = useState([]);
  const [showReports, setShowReports] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user?.role === "admin") {
      axios.get("/api/admin/reports").then(res => setReports(res.data));
      axios.get("/api/users").then(res => setUsersCount(res.data.length));
      axios.get("/api/hotels").then(res => setHotelsCount(res.data.length));
    }
  }, [user]);

  if (!user || user.role !== "admin") {
    return <div className="text-center mt-10 text-red-600">⛔ Access denied. Admins only.</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">📊 Admin Dashboard</h1>

      <div className="summary-cards">
        <div className="card users">
          <h3>Total Users</h3>
          <div className="count">{usersCount}</div>
        </div>

        <div className="card hotels">
          <h3>Total Hotels</h3>
          <div className="count">{hotelsCount}</div>
        </div>

        <div className="card reports" onClick={() => setShowReports(!showReports)}>
          <h3>Hotel Reports</h3>
          <div className="count">{reports.length}</div>
        </div>
      </div>

      {showReports && (
        <div className="reports-section">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">🚩 Reported Hotels</h2>
          {reports.length === 0 ? (
            <p className="text-gray-500">No reports submitted.</p>
          ) : (
            reports.map((r) => (
              <div key={r._id} className="border border-red-300 bg-white p-4 rounded shadow mb-4">
                <p>
                  <strong>Hotel:</strong>{" "}
                  <a href={`/hotel/${r.hotel._id}`} className="text-blue-600 hover:underline">
                    {r.hotel.name}
                  </a>
                </p>
                <p>
                  <strong>Reporter:</strong>{" "}
                  <a href={`/user/${r.reporter._id}`} className="text-blue-600 hover:underline">
                    {r.reporter.name}
                  </a>{" "}
                  ({r.reporter.email})
                </p>
                <p>
                  <strong>Reason:</strong> {r.reason}
                </p>
                <p>
                  <strong>Details:</strong> {r.details || "No additional details"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  🕒 {new Date(r.createdAt).toLocaleString()}
                </p>

                <button
                  onClick={async () => {
                    if (window.confirm("Mark this report as addressed and remove it?")) {
                      await axios.delete(`/api/admin/reports/${r._id}`);
                      setReports((prev) => prev.filter((x) => x._id !== r._id));
                    }
                  }}
                  className="mt-3 bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded"
                >
                  ✅ Mark as Addressed
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
