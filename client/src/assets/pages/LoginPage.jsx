import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from 'axios';

export default function LoginPage({ setIsAuthenticated }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    async function handleLoginSubmit(ev) {
        ev.preventDefault();
        try {
            const response = await axios.post('/login', { email, password }, { withCredentials: true });
            if (response.status === 200) {
                const { token, id, name, email } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify({ id, name, email }));
                setIsAuthenticated(true);
                navigate('/home');
            }
        } catch (e) {
            alert(`Login failed: ${e.response?.data?.error || e.message}`);
        }
    }

    return (
        <div className="mt-10 pt-16">
            <h1 className="font-bold text-4xl text-center text-gray-800">Login</h1>
            <form className="flex flex-col max-w-md gap-6 mt-5 mx-auto border border-gray-300 rounded-lg shadow-lg p-8 bg-white" onSubmit={handleLoginSubmit}>
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
                <button className="log bg-blue-500 text-white font-semibold py-2 rounded hover:bg-blue-600 transition duration-200">Login</button>
                <div className="text-xs text-center mt-4">
                    Not registered as a member? <Link to={'/register'} className="text-blue-500 hover:underline">Register now</Link>
                </div>
            </form>
        </div>
    );
}
