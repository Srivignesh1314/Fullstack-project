import React, { useState, useEffect } from 'react';
import { FiTarget, FiAlertCircle, FiCheckCircle, FiMinusCircle, FiBookOpen, FiAlertTriangle } from 'react-icons/fi';

const AttendanceCalculator = ({ stats = [] }) => {
    // Overall stats calculation
    const totalPresent = stats.reduce((acc, curr) => acc + curr.presentClasses, 0);
    const totalConducted = stats.reduce((acc, curr) => acc + curr.totalClasses, 0);

    const [selectedSubject, setSelectedSubject] = useState('overall');
    const [attended, setAttended] = useState(totalPresent);
    const [conducted, setConducted] = useState(totalConducted);
    
    const [result, setResult] = useState({
        percentage: 0,
        status: '',
        message: '',
        count: 0
    });

    useEffect(() => {
        if (selectedSubject === 'overall') {
            setAttended(totalPresent);
            setConducted(totalConducted);
        } else {
            const subjectData = stats.find(s => s.name === selectedSubject);
            if (subjectData) {
                setAttended(subjectData.presentClasses);
                setConducted(subjectData.totalClasses);
            }
        }
    }, [selectedSubject, totalPresent, totalConducted, stats]);

    useEffect(() => {
        calculateGoal();
    }, [attended, conducted]);

    const calculateGoal = () => {
        // Validation: Conducted cannot be less than attended
        if (conducted < attended) {
            setResult({ 
                percentage: (attended / conducted) * 100 || 0, 
                status: 'INVALID', 
                message: 'Error: Classes conducted cannot be less than classes attended.', 
                count: 0 
            });
            return;
        }

        if (conducted === 0) {
            setResult({ percentage: 0, status: 'N/A', message: 'No classes held yet', count: 0 });
            return;
        }

        const percentage = (attended / conducted) * 100;
        let status = '';
        let message = '';
        let count = 0;

        if (percentage < 75) {
            status = 'DANGER';
            // Streak needed: (attended + x) / (conducted + x) >= 0.75
            count = Math.ceil(3 * conducted - 4 * attended);
            message = `You need to attend ${count} more classes consecutively to hit 75%.`;
        } else if (percentage === 75) {
            status = 'SAFE';
            message = 'You are exactly on the baseline. Do not miss any classes!';
            count = 0;
        } else {
            status = 'SAFE';
            // Bunks allowed: attended / (conducted + y) >= 0.75
            count = Math.floor((4 * attended / 3) - conducted);
            message = `You can safely bunk ${count} classes and still stay above 75%.`;
        }

        setResult({ percentage, status, message, count });
    };

    return (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-600 rounded-xl text-white mr-4 shadow-lg shadow-blue-200">
                    <FiTarget size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800">Attendance Goal Calculator</h3>
                    <p className="text-sm text-slate-500 font-medium">Plan your bunker strategy & attendance goals</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs Section */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                            <FiBookOpen className="mr-2" /> Select Subject
                        </label>
                        <select 
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 focus:border-blue-500 focus:ring-0 transition-all font-medium text-slate-700"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                        >
                            <option value="overall">Overall Attendance</option>
                            {stats.map(s => (
                                <option key={s.studentId + s.name} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Attended</label>
                            <input 
                                type="number" 
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-lg font-bold text-slate-800"
                                value={attended}
                                onChange={(e) => setAttended(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Conducted</label>
                            <input 
                                type="number" 
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-lg font-bold text-slate-800"
                                value={conducted}
                                onChange={(e) => setConducted(parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-slate-600">Current Standing</span>
                            <span className={`text-sm font-bold ${result.status === 'SAFE' ? 'text-green-600' : result.status === 'INVALID' ? 'text-orange-600' : 'text-red-600'}`}>
                                {result.status === 'INVALID' ? '---' : `${result.percentage.toFixed(1)}%`}
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3">
                            <div 
                                className={`h-3 rounded-full transition-all duration-500 ${
                                    result.status === 'SAFE' ? 'bg-green-500' : 
                                    result.status === 'INVALID' ? 'bg-orange-500 animate-pulse' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(result.status === 'INVALID' ? 100 : result.percentage, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Result Section */}
                <div className={`rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-500 ${
                    result.status === 'SAFE' ? 'bg-green-50 border-2 border-green-100' : 
                    result.status === 'INVALID' ? 'bg-orange-50 border-2 border-orange-100' : 'bg-red-50 border-2 border-red-100'
                }`}>
                    {result.status === 'SAFE' ? (
                        <FiCheckCircle size={64} className="text-green-500 mb-4" />
                    ) : result.status === 'INVALID' ? (
                        <FiAlertTriangle size={64} className="text-orange-500 mb-4" />
                    ) : (
                        <FiAlertCircle size={64} className="text-red-500 mb-4" />
                    )}
                    
                    <h4 className={`text-2xl font-black mb-2 ${
                        result.status === 'SAFE' ? 'text-green-700' : 
                        result.status === 'INVALID' ? 'text-orange-700' : 'text-red-700'
                    }`}>
                        {result.status}
                    </h4>
                    
                    <p className={`text-sm font-semibold mb-6 max-w-[200px] leading-relaxed ${
                        result.status === 'SAFE' ? 'text-green-600' : 
                        result.status === 'INVALID' ? 'text-orange-600' : 'text-red-600'
                    }`}>
                        {result.message}
                    </p>

                    <div className={`px-6 py-3 rounded-full font-bold text-sm shadow-sm ${
                        result.status === 'SAFE' ? 'bg-green-500 text-white' : 
                        result.status === 'INVALID' ? 'bg-orange-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                        {result.status === 'SAFE' ? `${result.count} Bunks Available` : 
                         result.status === 'INVALID' ? 'Check Inputs' : `${result.count} Classes Goal`}
                    </div>
                    
                    <p className="mt-4 text-[10px] text-slate-400 font-medium uppercase tracking-widest">Target: 75.0% Access Baseline</p>
                </div>
            </div>
        </div>
    );
};

export default AttendanceCalculator;
