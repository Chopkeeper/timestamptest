import React, { useState, useMemo } from 'react';
import type { TimeLog, User, Shift, GeolocationSettings } from '../types';
import { POSITIONS, STAFF_TYPES, WORK_GROUPS } from '../constants';
import { SettingsIcon, UserPlusIcon, ReportIcon, DownloadIcon } from './icons';

// @ts-ignore
const XLSX = window.XLSX;


const UserManagement = ({ users, setUsers }: { users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>> }) => {
    const [newUser, setNewUser] = useState({
        username: '', password: '', firstName: '', lastName: '', 
        position: POSITIONS[0], staffType: STAFF_TYPES[0], workGroup: WORK_GROUPS[0]
    });

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (newUser.username && newUser.password && newUser.firstName && newUser.lastName) {
            setUsers(prev => [...prev, {
                ...newUser,
                id: `user_${Date.now()}`,
                role: 'employee',
            }]);
            setNewUser({
                username: '', password: '', firstName: '', lastName: '', 
                position: POSITIONS[0], staffType: STAFF_TYPES[0], workGroup: WORK_GROUPS[0]
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setNewUser(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    return (
        <div className="space-y-6">
            <form onSubmit={handleAddUser} className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <h3 className="text-xl font-semibold text-gray-700">เพิ่มผู้ใช้งานใหม่</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="firstName" value={newUser.firstName} onChange={handleInputChange} placeholder="ชื่อ" className="w-full px-3 py-2 border rounded-md" required />
                    <input type="text" name="lastName" value={newUser.lastName} onChange={handleInputChange} placeholder="นามสกุล" className="w-full px-3 py-2 border rounded-md" required />
                    <input type="text" name="username" value={newUser.username} onChange={handleInputChange} placeholder="ชื่อผู้ใช้ (Username)" className="w-full px-3 py-2 border rounded-md" required />
                    <input type="password" name="password" value={newUser.password} onChange={handleInputChange} placeholder="รหัสผ่าน" className="w-full px-3 py-2 border rounded-md" required />
                    <select name="position" value={newUser.position} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md">
                        {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select name="staffType" value={newUser.staffType} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md">
                        {STAFF_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select name="workGroup" value={newUser.workGroup} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md">
                        {WORK_GROUPS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <button type="submit" className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition duration-300 flex items-center justify-center gap-2">
                    <UserPlusIcon className="w-5 h-5" /> เพิ่มผู้ใช้งาน
                </button>
            </form>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">รายชื่อผู้ใช้งานทั้งหมด</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b">
                                <th className="p-3">ชื่อ-นามสกุล</th>
                                <th className="p-3">ตำแหน่ง</th>
                                <th className="p-3">ประเภท</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.filter(u => u.role === 'employee').map(user => (
                                <tr key={user.id} className="border-b">
                                    <td className="p-3">{user.firstName} {user.lastName}</td>
                                    <td className="p-3">{user.position}</td>
                                    <td className="p-3">{user.staffType}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const Settings = ({ shifts, setShifts, geoSettings, setGeoSettings }: { shifts: Shift[], setShifts: React.Dispatch<React.SetStateAction<Shift[]>>, geoSettings: GeolocationSettings, setGeoSettings: React.Dispatch<React.SetStateAction<GeolocationSettings>> }) => {
    
    const handleShiftChange = (id: string, field: keyof Shift, value: string | number) => {
        setShifts(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleGeoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'latitude' || name === 'longitude') {
            setGeoSettings(prev => ({ ...prev, center: { ...prev.center!, [name]: parseFloat(value) } }));
        } else {
            setGeoSettings(prev => ({ ...prev, [name]: parseInt(value, 10) }));
        }
    };

    const setCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition(pos => {
            setGeoSettings(prev => ({...prev, center: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }}));
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <h3 className="text-xl font-semibold text-gray-700">ตั้งค่าพื้นที่เช็คอิน</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">ละติจูด</label>
                        <input type="number" step="any" name="latitude" value={geoSettings.center?.latitude || ''} onChange={handleGeoChange} className="w-full mt-1 px-3 py-2 border rounded-md" placeholder="e.g. 13.7563" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">ลองจิจูด</label>
                        <input type="number" step="any" name="longitude" value={geoSettings.center?.longitude || ''} onChange={handleGeoChange} className="w-full mt-1 px-3 py-2 border rounded-md" placeholder="e.g. 100.5018"/>
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-600">รัศมี (เมตร)</label>
                    <input type="number" name="radius" value={geoSettings.radius} onChange={handleGeoChange} className="w-full mt-1 px-3 py-2 border rounded-md" />
                 </div>
                 <button onClick={setCurrentLocation} className="w-full bg-slate-500 text-white py-2 px-4 rounded-md hover:bg-slate-600 transition duration-300">
                    ใช้ตำแหน่งปัจจุบัน
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <h3 className="text-xl font-semibold text-gray-700">ตั้งค่ากะการทำงานและเวลาสาย</h3>
                {shifts.map(shift => (
                    <div key={shift.id} className="border p-4 rounded-md space-y-2">
                        <p className="font-semibold">{shift.name} ({shift.startTime} - {shift.endTime})</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">อนุญาตให้สายได้ (นาที)</label>
                            <input 
                                type="number" 
                                value={shift.lateGracePeriod} 
                                onChange={(e) => handleShiftChange(shift.id, 'lateGracePeriod', parseInt(e.target.value, 10))}
                                className="w-full mt-1 px-3 py-2 border rounded-md"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const Report = ({ logs, users, shifts }: { logs: TimeLog[], users: User[], shifts: Shift[] }) => {
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());

    const reportData = useMemo(() => {
        const userMap = new Map(users.map(u => [u.id, u]));
        const dailyLogs: { [key: string]: { in: TimeLog | null, out: TimeLog | null } } = {};

        logs
            .filter(log => new Date(log.timestamp).getMonth() === month && new Date(log.timestamp).getFullYear() === year)
            .forEach(log => {
                const dateKey = new Date(log.timestamp).toLocaleDateString('th-TH');
                const key = `${log.userId}-${dateKey}`;
                if (!dailyLogs[key]) dailyLogs[key] = { in: null, out: null };
                if (log.type === 'in' && (!dailyLogs[key].in || log.timestamp < dailyLogs[key].in!.timestamp)) {
                    dailyLogs[key].in = log;
                }
                if (log.type === 'out' && (!dailyLogs[key].out || log.timestamp > dailyLogs[key].out!.timestamp)) {
                    dailyLogs[key].out = log;
                }
            });

        return Object.entries(dailyLogs).map(([key, { in: inLog, out: outLog }]) => {
            if (!inLog) return null;
            const user = userMap.get(inLog.userId);
            if (!user) return null;
            
            const inTime = new Date(inLog.timestamp);
            const inHour = inTime.getHours();

            let shift: Shift;
            if (inHour >= 4 && inHour < 12) shift = shifts[0]; // 8:30 shift
            else if (inHour >= 12 && inHour < 20) shift = shifts[1]; // 16:30 shift
            else shift = shifts[2]; // 00:30 shift

            const [startHour, startMinute] = shift.startTime.split(':').map(Number);
            const shiftStartTime = new Date(inLog.timestamp);
            shiftStartTime.setHours(startHour, startMinute, 0, 0);

            const lateThreshold = shiftStartTime.getTime() + shift.lateGracePeriod * 60 * 1000;
            const isLate = inLog.timestamp > lateThreshold;

            let clockOutDisplay = '-';
            let statusDisplay = isLate ? 'มาสาย' : 'ตรงเวลา';
            let ipAddressOut = '-';

            if (outLog) {
                clockOutDisplay = new Date(outLog.timestamp).toLocaleTimeString('th-TH');
                ipAddressOut = outLog.ipAddress || '-';
            } else {
                // Check for auto-clock-out condition
                const [endHour, endMinute] = shift.endTime.split(':').map(Number);
                const shiftEndTime = new Date(inLog.timestamp);
                shiftEndTime.setHours(endHour, endMinute, 0, 0);

                if (endHour < startHour) {
                    shiftEndTime.setDate(shiftEndTime.getDate() + 1);
                }

                if (new Date() > shiftEndTime) {
                    statusDisplay = 'ไม่ลงเวลาออก';
                }
            }

            return {
                rawTimestamp: inLog.timestamp,
                date: inTime.toLocaleDateString('th-TH'),
                user: `${user.firstName} ${user.lastName}`,
                position: user.position,
                shift: shift.name,
                clockIn: inTime.toLocaleTimeString('th-TH'),
                ipAddressIn: inLog.ipAddress || '-',
                clockOut: clockOutDisplay,
                ipAddressOut: ipAddressOut,
                status: statusDisplay,
            };
        }).filter(Boolean).sort((a,b) => b!.rawTimestamp - a!.rawTimestamp);

    }, [logs, users, shifts, month, year]);

    const handleExport = () => {
        const dataToExport = reportData.map(row => ({
            'วันที่': row?.date,
            'พนักงาน': row?.user,
            'ตำแหน่ง': row?.position,
            'กะ': row?.shift,
            'เวลาเข้า': row?.clockIn,
            'IP (เข้า)': row?.ipAddressIn,
            'เวลาออก': row?.clockOut,
            'IP (ออก)': row?.ipAddressOut,
            'สถานะ': row?.status,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        XLSX.writeFile(workbook, `TimeReport_${year}_${month+1}.xlsx`);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">รายงานการลงเวลา</h3>
            <div className="flex flex-wrap gap-4 mb-4">
                <select value={month} onChange={e => setMonth(Number(e.target.value))} className="px-3 py-2 border rounded-md">
                    {Array.from({length: 12}, (_, i) => <option key={i} value={i}>{new Date(0, i).toLocaleString('th-TH', { month: 'long' })}</option>)}
                </select>
                <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-2 border rounded-md" />
                <button onClick={handleExport} className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 flex items-center gap-2">
                    <DownloadIcon className="w-5 h-5"/> Export to XLSX
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b">
                            <th className="p-3">วันที่</th>
                            <th className="p-3">พนักงาน</th>
                            <th className="p-3">ตำแหน่ง</th>
                            <th className="p-3">กะ</th>
                            <th className="p-3">เวลาเข้า</th>
                            <th className="p-3">IP (เข้า)</th>
                            <th className="p-3">เวลาออก</th>
                            <th className="p-3">IP (ออก)</th>
                            <th className="p-3">สถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row, index) => row && (
                            <tr key={index} className="border-b">
                                <td className="p-3">{row.date}</td>
                                <td className="p-3">{row.user}</td>
                                <td className="p-3">{row.position}</td>
                                <td className="p-3">{row.shift}</td>
                                <td className="p-3">{row.clockIn}</td>
                                <td className="p-3 text-sm text-gray-600">{row.ipAddressIn}</td>
                                <td className="p-3">{row.clockOut}</td>
                                <td className="p-3 text-sm text-gray-600">{row.ipAddressOut}</td>
                                <td className={`p-3 font-semibold ${row.status === 'มาสาย' ? 'text-red-500' : row.status === 'ไม่ลงเวลาออก' ? 'text-amber-600' : 'text-green-500'}`}>{row.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


export const AdminView = ({ users, setUsers, logs, shifts, setShifts, geoSettings, setGeoSettings, onLogout }: {
    users: User[],
    setUsers: React.Dispatch<React.SetStateAction<User[]>>,
    logs: TimeLog[],
    shifts: Shift[],
    setShifts: React.Dispatch<React.SetStateAction<Shift[]>>,
    geoSettings: GeolocationSettings,
    setGeoSettings: React.Dispatch<React.SetStateAction<GeolocationSettings>>,
    onLogout: () => void
}) => {
    const [activeTab, setActiveTab] = useState('report');

    const tabs = [
        { id: 'report', label: 'รายงาน', icon: <ReportIcon/> },
        { id: 'users', label: 'จัดการผู้ใช้', icon: <UserPlusIcon/> },
        { id: 'settings', label: 'ตั้งค่า', icon: <SettingsIcon/> },
    ];
    
    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <button onClick={onLogout} className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition">ออกจากระบบ</button>
            </div>

            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                        >
                            {React.cloneElement(tab.icon, { className: 'w-5 h-5'})}
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {activeTab === 'users' && <UserManagement users={users} setUsers={setUsers} />}
                {activeTab === 'settings' && <Settings shifts={shifts} setShifts={setShifts} geoSettings={geoSettings} setGeoSettings={setGeoSettings} />}
                {activeTab === 'report' && <Report logs={logs} users={users} shifts={shifts} />}
            </div>
        </div>
    );
};