
import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import axios from "axios"
import "./assets/css/header.css"

export default function Header({ searchValue, setSearchValue }) {
  const location = useLocation()
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register"

  const [dropdown, setDropdown] = useState(null)
  const [tripDates, setTripDates] = useState({ checkIn: "", checkOut: "" })
  const [people, setPeople] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  })
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [username, setUsername] = useState("")

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && !event.target.closest(".sidebar") && !event.target.closest(".toggle-sidebar")) {
        setIsSidebarOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isSidebarOpen])

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUsername(user.name || user.username || "")
    }
  }, [location.pathname])

  const toggleDropdown = (menu) => {
    setDropdown((prev) => (prev === menu ? null : menu))
  }

  const handleDateChange = (field, value) => {
    setTripDates((prev) => ({ ...prev, [field]: value }))
  }

  const updatePeopleCount = (type, action) => {
    setPeople((prev) => ({
      ...prev,
      [type]: action === "increment" ? prev[type] + 1 : Math.max(0, prev[type] - 1),
    }))
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }

  const handleProfileClick = () => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (user?.id) {
      window.location.href = `/user/${user.id}`
    }
  }

  const [isSearching, setIsSearching] = useState(false);

  const handleCloseSearch = () => {
    setSearchValue("");
    setIsSearching(false);
  };

  return (
    <>
      <header className="flex flex-col bg-white shadow-md fixed left-0 right-0 z-50">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <Link to="/home" className="flex items-center gap-2 transition-transform hover:scale-105">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#3b82f6"
              className="size-7 -rotate-45"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
              />
            </svg>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-gray-800">ReachNp</span>
              <span className="text-xs text-blue-500 -mt-1">Explore Nepal</span>
            </div>
          </Link>

          <nav className="relative flex flex-col items-center font-medium border border-gray-200 p-2 rounded-full bg-gray-50 shadow-sm w-fit">
            <div className="relative w-96 h-10">
              {!isSearching ? (
                <div
                  onClick={() => setIsSearching(true)}
                  className="font-bold w-full h-full flex items-center justify-center text-gray-700 text-base px-4 py-2 rounded-full cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
                >
                  Where in Nepal?
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <input
                    type="text"
                    autoFocus
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onBlur={() => setTimeout(handleCloseSearch, 150)}
                    placeholder="Search places in Nepal..."
                    className="w-full h-full text-center text-base px-4 pr-10 py-2 rounded-full border border-gray-300 text-gray-800 placeholder-gray-500 focus:placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-300"
                  />
                  {(searchValue || isSearching) && (
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleCloseSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 text-lg"
                    >
                      &times;
                    </button>
                  )}
                </div>
              )}
            </div>
          </nav>



          <button
            className="toggle-sidebar flex items-center gap-2 border border-gray-200 p-2 rounded-full hover:bg-gray-50 hover:border-blue-300 transition-colors"
            onClick={toggleSidebar}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="size-5 text-gray-600"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
            <div className="bg-blue-500 text-white rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="size-5">
                <path
                  fillRule="evenodd"
                  d="M12 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 13.5c-4.24 0-7.5 1.82-7.5 4.5v1.5h15v-1.5c0-2.68-3.26-4.5-7.5-4.5Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </button>
        </div>

        {!isAuthPage && (
          <div className="border-t border-gray-100 bg-white px-6 py-3 flex justify-between items-center">
            <div className="flex gap-6 overflow-x-auto">
              <Link
                to="/reachers"
                className="px-3 py-1.5 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 cursor-pointer font-medium flex items-center gap-1.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                  />
                </svg>
                Reachers
              </Link>
              <Link
                to="/chat"
                className="px-3 py-1.5 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 cursor-pointer font-medium flex items-center gap-1.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                  />
                </svg>
                My Chats
              </Link>
              <Link
                to="/mybookings"
                className="px-3 py-1.5 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 cursor-pointer font-medium flex items-center gap-1.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                  />
                </svg>
                Bookings
              </Link>
            </div>
            <Link to="/category">
              <button className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 10.5H4.5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2H6m12-9h1.5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H18m-9-6.75h6m-6 3h6M8.25 6v2.25m7.5-2.25v2.25m-7.5 0h7.5M12 3.75v1.5m-6.364.386L6.75 7.5m10.614-1.864L17.25 7.5"
                  />
                </svg>
                Filters
              </button>
            </Link>
          </div>
        )}

        <div
          className={`sidebar fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform ${isSidebarOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out z-50`}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-800">Account</h2>
              <button className="text-gray-400 hover:text-gray-800 transition-colors" onClick={toggleSidebar}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {username ? (
              <div className="mb-6 flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="bg-blue-500 text-white rounded-full p-2 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="size-6">
                    <path
                      fillRule="evenodd"
                      d="M12 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 13.5c-4.24 0-7.5 1.82-7.5 4.5v1.5h15v-1.5c0-2.68-3.26-4.5-7.5-4.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-800">{username}</div>
                  <button
                    onClick={handleProfileClick}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-center hover:bg-blue-700 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="w-full border border-gray-300 py-2 px-4 rounded-md text-center hover:bg-gray-50 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-1 mb-6">
                <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2 px-2">Hosting</h3>
                <Link to="/add-hotel">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors text-left">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                      />
                    </svg>
                    Add Hotel
                  </button>
                </Link>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors text-left">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                    />
                  </svg>
                  Manage Listings
                </button>
              </div>

              <div className="space-y-1 mb-6">
                <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2 px-2">Account</h3>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors text-left">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  Settings
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors text-left">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                    />
                  </svg>
                  Help Center
                </button>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-md transition-colors text-left"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="h-32"></div>
    </>
  )
}

