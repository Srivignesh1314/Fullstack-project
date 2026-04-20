import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiCheck, FiX, FiSave, FiSearch } from 'react-icons/fi';

const AttendanceForm = ({ onAttendanceMarked }) => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [subject, setSubject] = useState('');
    const [sectionFilter, setSectionFilter] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Generate Sections A-Z
    const sections = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        let result = students;
        if (searchTerm) {
            result = result.filter(s => 
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (sectionFilter) {
            result = result.filter(s => s.section === sectionFilter);
        }
        setFilteredStudents(result);
    }, [searchTerm, sectionFilter, students]);

    useEffect(() => {
        if (!subject) {
            setStudents([]);
            setFilteredStudents([]);
            return;
        }

        const selectedSub = subjects.find(s => s.name === subject);
        if (selectedSub && selectedSub.students) {
            const validStudents = selectedSub.students.filter(s => s !== null && s.name);
            setStudents(validStudents);
            setFilteredStudents(validStudents);
            
            // Default everyone to present
            const initialData = {};
            validStudents.forEach(s => {
                initialData[s._id] = 'Present';
            });
            setAttendanceData(initialData);
        }
    }, [subject, subjects]);

    const fetchSubjects = async () => {
        try {
            const { data } = await api.get('/data/subjects');
            setSubjects(data);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const toggleAttendance = (studentId) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        
        try {
            const payload = {
                subject,
                date,
                attendanceData: Object.keys(attendanceData).map(id => ({
                    studentId: id,
                    status: attendanceData[id]
                }))
            };
            
            await api.post('/data/attendance', payload);
            setMessage('Attendance marked successfully!');
            onAttendanceMarked(); // Refresh table
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error marking attendance');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6 font-primary text-gray-800 ">Mark Attendance</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                        <select 
                            required
                            className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border bg-slate-50"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        >
                            <option value="">Select Subject</option>
                            {subjects.map(sub => (
                                <option key={sub._id} value={sub.name}>{sub.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <input 
                            type="date" 
                            required
                            className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border bg-slate-50"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Section Filter</label>
                         <select 
                            className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border bg-slate-50"
                            value={sectionFilter}
                            onChange={(e) => setSectionFilter(e.target.value)}
                        >
                            <option value="">All Sections</option>
                            {sections.map(s => (
                                <option key={s} value={s}>Section {s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <FiSearch />
                    </div>
                    <input 
                        type="text"
                        className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm"
                        placeholder="Search students by name or roll number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {message && (
                    <div className={`p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </div>
                )}

                <div className="mt-6 overflow-hidden border border-slate-200 rounded-lg">
                    <div className="max-h-[400px] overflow-y-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Roll No.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-slate-500 italic">No students found matching your criteria.</td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.rollNumber}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{student.name} <span className="ml-1 text-[10px] text-slate-400 font-normal">Section {student.section}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleAttendance(student._id)}
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                                                        attendanceData[student._id] === 'Present' 
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500' 
                                                        : 'bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500'
                                                    }`}
                                                >
                                                    {attendanceData[student._id] === 'Present' ? (
                                                        <><FiCheck className="mr-1 inline" /> Present</>
                                                    ) : (
                                                        <><FiX className="mr-1 inline" /> Absent</>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                    >
                        <FiSave className="mr-2" />
                        Save Attendance
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AttendanceForm;
