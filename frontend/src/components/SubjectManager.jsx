import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiPlus, FiBookOpen, FiBookmark, FiTrash2, FiUsers, FiCheck } from 'react-icons/fi';

const SubjectManager = () => {
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [newSubject, setNewSubject] = useState('');
    const [department, setDepartment] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const userDept = userInfo.department;
        if (userDept) {
            setDepartment(userDept);
        }
        fetchSubjects();
        fetchStudents();
    }, []);

    const fetchSubjects = async () => {
        try {
            const { data } = await api.get('/data/subjects');
            setSubjects(data);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchStudents = async () => {
        try {
            const { data } = await api.get('/data/students');
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        if (!newSubject.trim()) return;
        
        setLoading(true);
        setMessage('');
        try {
            await api.post('/data/subjects', { 
                name: newSubject, 
                department,
                students: selectedStudents 
            });
            setMessage('Subject added successfully!');
            setNewSubject('');
            setSelectedStudents([]);
            fetchSubjects();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Server Error: Check if backend is running');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubject = async (id) => {
        if (!window.confirm('Delete subject and all its attendance records?')) return;
        setLoading(true);
        try {
            const { data } = await api.delete(`/data/subjects/${id}`);
            setMessage(data.message || 'Subject deleted successfully');
            fetchSubjects();
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Error deleting subject';
            console.error('Delete Subject Error:', error);
            setMessage(`Delete failed: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const toggleStudentSelection = (studentId) => {
        if (selectedStudents.includes(studentId)) {
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        } else {
            setSelectedStudents([...selectedStudents, studentId]);
        }
    };

    const selectAllStudents = () => {
        if (selectedStudents.length === students.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.map(s => s._id));
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Subject Section */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6 border border-slate-100 flex flex-col h-fit sticky top-24">
                <div className="flex items-center mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600 mr-3">
                        <FiBookOpen size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Add New Subject</h3>
                </div>
                
                <form onSubmit={handleAddSubject} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Subject Name</label>
                        <input 
                            type="text" 
                            required
                            className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border bg-slate-50"
                            placeholder="Ex: Machine Learning"
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value)}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-slate-700">Enrolled Students ({selectedStudents.length})</label>
                            <button 
                                type="button" 
                                onClick={selectAllStudents}
                                className="text-xs font-bold text-blue-600 hover:text-blue-800"
                            >
                                {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                        <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg bg-slate-50 p-2 space-y-1">
                            {students.length === 0 ? (
                                <p className="text-xs text-slate-500 italic p-2 text-center">No students found in {department} department.</p>
                            ) : (
                                students.map(student => (
                                    <div 
                                        key={student._id} 
                                        onClick={() => toggleStudentSelection(student._id)}
                                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${selectedStudents.includes(student._id) ? 'bg-blue-100 border border-blue-200' : 'hover:bg-white border border-transparent'}`}
                                    >
                                        <div className="flex items-center">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 ${selectedStudents.includes(student._id) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`}>
                                                {selectedStudents.includes(student._id) && <FiCheck size={10} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700">{student.name}</p>
                                                <p className="text-[10px] text-slate-500">{student.rollNumber} - Sec {student.section}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !newSubject.trim() || selectedStudents.length === 0}
                        className="w-full inline-flex justify-center items-center px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                    >
                        <FiPlus className="mr-2" /> Create Subject
                    </button>
                </form>

                {message && (
                    <div className={`mt-6 p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </div>
                )}
            </div>

            {/* Subject List Section */}
            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-slate-700 uppercase tracking-widest">Active Subjects</h4>
                    <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200">{department || 'FACULTY'} DEPT</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subjects.length === 0 ? (
                        <div className="col-span-full py-12 bg-white rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                             <FiBookOpen size={48} className="mb-4 opacity-20" />
                             <p className="font-medium font-secondary">No subjects added yet</p>
                        </div>
                    ) : (
                        subjects.map((sub) => (
                            <div key={sub._id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-slate-50 rounded-lg text-blue-500 mr-3 border border-slate-100">
                                            <FiBookmark size={18} />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-slate-800 leading-tight">{sub.name}</h5>
                                            <div className="flex items-center mt-1 space-x-2">
                                                <span className="flex items-center text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                    <FiUsers className="mr-1" /> {sub.students?.length || 0} Students
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteSubject(sub._id)}
                                        className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg flex items-center justify-center"
                                        title="Delete Subject"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {sub.students?.filter(s => s && s.name).slice(0, 3).map(s => (
                                        <span key={s._id} className="text-[10px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-100">
                                            {s.name.split(' ')[0]}
                                        </span>
                                    ))}
                                    {sub.students?.length > 3 && (
                                        <span className="text-[10px] text-slate-400 px-1.5 py-0.5">+{sub.students.length - 3} more</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubjectManager;
