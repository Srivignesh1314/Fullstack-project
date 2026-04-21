import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiMail, FiLock, FiShield } from 'react-icons/fi';

const Login = () => {
    const [role, setRole] = useState('faculty'); // 'faculty' | 'student' | 'admin'
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRoleSwitch = (newRole) => {
        setRole(newRole);
        setIdentifier('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            let endpoint, payload;
            if (role === 'student') {
                endpoint = '/auth/student-login';
                payload = { rollNumber: identifier, password };
            } else {
                // faculty and admin both use the same User model login
                endpoint = '/auth/login';
                payload = { username: identifier, password };
            }

            const { data } = await api.post(endpoint, payload);
            localStorage.setItem('userInfo', JSON.stringify(data));

            if (data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        }
    };

    const tabs = [
        { id: 'faculty', label: 'Faculty' },
        { id: 'student', label: 'Student' },
        { id: 'admin', label: 'Admin' },
    ];

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl">
                <div className="text-center">
                    {role === 'admin' ? (
                        <div className="flex justify-center mb-2">
                            <div className="p-3 bg-indigo-100 rounded-full">
                                <FiShield className="text-indigo-600 w-7 h-7" />
                            </div>
                        </div>
                    ) : null}
                    <h2 className="text-3xl font-extrabold text-slate-900">
                        {role === 'admin' ? 'Admin Login' : 'Welcome Back'}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        {role === 'admin'
                            ? 'Sign in to manage teachers & students'
                            : 'Sign in to manage attendances'}
                    </p>
                </div>

                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-100 rounded-lg">{error}</div>
                )}

                {/* Role Tab Switcher */}
                <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleRoleSwitch(tab.id)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                                role === tab.id
                                    ? tab.id === 'admin'
                                        ? 'bg-white shadow-sm text-indigo-600'
                                        : 'bg-white shadow-sm text-blue-600'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
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
                                placeholder={
                                    role === 'faculty'
                                        ? 'Username'
                                        : role === 'student'
                                        ? 'Roll Number (AP24...)'
                                        : 'Admin Username'
                                }
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
                        className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            role === 'admin'
                                ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                        }`}
                    >
                        Sign in
                    </button>

                    {role !== 'admin' && (
                        <div className="text-sm text-center">
                            <span className="text-slate-500">Don't have an account? </span>
                            <Link
                                to="/register"
                                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                            >
                                Register here
                            </Link>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Login;
