import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  async function registerUser(ev) {
    ev.preventDefault();
    try {
      await axios.post('/register', {
        name,
        email,
        password,
        adminCode,
      });
      setSuccessMessage("Registration successful.");
      setShowSuccessModal(true);
    } catch (e) {
      setErrorMessage("Registration failed.");
      setShowErrorModal(true);
    }
  }

  return (
    <div className="mt-10 pt-16">
      <h1 className="font-bold text-4xl text-center text-gray-800">Register</h1>
      <form
        className="flex flex-col max-w-md gap-6 mt-5 mx-auto border border-gray-300 rounded-lg shadow-lg p-8 bg-white"
        onSubmit={registerUser}
      >
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={ev => setName(ev.target.value)}
          className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={ev => setEmail(ev.target.value)}
          className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={ev => setPassword(ev.target.value)}
          className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="(Optional) Admin Code"
          value={adminCode}
          onChange={ev => setAdminCode(ev.target.value)}
          className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button className="log bg-blue-500 text-white font-semibold py-2 rounded hover:bg-blue-600 transition duration-200">
          Register
        </button>
        <div className="text-xs text-center mt-4">
          Already a member?{" "}
          <Link to={'/login'} className="text-blue-500 hover:underline">Sign in</Link>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center animate-fade-in">
            <h2 className="text-xl font-semibold text-green-600 mb-3">Success</h2>
            <p className="text-gray-700 mb-6">{successMessage}</p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/home");
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center animate-fade-in">
            <h2 className="text-xl font-semibold text-red-600 mb-3">Error</h2>
            <p className="text-gray-700 mb-6">{errorMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
