"use client"

import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "../css/AddHotelPage.css"

const AddHotelPage = () => {
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [pricePerNight, setPricePerNight] = useState("")
  const [rating, setRating] = useState("")
  const [image, setImage] = useState("")
  const [mediaFiles, setMediaFiles] = useState([])
  const [mediaPreviews, setMediaPreviews] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem("user"))

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setMediaFiles(files)

    const previews = files.map((file) => URL.createObjectURL(file))
    setMediaPreviews(previews)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Upload media files to server
      const formData = new FormData()
      mediaFiles.forEach((file) => formData.append("media", file))

      const uploadRes = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      const uploadedMedia = uploadRes.data // array of { type, url }

      // Create hotel with uploaded media
      await axios.post("/api/hotels", {
        name,
        location,
        pricePerNight,
        rating,
        image,
        user: user.id,
        media: uploadedMedia,
      })

      alert("Hotel added successfully!")
      setName("")
      setLocation("")
      setPricePerNight("")
      setRating("")
      setImage("")
      setMediaFiles([])
      setMediaPreviews([])
      navigate("/home")
    } catch (error) {
      console.error("Error adding hotel:", error)
      alert("Failed to add hotel")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="add-hotel-page">
      <div className="add-hotel-container">
        <h2 className="add-hotel-title">Add a New Hotel</h2>
        <form onSubmit={handleSubmit} className="add-hotel-form">
          <div className="form-group">
            <label htmlFor="name">Hotel Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter hotel name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="pricePerNight">Price Per Night ($)</label>
            <input
              type="number"
              id="pricePerNight"
              value={pricePerNight}
              onChange={(e) => setPricePerNight(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="rating">Rating (1-5)</label>
            <input
              type="number"
              id="rating"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              min="1"
              max="5"
              step="0.1"
              placeholder="4.5"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="image">Cover Image URL</label>
            <input
              type="text"
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="media">Upload Additional Media</label>
            <input type="file" id="media" accept="image/*,video/*" multiple onChange={handleFileChange} />
            <div className="preview-container">
              {mediaPreviews.map((src, idx) =>
                src.includes("video") || mediaFiles[idx].type.startsWith("video") ? (
                  <video key={idx} src={src} controls className="media-preview" />
                ) : (
                  <img key={idx} src={src || "/placeholder.svg"} alt="preview" className="media-preview" />
                ),
              )}
            </div>
          </div>
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Adding Hotel..." : "Add Hotel"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddHotelPage

