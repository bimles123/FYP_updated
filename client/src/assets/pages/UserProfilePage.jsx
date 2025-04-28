"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import axios from "axios"
import "../css/UserProfilePage.css"

const UserProfilePage = () => {
  const { userId } = useParams()
  const [userData, setUserData] = useState(null)
  const [userHotels, setUserHotels] = useState([])
  const [editingHotelId, setEditingHotelId] = useState(null)
  const [editedHotel, setEditedHotel] = useState({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showUpdateError, setShowUpdateError] = useState(false)
  const [showDeleteError, setShowDeleteError] = useState(false)
  const [hotelToDelete, setHotelToDelete] = useState(null)

  const currentUser = JSON.parse(localStorage.getItem("user"))
  const isOwnProfile = currentUser?.id === userId
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/users")
        const user = res.data.find((u) => u._id === userId)
        setUserData(user)
      } catch (err) {
        console.error("Failed to fetch user profile:", err)
      }
    }

    const fetchHotelsByUser = async () => {
      try {
        const res = await axios.get("/api/hotels")
        const filtered = res.data.filter((hotel) => hotel.user?._id === userId && !hotel.isDeleted)
        setUserHotels(filtered)
      } catch (err) {
        console.error("Failed to fetch user hotels:", err)
      }
    }

    fetchUser()
    fetchHotelsByUser()
  }, [userId])

  const handleChatNow = () => {
    localStorage.setItem("chatReceiverId", userData._id)
    localStorage.setItem("chatReceiverName", userData.name)
    navigate("/chat")
  }

  const startEdit = (hotel) => {
    setEditingHotelId(hotel._id)
    setEditedHotel({ ...hotel })
  }

  const saveChanges = async (hotelId) => {
    try {
      const res = await axios.put(`/api/hotels/${hotelId}`, editedHotel)
      const updated = userHotels.map((h) => (h._id === hotelId ? { ...res.data, user: h.user } : h))
      setUserHotels(updated)
      setEditingHotelId(null)
    } catch (err) {
      console.error("Failed to update hotel:", err)
      setShowUpdateError(true)
    }
  }

  const confirmDelete = (hotelId) => {
    setHotelToDelete(hotelId)
    setShowDeleteConfirm(true)
  }

  const deleteHotel = async () => {
    try {
      await axios.delete(`/api/hotels/${hotelToDelete}`, {
        data: { userId: currentUser.id },
      })
      setUserHotels(userHotels.filter((h) => h._id !== hotelToDelete))
    } catch (err) {
      console.error("Failed to delete hotel:", err)
      setShowDeleteError(true)
    } finally {
      setShowDeleteConfirm(false)
      setHotelToDelete(null)
    }
  }

  if (!userData) {
    return <div className="loading">Loading profile...</div>
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">User Profile</h1>

        <div className="profile-info">
          <div className="profile-info-item">
            <span className="profile-info-label">Name</span>
            <span className="profile-info-value">{userData.name}</span>
          </div>

          <div className="profile-info-item">
            <span className="profile-info-label">Email</span>
            <span className="profile-info-value">{userData.email}</span>
          </div>
        </div>

        <div className="profile-actions">
          {isOwnProfile ? (
            <div className="own-profile-indicator">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 inline mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              This is your own profile
            </div>
          ) : (
            <button onClick={handleChatNow} className="chat-button">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                  clipRule="evenodd"
                />
              </svg>
              Chat Now
            </button>
          )}
        </div>
      </div>

      <div className="hotels-section">
        <h2 className="hotels-title">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          Listed Hotels
        </h2>

        {userHotels.length === 0 ? (
          <div className="hotels-empty">No hotels listed.</div>
        ) : (
          userHotels.map((hotel) => (
            <div key={hotel._id} className="hotel-card">
              {editingHotelId === hotel._id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    className="form-input"
                    value={editedHotel.name}
                    onChange={(e) => setEditedHotel({ ...editedHotel, name: e.target.value })}
                    placeholder="Hotel name"
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={editedHotel.location}
                    onChange={(e) => setEditedHotel({ ...editedHotel, location: e.target.value })}
                    placeholder="Location"
                  />
                  <input
                    type="number"
                    className="form-input"
                    value={editedHotel.pricePerNight}
                    onChange={(e) => setEditedHotel({ ...editedHotel, pricePerNight: e.target.value })}
                    placeholder="Price per night"
                  />
                  <input
                    type="number"
                    className="form-input"
                    value={editedHotel.stars}
                    onChange={(e) => setEditedHotel({ ...editedHotel, stars: e.target.value })}
                    min={1}
                    max={5}
                    step={1}
                    placeholder="Stars (1-5)"
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={editedHotel.image}
                    onChange={(e) => setEditedHotel({ ...editedHotel, image: e.target.value })}
                    placeholder="Image URL"
                  />
                  <textarea
                    className="form-textarea"
                    value={editedHotel.description || ""}
                    onChange={(e) => setEditedHotel({ ...editedHotel, description: e.target.value })}
                    placeholder="Description"
                  />
                  <div className="form-actions">
                    <button onClick={() => saveChanges(hotel._id)} className="save-button">
                      Save
                    </button>
                    <button onClick={() => setEditingHotelId(null)} className="cancel-button">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="hotel-name">{hotel.name}</h3>
                  <div className="hotel-details">
                    <div className="hotel-detail">
                      <span className="hotel-detail-label">Location</span>
                      <span className="hotel-detail-value">{hotel.location}</span>
                    </div>
                    <div className="hotel-detail">
                      <span className="hotel-detail-label">Price</span>
                      <span className="hotel-detail-value">रु{hotel.pricePerNight}</span>
                    </div>
                    <div className="hotel-detail">
                      <span className="hotel-detail-label">Rating</span>
                      <span className="hotel-detail-value">{hotel.stars} Star</span>
                    </div>
                  </div>

                  <div className="hotel-description">{hotel.description || "No description available."}</div>

                  <Link to={`/hotel/${hotel._id}`} className="hotel-link">
                    View Hotel
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>

                  {currentUser?.id === hotel.user?._id && (
                    <div className="hotel-actions">
                      <button onClick={() => startEdit(hotel)} className="edit-button">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>
                      <button onClick={() => confirmDelete(hotel._id)} className="delete-button">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title error">Delete Hotel</h2>
            <p className="modal-message">Are you sure you want to delete this hotel?</p>
            <div className="modal-actions">
              <button onClick={deleteHotel} className="modal-button confirm-button">
                Yes, Delete
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} className="modal-button cancel-modal-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Error Modal */}
      {showUpdateError && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title error">Update Failed</h2>
            <p className="modal-message">Could not update the hotel. Please try again.</p>
            <button onClick={() => setShowUpdateError(false)} className="modal-button ok-button">
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Delete Error Modal */}
      {showDeleteError && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title error">Delete Failed</h2>
            <p className="modal-message">Could not delete the hotel. Please try again.</p>
            <button onClick={() => setShowDeleteError(false)} className="modal-button ok-button">
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfilePage
