import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiPlus, FiTrash2, FiSearch, FiUserPlus } from 'react-icons/fi';

const StudentManager = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Form state for new student
    const [name, setName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [section, setSection] = useState('A');
    const [department, setDepartment] = useState('');

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (userInfo.department) {
            setDepartment(userInfo.department);
        }
    }, []);

    // Sections A-Z
    const sections = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        const filtered = students.filter(s => 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStudents(filtered);
    }, [searchTerm, students]);

    const fetchStudents = async () => {
        try {
            const { data } = await api.get('/data/students');
            setStudents(data);
            setFilteredStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            // New student will have 'password123' as default password (hashed in backend)
            await api.post('/data/students', { name, rollNumber, section, department });
            setMessage('Student added successfully! Default login password: password123');
            setName('');
            setRollNumber('');
            setSection('A');
            fetchStudents();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error adding student');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStudent = async (id) => {
        if (!window.confirm('Are you sure? This will delete the student and ALL their attendance records.')) return;
        
        try {
            await api.delete(`/data/students/${id}`);
            setMessage('Student deleted successfully');
            fetchStudents();
        } catch (error) {
            setMessage('Error deleting student');
        }
    };

    return (
        <div className="space-y-8">
            {/* Add Student Form */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
                <div className="flex items-center mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600 mr-3">
                        <FiUserPlus size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Enroll New Student</h3>
                </div>
                
                <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            required
                            className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border bg-slate-50"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
                        <input 
                            type="text" 
                            required
                            className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border bg-slate-50"
                            placeholder="AP2411..."
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                        <select 
                            required
                            className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border bg-slate-50"
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                        >
                            {sections.map(s => (
                                <option key={s} value={s}>Section {s}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                        <select 
                            required
                            className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border bg-slate-50"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        >
                            <option value="CSE">CSE</option>
                            <option value="EEE">EEE</option>
                            <option value="ECE">ECE</option>
                            <option value="CIVIL">CIVIL</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                    >
                        <FiPlus className="mr-2" /> Add Student
                    </button>
                </form>
                {message && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </div>
                )}
            </div>

            {/* Student List */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                    <h3 className="text-xl font-bold text-slate-800">Student Directory</h3>
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            <FiSearch />
                        </div>
                        <input 
                            type="text"
                            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-hidden border border-slate-200 rounded-lg">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-semibold">Roll No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-semibold">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-semibold">Section</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-semibold">Dept</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500 italic">No students found.</td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">{student.rollNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">{student.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600 border border-slate-200">
                                                Section {student.section}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <span className="bg-blue-50 px-2 py-1 rounded text-xs font-bold text-blue-600 border border-blue-100 uppercase">
                                                {student.department}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleDeleteStudent(student._id)}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Student"
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentManager;
