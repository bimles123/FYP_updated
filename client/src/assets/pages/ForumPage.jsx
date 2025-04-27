"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import "../css/ForumPage.css"

const ForumPage = () => {
  const { hotelId } = useParams()
  const currentUser = JSON.parse(localStorage.getItem("user"))
  const [hotel, setHotel] = useState(null)
  const [reviews, setReviews] = useState([])
  const [newComment, setNewComment] = useState("")
  const [newStars, setNewStars] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [hotelRes, reviewsRes] = await Promise.all([
          axios.get(`/api/hotels/${hotelId}`),
          axios.get(`/api/hotels/${hotelId}/reviews`),
        ])
        setHotel(hotelRes.data)
        setReviews(reviewsRes.data)
      } catch (err) {
        console.error("Failed to load data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [hotelId])

  const submitReview = async () => {
    if (!newStars || !newComment.trim()) {
      setError("Please provide both a rating and comment.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      await axios.post(`/api/hotels/${hotelId}/reviews`, {
        stars: newStars,
        comment: newComment,
        userId: currentUser.id,
      })

      const res = await axios.get(`/api/hotels/${hotelId}/reviews`)
      setReviews(res.data)
      setNewComment("")
      setNewStars(0)
      setSuccess("Your review has been successfully submitted!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      console.error("Failed to submit review", err)
      setError("There was a problem submitting your review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(1)
    : null

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading hotel information...</p>
      </div>
    )
  }

  return (
    <div className="forum-container">
      <div className="forum-header">
        <Link to="/hotels" className="back-link">
          <span>←</span> Back to Hotels
        </Link>

        {hotel && (
          <div className="hotel-info">
            <h1>{hotel.name} Forum</h1>
            <div className="hotel-meta">
              <span className="location">
                <i className="location-icon">📍</i> {hotel.location}
              </span>

              {averageRating && (
                <div className="rating-summary">
                  <div className="average-rating">
                    <span className="stars">{"★".repeat(Math.round(averageRating))}</span>
                    <span className="rating-value">{averageRating}</span>
                  </div>
                  <p className="review-count">
                    {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Forum Media Section */}
      {hotel?.media?.length > 0 && (
        <div className="forum-media-gallery">
          <h2>Photos & Videos</h2>
          <div className="media-carousel">
            {hotel.media[currentMediaIndex].type === "video" ? (
              <video
                key={currentMediaIndex}
                src={hotel.media[currentMediaIndex].url}
                controls
                className="carousel-media"
              />
            ) : (
              <img
                key={currentMediaIndex}
                src={hotel.media[currentMediaIndex].url}
                alt={`media-${currentMediaIndex}`}
                className="carousel-media"
              />
            )}
            {hotel.media.length > 1 && (
              <button
                className="carousel-next"
                onClick={() =>
                  setCurrentMediaIndex((prev) => (prev + 1) % hotel.media.length)
                }
              >
                ➜
              </button>
            )}
          </div>
        </div>
      )}

      {/* Review Form */}
      <div className="review-form-container">
        <h2>Leave a Review</h2>
        <div className="rating-selector">
          <p>Your Rating:</p>
          <div className="stars-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setNewStars(star)}
                className={`star ${newStars >= star ? "selected" : ""}`}
                title={`${star} star${star !== 1 ? "s" : ""}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <textarea
          rows="4"
          placeholder="Write your comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={isSubmitting}
        />

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button
          onClick={submitReview}
          className={`submit-button ${isSubmitting ? "submitting" : ""}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </div>

      {/* Reviews */}
      <div className="reviews-container">
        <h2>Reviews</h2>
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to leave one!</p>
        ) : (
          reviews.map((review, index) => (
            <div key={index} className="review-card">
              <div className="review-header">
                <Link to={`/user/${review.user?._id}`} className="user-link">
                  <div className="avatar">{review.user?.name.charAt(0)}</div>
                  <span className="username">{review.user?.name}</span>
                </Link>
                <div className="review-rating">
                  <span className="stars">{"★".repeat(review.stars)}</span>
                  <span className="empty-stars">{"★".repeat(5 - review.stars)}</span>
                </div>
              </div>
              <p>{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ForumPage
