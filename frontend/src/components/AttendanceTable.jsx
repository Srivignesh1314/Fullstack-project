import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FiFilter, FiSearch } from 'react-icons/fi';

const AttendanceTable = ({ refreshTrigger }) => {
    const [stats, setStats] = useState([]);
    const [filteredStats, setFilteredStats] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [subjectFilter, setSubjectFilter] = useState('');
    const [sectionFilter, setSectionFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Generate Sections A-Z
    const sections = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

    useEffect(() => {
        fetchStats();
        fetchSubjects();
    }, [refreshTrigger, subjectFilter]);

    useEffect(() => {
        let result = stats;
        if (searchTerm) {
            result = result.filter(s => 
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (sectionFilter) {
            result = result.filter(s => s.section === sectionFilter);
        }
        setFilteredStats(result);
    }, [searchTerm, sectionFilter, stats]);

    const fetchStats = async () => {
        try {
            const url = subjectFilter ? `/data/attendance/stats?subject=${subjectFilter}` : '/data/attendance/stats';
            const { data } = await api.get(url);
            setStats(data);
            setFilteredStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchSubjects = async () => {
        try {
            const { data } = await api.get('/data/subjects');
            setSubjects(data);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
            <div className="flex flex-col mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 sm:mb-0">Attendance Analytics</h3>
                    <div className="flex space-x-2">
                        <select 
                            className="border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 text-sm border bg-slate-50"
                            value={subjectFilter}
                            onChange={(e) => setSubjectFilter(e.target.value)}
                        >
                            <option value="">All Subjects</option>
                            {subjects.map(sub => (
                                <option key={sub._id} value={sub.name}>{sub.name}</option>
                            ))}
                        </select>
                        <select 
                            className="border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 text-sm border bg-slate-50"
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
                        placeholder="Search stats by name or roll number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Roll No.</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Present</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Percentage</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredStats.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center">
                                        <FiFilter size={32} className="mb-2 text-slate-300" />
                                        <p className="text-sm font-medium">No attendance records found.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredStats.map((stat) => (
                                <tr key={stat.studentId} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">{stat.rollNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                                        {stat.name} <span className="ml-1 text-[10px] text-slate-400 font-normal">Section {stat.section}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center font-medium">{stat.totalClasses}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center font-medium">{stat.presentClasses}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${
                                            stat.percentage >= 75 ? 'bg-green-50 text-green-700 border-green-100' : 
                                            stat.percentage >= 60 ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 'bg-red-50 text-red-700 border-red-100'
                                        }`}>
                                            {stat.percentage.toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceTable;
