import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    FiLogOut,
    FiUser,
    FiUsers,
    FiTrash2,
    FiPlus,
    FiSearch,
    FiShield,
    FiBookOpen,
} from 'react-icons/fi';

/* ─── Reusable Badge ─── */
const DeptBadge = ({ dept }) => {
    const colors = {
        CSE: 'bg-blue-100 text-blue-700 border-blue-200',
        EEE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        ECE: 'bg-green-100 text-green-700 border-green-200',
        CIVIL: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return (
        <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                colors[dept] || 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
        >
            {dept || 'N/A'}
        </span>
    );
};

const DEPARTMENTS = ['CSE', 'EEE', 'ECE', 'CIVIL'];

/* ═══════════════════════════════════════════════
   TEACHER MANAGEMENT PANEL
═══════════════════════════════════════════════ */
const TeacherPanel = () => {
    const [teachers, setTeachers] = useState([]);
    const [search, setSearch] = useState('');
    const [msg, setMsg] = useState({ text: '', ok: true });

    // Add form
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [department, setDepartment] = useState('CSE');
    const [loading, setLoading] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const headers = { Authorization: `Bearer ${userInfo.token}` };

    const fetchTeachers = async () => {
        try {
            const { data } = await api.get('/admin/teachers', { headers });
            setTeachers(data);
        } catch {
            setMsg({ text: 'Failed to load teachers', ok: false });
        }
    };

    useEffect(() => { fetchTeachers(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: '', ok: true });
        try {
            await api.post('/admin/teachers', { username, password, department }, { headers });
            setMsg({ text: `Teacher "${username}" added successfully!`, ok: true });
            setUsername('');
            setPassword('');
            fetchTeachers();
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Error adding teacher', ok: false });
        } finally { setLoading(false); }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Remove teacher "${name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/teachers/${id}`, { headers });
            setMsg({ text: `Teacher "${name}" removed.`, ok: true });
            fetchTeachers();
        } catch {
            setMsg({ text: 'Error removing teacher', ok: false });
        }
    };

    const filtered = teachers.filter(
        (t) =>
            t.username.toLowerCase().includes(search.toLowerCase()) ||
            (t.department || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Add Form */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
                <div className="flex items-center mb-5">
                    <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600 mr-3">
                        <FiUser size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Add New Teacher</h3>
                </div>
                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Username</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="teacher_username"
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Password</label>
                        <input
                            type="text"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="initial password"
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Department</label>
                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
                        >
                            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        <FiPlus /> Add Teacher
                    </button>
                </form>
                {msg.text && (
                    <p className={`mt-3 text-sm px-3 py-2 rounded-lg ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {msg.text}
                    </p>
                )}
            </div>

            {/* Teacher List */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
                    <h3 className="text-lg font-bold text-slate-800">
                        All Teachers <span className="text-slate-400 font-normal text-sm">({teachers.length})</span>
                    </h3>
                    <div className="relative w-full sm:w-56">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
                        />
                    </div>
                </div>
                <div className="overflow-hidden border border-slate-200 rounded-xl">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr><td colSpan="3" className="text-center py-8 text-slate-400 italic">No teachers found.</td></tr>
                            ) : filtered.map((t) => (
                                <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3 font-semibold text-slate-800">{t.username}</td>
                                    <td className="px-5 py-3"><DeptBadge dept={t.department} /></td>
                                    <td className="px-5 py-3 text-right">
                                        <button
                                            onClick={() => handleDelete(t._id, t.username)}
                                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove Teacher"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════
   STUDENT MANAGEMENT PANEL
═══════════════════════════════════════════════ */
const StudentPanel = () => {
    const [students, setStudents] = useState([]);
    const [deptFilter, setDeptFilter] = useState('');
    const [search, setSearch] = useState('');
    const [msg, setMsg] = useState({ text: '', ok: true });

    // Add form
    const [name, setName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [section, setSection] = useState('A');
    const [department, setDepartment] = useState('CSE');
    const [loading, setLoading] = useState(false);

    const sections = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const headers = { Authorization: `Bearer ${userInfo.token}` };

    const fetchStudents = async () => {
        try {
            const params = deptFilter ? { department: deptFilter } : {};
            const { data } = await api.get('/admin/students', { headers, params });
            setStudents(data);
        } catch {
            setMsg({ text: 'Failed to load students', ok: false });
        }
    };

    useEffect(() => { fetchStudents(); }, [deptFilter]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: '', ok: true });
        try {
            await api.post('/admin/students', { name, rollNumber, section, department }, { headers });
            setMsg({ text: `Student "${name}" added! Default password: password123`, ok: true });
            setName(''); setRollNumber(''); setSection('A');
            fetchStudents();
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Error adding student', ok: false });
        } finally { setLoading(false); }
    };

    const handleDelete = async (id, sName) => {
        if (!window.confirm(`Remove student "${sName}" and all their attendance records?`)) return;
        try {
            await api.delete(`/admin/students/${id}`, { headers });
            setMsg({ text: `Student "${sName}" removed.`, ok: true });
            fetchStudents();
        } catch {
            setMsg({ text: 'Error removing student', ok: false });
        }
    };

    const filtered = students.filter(
        (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.rollNumber.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Add Student Form */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
                <div className="flex items-center mb-5">
                    <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600 mr-3">
                        <FiUsers size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Enroll New Student</h3>
                </div>
                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Full Name</label>
                        <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 outline-none focus:ring-emerald-400 focus:border-emerald-400" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Roll Number</label>
                        <input type="text" required value={rollNumber} onChange={(e) => setRollNumber(e.target.value)}
                            placeholder="AP2411..."
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 outline-none focus:ring-emerald-400 focus:border-emerald-400" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Section</label>
                        <select value={section} onChange={(e) => setSection(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 outline-none focus:ring-emerald-400 focus:border-emerald-400">
                            {sections.map((s) => <option key={s}>Section {s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Department</label>
                        <select value={department} onChange={(e) => setDepartment(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 outline-none focus:ring-emerald-400 focus:border-emerald-400">
                            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                        </select>
                    </div>
                    <button type="submit" disabled={loading}
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                        <FiPlus /> Enroll
                    </button>
                </form>
                {msg.text && (
                    <p className={`mt-3 text-sm px-3 py-2 rounded-lg ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {msg.text}
                    </p>
                )}
            </div>

            {/* Filter + List */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
                    <h3 className="text-lg font-bold text-slate-800">
                        Student Directory <span className="text-slate-400 font-normal text-sm">({filtered.length})</span>
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50 outline-none focus:ring-emerald-400 focus:border-emerald-400">
                            <option value="">All Departments</option>
                            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                        </select>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="Search..." value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50 outline-none focus:ring-emerald-400 focus:border-emerald-400 w-44" />
                        </div>
                    </div>
                </div>
                <div className="overflow-hidden border border-slate-200 rounded-xl">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Roll No.</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Section</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Dept</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-slate-400 italic">No students found.</td></tr>
                            ) : filtered.map((s) => (
                                <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3 font-mono text-slate-600 font-medium">{s.rollNumber}</td>
                                    <td className="px-5 py-3 font-semibold text-slate-800">{s.name}</td>
                                    <td className="px-5 py-3">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold text-slate-600 border border-slate-200">
                                            {s.section}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3"><DeptBadge dept={s.department} /></td>
                                    <td className="px-5 py-3 text-right">
                                        <button onClick={() => handleDelete(s._id, s.name)}
                                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Remove Student">
                                            <FiTrash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════
   SUBJECT MANAGEMENT PANEL
═══════════════════════════════════════════════ */
const SubjectPanel = () => {
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [deptFilter, setDeptFilter] = useState('');
    const [search, setSearch] = useState('');
    const [msg, setMsg] = useState({ text: '', ok: true });

    // Add form
    const [name, setName] = useState('');
    const [department, setDepartment] = useState('CSE');
    const [loading, setLoading] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const headers = { Authorization: `Bearer ${userInfo.token}` };

    const fetchSubjects = async () => {
        try {
            const params = deptFilter ? { department: deptFilter } : {};
            const { data } = await api.get('/admin/subjects', { headers, params });
            setSubjects(data);
        } catch {
            setMsg({ text: 'Failed to load subjects', ok: false });
        }
    };

    const fetchStudentsForDept = async (dept) => {
        try {
            const { data } = await api.get('/admin/students', { headers, params: { department: dept } });
            setStudents(data);
            setSelectedStudents([]); // Reset selection when dept changes
        } catch {
            setMsg({ text: 'Failed to load students for department', ok: false });
        }
    };

    useEffect(() => { fetchSubjects(); }, [deptFilter]);
    
    useEffect(() => { fetchStudentsForDept(department); }, [department]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: '', ok: true });
        try {
            await api.post('/admin/subjects', { name, department, students: selectedStudents }, { headers });
            setMsg({ text: `Subject "${name}" added to ${department}!`, ok: true });
            setName('');
            setSelectedStudents([]);
            fetchSubjects();
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Error adding subject', ok: false });
        } finally { setLoading(false); }
    };

    const handleDelete = async (id, sName) => {
        if (!window.confirm(`Remove subject "${sName}" and all its attendance records?`)) return;
        try {
            await api.delete(`/admin/subjects/${id}`, { headers });
            setMsg({ text: `Subject "${sName}" removed.`, ok: true });
            fetchSubjects();
        } catch {
            setMsg({ text: 'Error removing subject', ok: false });
        }
    };

    const toggleStudent = (id) => {
        setSelectedStudents(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedStudents.length === students.length) setSelectedStudents([]);
        else setSelectedStudents(students.map(s => s._id));
    };

    const filtered = subjects.filter(
        (s) => s.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Subject Section */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-md border border-slate-100 p-6 flex flex-col h-fit sticky top-24">
                <div className="flex items-center mb-5">
                    <div className="p-2 bg-purple-100 rounded-xl text-purple-600 mr-3">
                        <FiBookOpen size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Add New Subject</h3>
                </div>
                
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Subject Name</label>
                        <input 
                            type="text" required value={name} onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Machine Learning"
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 outline-none focus:ring-purple-400 focus:border-purple-400" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Department</label>
                        <select value={department} onChange={(e) => setDepartment(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 outline-none focus:ring-purple-400 focus:border-purple-400">
                            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                        </select>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Enrolled Students ({selectedStudents.length})</label>
                            <button type="button" onClick={selectAll} className="text-[10px] font-bold text-purple-600 hover:text-purple-800 uppercase tracking-wider">
                                {selectedStudents.length === students.length && students.length > 0 ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                        <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg bg-slate-50 p-2 space-y-1">
                            {students.length === 0 ? (
                                <p className="text-xs text-slate-400 italic p-2 text-center">No students in {department}.</p>
                            ) : (
                                students.map(student => (
                                    <div 
                                        key={student._id} 
                                        onClick={() => toggleStudent(student._id)}
                                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${selectedStudents.includes(student._id) ? 'bg-purple-100/50 border border-purple-200/50' : 'hover:bg-white border border-transparent'}`}
                                    >
                                        <div className="flex items-center w-full">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedStudents.includes(student._id)}
                                                readOnly
                                                className="w-3.5 h-3.5 mr-2 rounded text-purple-600 border-slate-300 focus:ring-purple-500"
                                            />
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-slate-700">{student.name}</p>
                                                <p className="text-[10px] text-slate-500 font-mono">{student.rollNumber} • Sec {student.section}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <button type="submit" disabled={loading || !name.trim() || selectedStudents.length === 0}
                        className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                        <FiPlus /> Create Subject
                    </button>
                </form>

                {msg.text && (
                    <p className={`mt-3 text-sm px-3 py-2 rounded-lg ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {msg.text}
                    </p>
                )}
            </div>

            {/* Subject List */}
            <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 mb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <h3 className="text-lg font-bold text-slate-800">
                            Active Subjects <span className="text-slate-400 font-normal text-sm">({filtered.length})</span>
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
                                className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50 outline-none focus:ring-purple-400 focus:border-purple-400">
                                <option value="">All Departments</option>
                                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                            </select>
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" placeholder="Search..." value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50 outline-none focus:ring-purple-400 focus:border-purple-400 w-44" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filtered.length === 0 ? (
                        <div className="col-span-full py-12 bg-white rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 shadow-sm">
                             <FiBookOpen size={48} className="mb-4 opacity-20" />
                             <p className="font-medium">No subjects found</p>
                        </div>
                    ) : (
                        filtered.map((sub) => (
                            <div key={sub._id} className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 hover:shadow-lg transition-all group flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h5 className="font-bold text-slate-800 leading-tight mb-1 pr-2">{sub.name}</h5>
                                        <DeptBadge dept={sub.department} />
                                    </div>
                                    <button onClick={() => handleDelete(sub._id, sub.name)}
                                        className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg ml-auto" title="Delete Subject">
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                                <div className="mt-auto pt-3 border-t border-slate-50">
                                    <div className="flex items-center text-xs font-semibold text-slate-500 mb-2">
                                        <FiUsers className="mr-1.5 text-purple-400" size={14} /> 
                                        {sub.students?.length || 0} Enrolled
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {sub.students?.filter(s => s && s.name).slice(0, 3).map(s => (
                                            <span key={s._id} className="text-[10px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-100 font-medium">
                                                {s.name.split(' ')[0]}
                                            </span>
                                        ))}
                                        {sub.students?.length > 3 && (
                                            <span className="text-[10px] text-slate-400 px-1.5 py-0.5 font-medium">+{sub.students.length - 3}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════
   ADMIN DASHBOARD PAGE
═══════════════════════════════════════════════ */
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [activeTab, setActiveTab] = useState('teachers'); // 'teachers' | 'students'

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            navigate('/login');
            return;
        }
        const parsed = JSON.parse(userInfo);
        if (parsed.role !== 'admin') {
            navigate('/login');
            return;
        }
        setAdmin(parsed);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    if (!admin) return null;

    const tabs = [
        { id: 'teachers', label: 'Teachers', icon: <FiUser /> },
        { id: 'students', label: 'Students', icon: <FiUsers /> },
        { id: 'subjects', label: 'Subjects', icon: <FiBookOpen /> },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
            {/* Navbar */}
            <nav className="border-b border-white/10 backdrop-blur-sm bg-white/5 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Brand */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
                                <FiShield className="text-indigo-300 w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white leading-tight">Admin Panel</h1>
                                <p className="text-indigo-300 text-[10px] font-semibold uppercase tracking-widest">
                                    Attendance Tracker
                                </p>
                            </div>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex items-center bg-white/10 p-1 rounded-xl gap-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    {tab.icon}
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Admin Info + Logout */}
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-2 text-sm text-slate-300 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                                <FiShield className="text-indigo-400" />
                                <span className="font-medium">{admin.username}</span>
                                <span className="px-1.5 py-0.5 bg-indigo-500/40 text-indigo-200 rounded text-[10px] font-bold uppercase">
                                    Admin
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-white/10 hover:bg-red-500/30 border border-white/10 hover:border-red-400/30 transition-all"
                            >
                                <FiLogOut />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-white tracking-tight">
                        {activeTab === 'teachers' && 'Teacher Management'}
                        {activeTab === 'students' && 'Student Management'}
                        {activeTab === 'subjects' && 'Subject Management'}
                    </h2>
                    <p className="text-slate-400 mt-1">
                        {activeTab === 'teachers' && 'Create and remove faculty accounts across all departments'}
                        {activeTab === 'students' && 'Enroll and manage students across all departments'}
                        {activeTab === 'subjects' && 'Create and manage subjects and enroll students across all departments'}
                    </p>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'CSE', icon: <FiBookOpen />, color: 'from-blue-500 to-blue-600' },
                        { label: 'EEE', icon: <FiBookOpen />, color: 'from-yellow-500 to-yellow-600' },
                        { label: 'ECE', icon: <FiBookOpen />, color: 'from-green-500 to-green-600' },
                        { label: 'CIVIL', icon: <FiBookOpen />, color: 'from-orange-500 to-orange-600' },
                    ].map((dept) => (
                        <div
                            key={dept.label}
                            className={`bg-gradient-to-br ${dept.color} rounded-xl p-4 text-white flex justify-between items-center shadow-lg`}
                        >
                            <span className="font-bold text-sm">{dept.label}</span>
                            {dept.icon}
                        </div>
                    ))}
                </div>

                {/* Panel Content */}
                {activeTab === 'teachers' && <TeacherPanel />}
                {activeTab === 'students' && <StudentPanel />}
                {activeTab === 'subjects' && <SubjectPanel />}
            </main>
        </div>
    );
};

export default AdminDashboard;
