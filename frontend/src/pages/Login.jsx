import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiMail, FiLock } from 'react-icons/fi';

const Login = () => {
    const [role, setRole] = useState('faculty'); // 'faculty' or 'student'
    const [identifier, setIdentifier] = useState(''); // username or rollNumber
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = role === 'faculty' ? '/auth/login' : '/auth/student-login';
            const payload = role === 'faculty' 
                ? { username: identifier, password } 
                : { rollNumber: identifier, password };
                
            const { data } = await api.post(endpoint, payload);
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-slate-900">Welcome Back</h2>
                    <p className="mt-2 text-sm text-slate-500">Sign in to manage attendances</p>
                </div>
                {error && <div className="p-3 text-sm text-red-600 bg-red-100 rounded-lg">{error}</div>}
                
                <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                    <button 
                        onClick={() => { setRole('faculty'); setIdentifier(''); }}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'faculty' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Faculty
                    </button>
                    <button 
                        onClick={() => { setRole('student'); setIdentifier(''); }}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'student' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Student
                    </button>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                <FiMail />
                            </div>
                            <input
                                id="identifier"
                                type="text"
                                required
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                                placeholder={role === 'faculty' ? "Username" : "Roll Number (AP24...)"}
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                <FiLock />
                            </div>
                            <input
                                id="password"
                                type="password"
                                required
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Sign in
                    </button>
                    
                    <div className="text-sm text-center">
                        <span className="text-slate-500">Don't have an account? </span>
                        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                            Register here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
