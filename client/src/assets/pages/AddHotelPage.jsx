"use client"

import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "../css/AddHotelPage.css"

const AddHotelPage = () => {
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [pricePerNight, setPricePerNight] = useState("")
  const [stars, setStars] = useState("")
  const [description, setDescription] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [mediaFiles, setMediaFiles] = useState([])
  const [mediaPreviews, setMediaPreviews] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem("user"))

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

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
      const formData = new FormData()
      if (imageFile) formData.append("media", imageFile)
      mediaFiles.forEach((file) => formData.append("media", file))

      const uploadRes = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      const uploadedUrls = uploadRes.data
      const coverImageUrl = uploadedUrls[0].url

      const additionalMedia = uploadedUrls.slice(1).map((file) => ({
        type: file.url.includes("video") ? "video" : "image",
        url: file.url,
      }))

      await axios.post("/api/hotels", {
        name,
        location,
        pricePerNight,
        stars,
        description,
        image: coverImageUrl,
        user: user.id,
        media: additionalMedia,
      })

      alert("Hotel added successfully!")
      setName("")
      setLocation("")
      setPricePerNight("")
      setStars("")
      setDescription("")
      setImageFile(null)
      setImagePreview("")
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
            <label htmlFor="pricePerNight">Price Per Night (रु)</label>
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
            <label htmlFor="stars">Star Category (1-5 Star)</label>
            <input
              type="number"
              id="stars"
              value={stars}
              onChange={(e) => setStars(e.target.value)}
              min="1"
              max="5"
              placeholder="e.g., 4"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Hotel Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the hotel, its features, and amenities"
              rows="4"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="coverImage">Upload Cover Image</label>
            <input type="file" id="coverImage" accept="image/*" onChange={handleCoverImageChange} required />
            {imagePreview && <img src={imagePreview} alt="Cover Preview" className="media-preview" />}
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
