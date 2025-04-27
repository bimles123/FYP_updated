import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/AdminDashboard.css";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [hotelsCount, setHotelsCount] = useState(0);
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);
  const [deletedHotels, setDeletedHotels] = useState([]);
  const [payments, setPayments] = useState([]);

  const [showReports, setShowReports] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showDeletedHotels, setShowDeletedHotels] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showPayments, setShowPayments] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState(() => () => {});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, hotelRes, reportRes, logRes, paymentRes] = await Promise.all([
          axios.get("/api/users"),
          axios.get("/api/hotels"),
          axios.get("/api/admin/reports"),
          axios.get("/api/admin/logs"),
          axios.get("/api/admin/payments"),
        ]);

        setUsers(userRes.data);
        setUsersCount(userRes.data.length);
        setHotelsCount(hotelRes.data.length);
        setDeletedHotels(hotelRes.data.filter((h) => h.isDeleted));
        setReports(reportRes.data);
        setLogs(logRes.data);
        setPayments(paymentRes.data);
      } catch (err) {
        console.error("Error loading admin dashboard data", err);
        setErrorMessage("❌ Some resources failed to load. Please check server connection.");
      }
    };

    if (user?.role === "admin") {
      fetchData();
    }
  }, [user]);

  const updateUserStatus = async (userId, status) => {
    if (userId === user.id) {
      alert("⛔ You cannot ban or unban yourself.");
      return;
    }

    try {
      const res = await axios.put(`/api/admin/users/${userId}`, { status });
      setUsers(prev =>
        prev.map(u =>
          u._id === userId ? { ...u, status: res.data.status } : u
        )
      );
    } catch (err) {
      console.error("Failed to update user status:", err);
      alert("❌ Failed to update user status.");
    }
  };

  if (!user || user.role !== "admin") {
    return <div className="text-center mt-10 text-red-600">⛔ Access denied. Admins only.</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">📊 Admin Dashboard</h1>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <div className="summary-cards">
        <div className="card users" onClick={() => setShowUsers(!showUsers)}>
          <h3>All Users</h3>
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

        <div className="card reports" onClick={() => setShowPayments(!showPayments)}>
          <h3>Payments</h3>
          <div className="count">{payments.length}</div>
        </div>
      </div>

      {showUsers && (
        <div className="reports-section">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">👥 All Users</h2>
          {users.map((u) => (
            <div key={u._id} className="border p-4 rounded shadow mb-3 bg-white">
              <p><strong>Name:</strong> {u.name} ({u.email})</p>
              <p><strong>Status:</strong> {u.status}</p>

              <div className="mt-2">
                <button
                  onClick={() => updateUserStatus(u._id, u.status === "banned" ? "active" : "banned")}
                  className={`px-3 py-1 rounded text-white ${u.status === "banned" ? "bg-green-600" : "bg-red-600"}`}
                >
                  {u.status === "banned" ? "Unban" : "Ban"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPayments && (
        <div className="reports-section">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">💳 Payment Records</h2>
          {payments.map((p) => (
            <div key={p._id} className="border p-4 rounded shadow mb-3 bg-white">
              <p><strong>User:</strong> {p.user?.name} ({p.user?.email})</p>
              <p><strong>Hotel:</strong> {p.hotel?.name}</p>
              <p><strong>Amount:</strong> Rs. {p.amount}</p>
              <p className="text-sm text-gray-500">🕒 {new Date(p.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {showReports && (
        <div className="reports-section">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">🚩 Reported Hotels</h2>
          {reports.length === 0 ? (
            <p className="text-gray-500">No reports submitted.</p>
          ) : (
            reports.map((r) => (
              <div key={r._id} className="border border-red-300 bg-white p-4 rounded shadow mb-4">
                <p><strong>Hotel:</strong>{" "}
                  <a href={`/hotel/${r.hotel._id}`} className="text-blue-600 hover:underline">
                    {r.hotel.name}
                  </a>
                </p>
                <p><strong>Reporter:</strong>{" "}
                  <a href={`/user/${r.reporter._id}`} className="text-blue-600 hover:underline">
                    {r.reporter.name}
                  </a>{" "}
                  ({r.reporter.email})
                </p>
                <p><strong>Reason:</strong> {r.reason}</p>
                <p><strong>Details:</strong> {r.details || "No additional details"}</p>
                <p className="text-sm text-gray-500 mt-1">🕒 {new Date(r.createdAt).toLocaleString()}</p>

                <button
                  onClick={() => {
                    setConfirmMessage("Mark this report as addressed and remove it?");
                    setOnConfirm(() => async () => {
                      await axios.delete(`/api/admin/reports/${r._id}`);
                      setReports((prev) => prev.filter((x) => x._id !== r._id));
                      setShowConfirmModal(false);
                    });
                    setShowConfirmModal(true);
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

      {showLogs && (
        <div className="reports-section">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">📁 Recent Audit Logs</h2>
          {logs.length === 0 ? (
            <p className="text-gray-500">No audit logs available.</p>
          ) : (
            logs.map((log) => (
              <div key={log._id} className="border border-gray-300 bg-white p-4 rounded shadow mb-4">
                <p><strong>Action:</strong> {log.action.replace(/-/g, ' ')}</p>
                <p><strong>User:</strong> {log.user ? (
                  <><a href={`/user/${log.user._id}`} className="text-blue-600 hover:underline">{log.user.name}</a> ({log.user.email})</>
                ) : (
                  <span className="text-red-500">Unknown User</span>
                )}</p>
                <p><strong>Target:</strong> {log.targetType} — {log.targetId}</p>
                {log.details && Object.keys(log.details).length > 0 && (
                  <p className="text-sm mt-1 text-gray-600"><strong>Details:</strong> {JSON.stringify(log.details)}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">🕒 {new Date(log.createdAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      )}

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
                <p><strong>Owner:</strong> <a href={`/user/${hotel.user?._id}`} className="text-blue-600 hover:underline">{hotel.user?.name || "Unknown"}</a></p>

                <div className="mt-3 flex gap-3">
                  <a href={`/hotel/${hotel._id}`} className="text-sm text-blue-600 hover:underline">🔍 View Hotel Page</a>

                  <button
                    onClick={() => {
                      setConfirmMessage("Restore this hotel listing?");
                      setOnConfirm(() => async () => {
                        await axios.put(`/api/admin/restore-hotel/${hotel._id}`, { adminId: user.id });
                        setDeletedHotels(prev => prev.filter(h => h._id !== hotel._id));
                        setShowConfirmModal(false);
                      });
                      setShowConfirmModal(true);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded"
                  >
                    ♻️ Restore
                  </button>

                  <button
                    onClick={() => {
                      setConfirmMessage("⚠️ This will permanently delete the hotel. Proceed?");
                      setOnConfirm(() => async () => {
                        await axios.delete(`/api/admin/permanent-delete-hotel/${hotel._id}`, { data: { adminId: user.id } });
                        setDeletedHotels(prev => prev.filter(h => h._id !== hotel._id));
                        setShowConfirmModal(false);
                      });
                      setShowConfirmModal(true);
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

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center animate-fade-in">
            <h2 className="text-lg font-semibold text-red-600 mb-3">Please Confirm</h2>
            <p className="text-gray-700 mb-6">{confirmMessage}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
