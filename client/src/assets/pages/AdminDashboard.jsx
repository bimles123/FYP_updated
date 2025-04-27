import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/AdminDashboard.css";

export default function AdminDashboard() {
  const [usersCount, setUsersCount] = useState(0);
  const [hotelsCount, setHotelsCount] = useState(0);
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);
  const [deletedHotels, setDeletedHotels] = useState([]);
  const [showReports, setShowReports] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showDeletedHotels, setShowDeletedHotels] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user?.role === "admin") {
      axios.get("/api/admin/reports").then(res => setReports(res.data));
      axios.get("/api/users").then(res => setUsersCount(res.data.length));
      axios.get("/api/hotels").then(res => {
        setHotelsCount(res.data.length);
        setDeletedHotels(res.data.filter(h => h.isDeleted)); // ✅ collect soft-deleted hotels
      });
      axios.get("/api/admin/logs").then(res => setLogs(res.data));
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

        <div className="card reports" onClick={() => setShowLogs(!showLogs)}>
          <h3>Audit Logs</h3>
          <div className="count">{logs.length}</div>
        </div>

        <div className="card reports" onClick={() => setShowDeletedHotels(!showDeletedHotels)}>
          <h3>Soft Deleted Hotels</h3>
          <div className="count">{deletedHotels.length}</div>
        </div>
      </div>

      {/* Hotel Reports Section */}
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

      {/* Audit Logs Section */}
      {showLogs && (
        <div className="reports-section">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">📁 Recent Audit Logs</h2>
          {logs.length === 0 ? (
            <p className="text-gray-500">No audit logs available.</p>
          ) : (
            logs.map((log) => (
              <div key={log._id} className="border border-gray-300 bg-white p-4 rounded shadow mb-4">
                <p>
                  <strong>Action:</strong> {log.action.replace(/-/g, ' ')}
                </p>
                <p>
                  <strong>User:</strong>{" "}
                  {log.user ? (
                    <>
                      <a href={`/user/${log.user._id}`} className="text-blue-600 hover:underline">
                        {log.user.name}
                      </a>{" "}
                      ({log.user.email})
                    </>
                  ) : (
                    <span className="text-red-500">Unknown User</span>
                  )}
                </p>
                <p>
                  <strong>Target:</strong> {log.targetType} — {log.targetId}
                </p>
                {log.details && Object.keys(log.details).length > 0 && (
                  <p className="text-sm mt-1 text-gray-600">
                    <strong>Details:</strong> {JSON.stringify(log.details)}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">🕒 {new Date(log.createdAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Soft Deleted Hotels Section */}
      {/* Soft Deleted Hotels Section */}
{showDeletedHotels && (
  <div className="reports-section">
    <h2 className="text-xl font-semibold mb-4 text-gray-800">🗑️ Soft Deleted Hotels</h2>
    {deletedHotels.length === 0 ? (
      <p className="text-gray-500">No soft deleted hotels found.</p>
    ) : (
      deletedHotels.map(hotel => (
        <div key={hotel._id} className="border border-yellow-400 bg-white p-4 rounded shadow mb-4">
          <h3 className="text-lg font-semibold">{hotel.name}</h3>
          <p><strong>Location:</strong> {hotel.location}</p>
          <p><strong>Price:</strong> ${hotel.pricePerNight}</p>
          <p><strong>Stars:</strong> {hotel.stars} ⭐</p>
          <p><strong>Status:</strong> <span className="text-red-600 font-semibold">Deleted</span></p>
          <p>
            <strong>Owner:</strong>{" "}
            <a href={`/user/${hotel.user?._id}`} className="text-blue-600 hover:underline">
              {hotel.user?.name || "Unknown"}
            </a>
          </p>

          <div className="mt-3 flex gap-3">
            <a
              href={`/hotel/${hotel._id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              🔍 View Hotel Page
            </a>

            <button
              onClick={async () => {
                if (window.confirm("Restore this hotel listing?")) {
                  await axios.put(`/api/admin/restore-hotel/${hotel._id}`, {
                    adminId: user.id
                  });
                  setDeletedHotels(prev => prev.filter(h => h._id !== hotel._id));
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded"
            >
              ♻️ Restore
            </button>

            <button
              onClick={async () => {
                if (window.confirm("⚠️ This will permanently delete the hotel. Proceed?")) {
                  await axios.delete(`/api/admin/permanent-delete-hotel/${hotel._id}`, {
                    data: { adminId: user.id }
                  });
                  setDeletedHotels(prev => prev.filter(h => h._id !== hotel._id));
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
            >
              ❌ Permanently Delete
            </button>
          </div>
        </div>
      ))
    )}
  </div>
)}

    </div>
  );
}
