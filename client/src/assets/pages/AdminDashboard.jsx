"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import "../css/AdminDashboard.css"

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [usersCount, setUsersCount] = useState(0)
  const [hotels, setHotels] = useState([])
  const [hotelsCount, setHotelsCount] = useState(0)
  const [reports, setReports] = useState([])
  const [logs, setLogs] = useState([])
  const [payments, setPayments] = useState([])

  // Only one panel shows at a time
  const [activePanel, setActivePanel] = useState("") // "users", "hotels", "reports", "logs", "payments"

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState("")
  const [onConfirm, setOnConfirm] = useState(() => () => {})
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"))
    setUser(storedUser)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, hotelRes, reportRes, logRes, paymentRes] = await Promise.all([
          axios.get("/api/users"),
          axios.get("/api/hotels"),
          axios.get("/api/admin/reports"),
          axios.get("/api/admin/logs"),
          axios.get("/api/admin/payments"),
        ])
        setUsers(userRes.data)
        setUsersCount(userRes.data.length)
        setHotels(hotelRes.data)
        setHotelsCount(hotelRes.data.length)
        setReports(reportRes.data)
        setLogs(logRes.data)
        setPayments(paymentRes.data)
      } catch (err) {
        console.error("Error loading admin dashboard data", err)
        setErrorMessage("❌ Some resources failed to load. Please check server connection.")
      }
    }
    if (user?.role === "admin") {
      fetchData()
    }
  }, [user])

  const updateUserStatus = async (userId, status) => {
    if (userId === user.id) {
      alert("⛔ You cannot ban or unban yourself.")
      return
    }
    try {
      const res = await axios.put(`/api/admin/users/${userId}`, { status })
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, status: res.data.status } : u)))
    } catch (err) {
      console.error("Failed to update user status:", err)
      alert("❌ Failed to update user status.")
    }
  }

  if (!user || user.role !== "admin") {
    return <div className="access-denied">⛔ Access denied. Admins only.</div>
  }

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">
        <span className="title-icon">📊</span>
        <span>Admin Dashboard</span>
      </h1>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="summary-cards">
        <div
          className={`summary-card users-card ${activePanel === "users" ? "active" : ""}`}
          onClick={() => setActivePanel(activePanel === "users" ? "" : "users")}
        >
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h3>All Users</h3>
            <div className="count">{usersCount}</div>
          </div>
        </div>

        <div
          className={`summary-card hotels-card ${activePanel === "hotels" ? "active" : ""}`}
          onClick={() => setActivePanel(activePanel === "hotels" ? "" : "hotels")}
        >
          <div className="card-icon">🏨</div>
          <div className="card-content">
            <h3>Total Hotels</h3>
            <div className="count">{hotelsCount}</div>
          </div>
        </div>

        <div
          className={`summary-card reports-card ${activePanel === "reports" ? "active" : ""}`}
          onClick={() => setActivePanel(activePanel === "reports" ? "" : "reports")}
        >
          <div className="card-icon">🚩</div>
          <div className="card-content">
            <h3>Hotel Reports</h3>
            <div className="count">{reports.length}</div>
          </div>
        </div>

        <div
          className={`summary-card logs-card ${activePanel === "logs" ? "active" : ""}`}
          onClick={() => setActivePanel(activePanel === "logs" ? "" : "logs")}
        >
          <div className="card-icon">📁</div>
          <div className="card-content">
            <h3>Audit Logs</h3>
            <div className="count">{logs.length}</div>
          </div>
        </div>

        <div
          className={`summary-card payments-card ${activePanel === "payments" ? "active" : ""}`}
          onClick={() => setActivePanel(activePanel === "payments" ? "" : "payments")}
        >
          <div className="card-icon">💳</div>
          <div className="card-content">
            <h3>Payments</h3>
            <div className="count">{payments.length}</div>
          </div>
        </div>
      </div>

      {/* All Users */}
      {activePanel === "users" && (
        <div className="panel-section">
          <h2 className="panel-title">
            <span className="panel-icon">👥</span>
            <span>All Users</span>
          </h2>
          <div className="panel-content">
            {users.map((u) => (
              <div key={u._id} className="user-card">
                <div className="user-info">
                  <div className="user-name">
                    <strong>Name:</strong>
                    <Link to={`/user/${u._id}`} className="user-link">
                      {u.name}
                    </Link>
                    <span className="user-email">({u.email})</span>
                  </div>
                  <div className="user-status">
                    <strong>Status:</strong>
                    <span className={`status-badge ${u.status}`}>{u.status}</span>
                  </div>
                </div>
                <div className="user-actions">
                  <button
                    onClick={() => updateUserStatus(u._id, u.status === "banned" ? "active" : "banned")}
                    className={`action-button ${u.status === "banned" ? "unban-button" : "ban-button"}`}
                  >
                    {u.status === "banned" ? "Unban" : "Ban"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total Hotels List */}
      {activePanel === "hotels" && (
        <div className="panel-section">
          <h2 className="panel-title">
            <span className="panel-icon">🏨</span>
            <span>All Hotels</span>
          </h2>
          {/* ---- ADMIN SCOPED HOTEL LIST ---- */}
          <div className="panel-content admin-hotels-list">
            {hotels.map((hotel) => (
              <div key={hotel._id} className="admin-hotel-card">
                <div className="admin-hotel-image-container">
                  <img
                    src={hotel.image || "/placeholder.svg"}
                    alt={hotel.name}
                    className="admin-hotel-image"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg"
                    }}
                  />
                </div>
                <div className="admin-hotel-details">
                  <div className="admin-hotel-name">
                    <Link to={`/hotel/${hotel._id}`} className="admin-hotel-link">
                      {hotel.name}
                    </Link>
                  </div>
                  <div className="admin-hotel-location">{hotel.location}</div>
                  <div className="admin-hotel-price">रु{hotel.pricePerNight} / night</div>
                  <div className="admin-hotel-rating">⭐ {hotel.stars}</div>
                  <div className="admin-hotel-owner">
                    Listed by:{" "}
                    {hotel.user ? (
                      <Link to={`/user/${hotel.user._id}`} className="admin-user-link">
                        {hotel.user.name}
                      </Link>
                    ) : (
                      <span className="admin-unknown-user">Unknown</span>
                    )}
                  </div>
                  <div className="admin-hotel-description">{hotel.description || "No description available."}</div>
                </div>
                <div className="admin-hotel-actions">
                  <Link to={`/hotel/${hotel._id}`} className="admin-view-button">
                    View Hotel
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {/* ---- END ADMIN SCOPED HOTEL LIST ---- */}
        </div>
      )}

      {/* Hotel Reports */}
      {activePanel === "reports" && (
        <div className="panel-section">
          <h2 className="panel-title">
            <span className="panel-icon">🚩</span>
            <span>Reported Hotels</span>
          </h2>
          <div className="panel-content">
            {reports.length === 0 ? (
              <p className="empty-message">No reports submitted.</p>
            ) : (
              reports.map((r) => (
                <div key={r._id} className="report-card">
                  <div className="report-header">
                    <div className="report-title">Report #{r._id.substring(r._id.length - 6)}</div>
                    <div className="report-date">🕒 {new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="report-content">
                    <div className="report-item">
                      <strong>Hotel:</strong>{" "}
                      <Link to={`/hotel/${r.hotel._id}`} className="hotel-link">
                        {r.hotel.name}
                      </Link>
                    </div>
                    <div className="report-item">
                      <strong>Reporter:</strong>{" "}
                      <Link to={`/user/${r.reporter._id}`} className="user-link">
                        {r.reporter.name}
                      </Link>{" "}
                      <span className="reporter-email">({r.reporter.email})</span>
                    </div>
                    <div className="report-item">
                      <strong>Reason:</strong> <span className="report-reason">{r.reason}</span>
                    </div>
                    <div className="report-item">
                      <strong>Details:</strong>{" "}
                      <span className="report-details">{r.details || "No additional details"}</span>
                    </div>
                  </div>
                  <div className="report-actions">
                    <button
                      onClick={() => {
                        setConfirmMessage("Mark this report as addressed and remove it?")
                        setOnConfirm(() => async () => {
                          await axios.delete(`/api/admin/reports/${r._id}`)
                          setReports((prev) => prev.filter((x) => x._id !== r._id))
                          setShowConfirmModal(false)
                        })
                        setShowConfirmModal(true)
                      }}
                      className="resolve-button"
                    >
                      ✅ Mark as Addressed
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Payments */}
      {activePanel === "payments" && (
        <div className="panel-section">
          <h2 className="panel-title">
            <span className="panel-icon">💳</span>
            <span>Payment Records</span>
          </h2>
          <div className="panel-content">
            {payments.map((p) => (
              <div key={p._id} className="payment-card">
                <div className="payment-header">
                  <div className="payment-id">Payment #{p._id.substring(p._id.length - 6)}</div>
                  <div className="payment-date">🕒 {new Date(p.createdAt).toLocaleString()}</div>
                </div>
                <div className="payment-content">
                  <div className="payment-item">
                    <strong>User:</strong>{" "}
                    <Link to={`/user/${p.user?._id}`} className="user-link">
                      {p.user?.name}
                    </Link>{" "}
                    <span className="user-email">({p.user?.email})</span>
                  </div>
                  <div className="payment-item">
                    <strong>Hotel:</strong>{" "}
                    <Link to={`/hotel/${p.hotel?._id}`} className="hotel-link">
                      {p.hotel?.name}
                    </Link>
                  </div>
                  <div className="payment-amount">
                    <strong>Amount:</strong> <span className="amount">Rs. {p.amount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logs */}
      {activePanel === "logs" && (
        <div className="panel-section">
          <h2 className="panel-title">
            <span className="panel-icon">📁</span>
            <span>Recent Audit Logs</span>
          </h2>
          <div className="panel-content">
            {logs.length === 0 ? (
              <p className="empty-message">No audit logs available.</p>
            ) : (
              logs.map((log) => (
                <div key={log._id} className="log-card">
                  <div className="log-header">
                    <div className="log-action">{log.action.replace(/-/g, " ")}</div>
                    <div className="log-date">🕒 {new Date(log.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="log-content">
                    <div className="log-item">
                      <strong>User:</strong>{" "}
                      {log.user ? (
                        <>
                          <Link to={`/user/${log.user._id}`} className="user-link">
                            {log.user.name}
                          </Link>{" "}
                          <span className="user-email">({log.user.email})</span>
                        </>
                      ) : (
                        <span className="unknown-user">Unknown User</span>
                      )}
                    </div>
                    <div className="log-item">
                      <strong>Target:</strong>{" "}
                      <span className="log-target">
                        {log.targetType} — {log.targetId}
                      </span>
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="log-details">
                        <strong>Details:</strong> <code>{JSON.stringify(log.details)}</code>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2 className="modal-title">Please Confirm</h2>
            <p className="modal-message">{confirmMessage}</p>
            <div className="modal-actions">
              <button onClick={() => setShowConfirmModal(false)} className="cancel-button">
                Cancel
              </button>
              <button onClick={onConfirm} className="confirm-button">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
