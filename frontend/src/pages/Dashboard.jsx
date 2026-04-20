import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AttendanceForm from '../components/AttendanceForm';
import AttendanceTable from '../components/AttendanceTable';
import StudentManager from '../components/StudentManager';
import SubjectManager from '../components/SubjectManager';
import AttendanceCalculator from '../components/AttendanceCalculator';
import { FiLogOut, FiUser, FiClipboard, FiUsers, FiBook } from 'react-icons/fi';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [activeTab, setActiveTab] = useState('attendance'); // 'attendance', 'students', or 'subjects'

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            navigate('/login');
        } else {
            const parsedUser = JSON.parse(userInfo);
            setUser(parsedUser);
            if (parsedUser.role === 'student') {
                fetchStudentStats();
            }
        }
    }, [navigate, refreshTrigger]);

    const fetchStudentStats = async () => {
        try {
            const { data } = await api.get('/data/attendance/stats');
            setStats(data);
        } catch (error) {
            console.error('Error fetching student stats:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-100 font-secondary">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-blue-600">Attendance <span className="text-slate-500 text-sm ml-2 font-normal hidden sm:inline">Portal</span></h1>
                        </div>
                        
                        {/* Tab Switcher (Faculty Only) */}
                        {user.role === 'faculty' && (
                            <div className="flex items-center mx-4">
                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                    <button 
                                        onClick={() => setActiveTab('attendance')}
                                        className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'attendance' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <FiClipboard className="mr-2" /> Attendance
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('students')}
                                        className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'students' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <FiUsers className="mr-2" /> Students
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('subjects')}
                                        className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'subjects' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <FiBook className="mr-2" /> Subjects
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex items-center text-sm font-medium text-slate-700 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
                                <FiUser className="mr-2" />
                                {user.name || user.username} ({user.role}) {user.department && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] uppercase">{user.department}</span>}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <FiLogOut className="mr-2" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
                {user.role === 'faculty' ? (
                    <>
                        {activeTab === 'attendance' && (
                            <>
                                <section>
                                    <AttendanceForm onAttendanceMarked={handleRefresh} />
                                </section>
                                <section>
                                    <AttendanceTable refreshTrigger={refreshTrigger} />
                                </section>
                            </>
                        )}
                        {activeTab === 'students' && (
                            <section>
                                <StudentManager />
                            </section>
                        )}
                        {activeTab === 'subjects' && (
                            <section>
                                <SubjectManager />
                            </section>
                        )}
                    </>
                ) : (
                    /* Student View */
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Student Dashboard</h2>
                                <p className="text-slate-500 font-medium">Manage your attendance goals and view reports.</p>
                            </div>
                            
                            {/* Student Profile Card */}
                            <div className="bg-blue-600 text-white rounded-2xl p-4 shadow-lg shadow-blue-200 flex items-center space-x-4 border border-blue-400">
                                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                    <FiUser size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg leading-tight">{user.name}</h4>
                                    <div className="flex flex-col text-xs font-semibold opacity-90 mt-1">
                                        <span>Roll: {user.rollNumber}</span>
                                        <span>Section: {user.section}</span>
                                        <span>Dept: {user.department || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Section: Goal Calculator */}
                        <section>
                            <AttendanceCalculator stats={stats} />
                        </section>

                        {/* Bottom Section: Report Table */}
                        <section>
                            <div className="flex items-center mb-6">
                                <div className="p-2 bg-slate-800 rounded-lg text-white mr-3">
                                    <FiClipboard size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Detailed Attendance Report</h3>
                            </div>
                            <AttendanceTable refreshTrigger={refreshTrigger} />
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
