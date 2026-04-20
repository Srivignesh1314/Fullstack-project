import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiUser, FiLock } from 'react-icons/fi';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [department, setDepartment] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }
        try {
            const { data } = await api.post('/auth/register', { username, password, department });
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-slate-900">Create Account</h2>
                    <p className="mt-2 text-sm text-slate-500">Join as Faculty member</p>
                </div>
                {error && <div className="p-3 text-sm text-red-600 bg-red-100 rounded-lg">{error}</div>}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                <FiUser />
                            </div>
                            <input
                                type="text"
                                required
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-slate-50"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                <FiLock />
                            </div>
                            <input
                                type="password"
                                required
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-slate-50"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <select
                                required
                                className="block w-full pl-3 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-slate-50 text-slate-700"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                            >
                                <option value="" disabled>Select Department</option>
                                <option value="CSE">CSE</option>
                                <option value="EEE">EEE</option>
                                <option value="ECE">ECE</option>
                                <option value="CIVIL">CIVIL</option>
                            </select>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                <FiLock />
                            </div>
                            <input
                                type="password"
                                required
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-slate-50"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                        Sign up
                    </button>
                    
                    <div className="text-sm text-center">
                        <span className="text-slate-500">Already have an account? </span>
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                            Log in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
