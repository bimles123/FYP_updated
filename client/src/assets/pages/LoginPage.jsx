import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from 'axios';

export default function LoginPage({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  async function handleLoginSubmit(ev) {
    ev.preventDefault();

    // Empty input check
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      setShowErrorModal(true);
      return;
    }

    try {
      const response = await axios.post('/login', { email, password }, { withCredentials: true });

      if (response.status === 200) {
        const { token, id, name, email, role } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ id, name, email, role }));
        setIsAuthenticated(true);

        // Redirect based on role
        if (role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/home');
        }
      }
    } catch (e) {
      const msg = e.response?.data?.error || e.message || "Login failed.";
      setErrorMessage(`Login failed: ${msg}`);
      setShowErrorModal(true);
    }
  }

  return (
    <div className="mt-10 pt-16 relative">
      <h1 className="font-bold text-4xl text-center text-gray-800">Login</h1>

      <form
        className="flex flex-col max-w-md gap-6 mt-5 mx-auto border border-gray-300 rounded-lg shadow-lg p-8 bg-white"
        onSubmit={handleLoginSubmit}
      >
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="log bg-blue-500 text-white font-semibold py-2 rounded hover:bg-blue-600 transition duration-200"
        >
          Login
        </button>
        <div className="text-xs text-center mt-4">
          Not registered as a member?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">Register now</Link>
        </div>
      </form>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center animate-fade-in">
            <h2 className="text-xl font-semibold text-red-600 mb-3">Login Failed</h2>
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
