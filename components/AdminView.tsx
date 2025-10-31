import React, { useState, useMemo, useEffect } from 'react';
import type { TimeLog, User, Shift, GeolocationSettings } from '../types';
import { POSITIONS, STAFF_TYPES, WORK_GROUPS } from '../constants';
import { SettingsIcon, UserPlusIcon, ReportIcon, DownloadIcon, EditIcon, TrashIcon } from './icons';

// @ts-ignore
const XLSX = window.XLSX;


const EditUserModal = ({ user, onClose, onSave }: {
    user: User;
    onClose: () => void;
    onSave: (userId: number | string, data: Partial<User>) => Promise<void>;
}) => {
    const [formData, setFormData] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        position: user.position,
        staffType: user.staffType,
        workGroup: user.workGroup,
        password: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        
        const dataToSave: Partial<User> = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            position: formData.position,
            staffType: formData.staffType,
            workGroup: formData.workGroup,
        };
        if (formData.password.trim()) {
            dataToSave.password = formData.password.trim();
        }

        try {
            await onSave(user.id, dataToSave);
            onClose(); // Close modal on success
        } catch (err: any) {
            setError(err.message || "เกิดข้อผิดพลาดในการบันทึก");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-user-title">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h3 id="edit-user-title" className="text-xl font-semibold mb-4 text-gray-800">แก้ไขข้อมูล: {user.firstName} {user.lastName}</h3>
                <p className="text-sm text-gray-500 mb-4">ชื่อผู้ใช้: {user.username}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="ชื่อ" className="w-full px-3 py-2 border rounded-md" required />
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="นามสกุล" className="w-full px-3 py-2 border rounded-md" required />
                    </div>
                    <div>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="รหัสผ่านใหม่ (ปล่อยว่างไว้ถ้าไม่ต้องการเปลี่ยน)" className="w-full px-3 py-2 border rounded-md" />
                    </div>
                    <select name="position" value={formData.position} onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                        {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select name="staffType" value={formData.staffType} onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                        {STAFF_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select name="workGroup" value={formData.workGroup} onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                        {WORK_GROUPS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-300">
                            ยกเลิก
                        </button>
                        <button type="submit" disabled={isSaving} className="py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-primary-300 transition duration-300">
                            {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const UserManagement = ({ users, onAddUser, onUpdateUser, onDeleteUser }: { 
    users: User[], 
    onAddUser: (user: Omit<User, 'id' | 'role'>) => Promise<void>,
    onUpdateUser: (userId: number | string, userData: Partial<User>) => Promise<void>,
    onDeleteUser: (userId: number | string) => Promise<void>
}) => {
    const [newUser, setNewUser] = useState({
        username: '', password: '', firstName: '', lastName: '', 
        position: POSITIONS[0], staffType: STAFF_TYPES[0], workGroup: WORK_GROUPS[0]
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);


    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newUser.username && newUser.password && newUser.firstName && newUser.lastName) {
            setIsLoading(true);
            setError(null);
            try {
                await onAddUser(newUser);
                setNewUser({
                    username: '', password: '', firstName: '', lastName: '', 
                    position: POSITIONS[0], staffType: STAFF_TYPES[0], workGroup: WORK_GROUPS[0]
                });
            } catch (err: any) {
                setError(err.message || "เกิดข้อผิดพลาดในการเพิ่มผู้ใช้");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setNewUser(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveEdit = async (userId: number | string, userData: Partial<User>) => {
        try {
           await onUpdateUser(userId, userData);
           setEditingUser(null);
        } catch (error) {
            // Error is handled in the modal, but you could log it here too
            console.error("Failed to save user edit:", error);
        }
    };


    const handleDelete = async (userId: number | string) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
            try {
                await onDeleteUser(userId);
            } catch (error) {
                console.error("Deletion failed on component level", error);
                alert("Failed to delete user."); // Show feedback
            }
        }
    };
    
    return (
        <div className="space-y-6">
            <form onSubmit={handleAddUser} className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <h3 className="text-xl font-semibold text-gray-700">เพิ่มผู้ใช้งานใหม่</h3>
                {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}
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
                <button type="submit" disabled={isLoading} className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition duration-300 flex items-center justify-center gap-2 disabled:bg-primary-300">
                    <UserPlusIcon className="w-5 h-5" /> {isLoading ? 'กำลังเพิ่ม...' : 'เพิ่มผู้ใช้งาน'}
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
                                <th className="p-3">การกระทำ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.filter(u => u.role === 'employee').map(user => (
                                <tr key={user.id} className="border-b hover:bg-slate-50">
                                    <td className="p-3">{user.firstName} {user.lastName}</td>
                                    <td className="p-3">{user.position}</td>
                                    <td className="p-3">{user.staffType}</td>
                                    <td className="p-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingUser(user)} className="text-blue-600 hover:text-blue-800 p-1" title="แก้ไข">
                                                <EditIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800 p-1" title="ลบ">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveEdit} />}
        </div>
    );
};

const Settings = ({ initialShifts, initialGeoSettings, onSaveShifts, onSaveGeoSettings, onUpdateAdminPassword }: {
    initialShifts: Shift[],
    initialGeoSettings: GeolocationSettings,
    onSaveShifts: (shifts: Shift[]) => Promise<void>,
    onSaveGeoSettings: (settings: GeolocationSettings) => Promise<void>,
    onUpdateAdminPassword: (newPassword: string) => Promise<void>
}) => {
    const [shifts, setShifts] = useState(initialShifts);
    const [geoSettings, setGeoSettings] = useState(initialGeoSettings);
    const [isLoading, setIsLoading] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    useEffect(() => { setShifts(initialShifts) }, [initialShifts]);
    useEffect(() => { setGeoSettings(initialGeoSettings) }, [initialGeoSettings]);

    const handleShiftChange = (id: number | string, field: keyof Shift, value: string | number) => {
        setShifts(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleGeoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'latitude' || name === 'longitude') {
            setGeoSettings(prev => ({ ...prev, center: { ...prev.center!, [name]: parseFloat(value) || 0 } }));
        } else {
            setGeoSettings(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
        }
    };

    const setCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition(pos => {
            setGeoSettings(prev => ({...prev, center: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }}));
        });
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await onSaveGeoSettings(geoSettings);
            await onSaveShifts(shifts);
            alert("บันทึกการตั้งค่าสำเร็จ!");
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการบันทึกการตั้งค่า");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);

        if (!newPassword) {
            setPasswordError("กรุณากรอกรหัสผ่านใหม่");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("รหัสผ่านไม่ตรงกัน");
            return;
        }

        setIsSavingPassword(true);
        try {
            await onUpdateAdminPassword(newPassword);
            setPasswordSuccess("เปลี่ยนรหัสผ่านสำเร็จ!");
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setPasswordError(err.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
        } finally {
            setIsSavingPassword(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <h3 className="text-xl font-semibold text-gray-700">เปลี่ยนรหัสผ่านผู้ดูแลระบบ</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    {passwordError && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{passwordError}</div>}
                    {passwordSuccess && <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">{passwordSuccess}</div>}
                    <div>
                        <label className="block text-sm font-medium text-gray-600">รหัสผ่านใหม่</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md" placeholder="กรอกรหัสผ่านใหม่อย่างน้อย 4 ตัวอักษร" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-600">ยืนยันรหัสผ่านใหม่</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md" placeholder="กรอกรหัสผ่านใหม่อีกครั้ง" />
                    </div>
                    <button type="submit" disabled={isSavingPassword} className="w-full bg-slate-600 text-white py-2 px-4 rounded-md hover:bg-slate-700 transition duration-300 disabled:bg-slate-300">
                        {isSavingPassword ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
                    </button>
                </form>
            </div>
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
                                onChange={(e) => handleShiftChange(shift.id, 'lateGracePeriod', parseInt(e.target.value, 10) || 0)}
                                className="w-full mt-1 px-3 py-2 border rounded-md"
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6">
                <button onClick={handleSave} disabled={isLoading} className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 transition duration-300 disabled:bg-primary-300">
                    {isLoading ? "กำลังบันทึก..." : "บันทึกการตั้งค่าทั้งหมด"}
                </button>
            </div>
        </div>
    );
};


const Report = ({ logs, users, shifts }: { logs: TimeLog[], users: User[], shifts: Shift[] }) => {
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());

    const reportData = useMemo(() => {
        if (!users.length || !shifts.length) return [];
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

            let shift: Shift | undefined;
            // This logic might need refinement for edge cases around midnight
            const morningShift = shifts.find(s => s.name === 'กะเช้า'); // 08:30
            const afternoonShift = shifts.find(s => s.name === 'กะบ่าย'); // 16:30
            const nightShift = shifts.find(s => s.name === 'กะดึก'); // 00:30

            // Improved Shift Detection Logic
            if (inHour >= 6 && inHour < 14 && morningShift) shift = morningShift;      // Shift 1: Morning (e.g., 08:30 start) -> Check-in window 06:00 - 13:59
            else if (inHour >= 14 && inHour < 22 && afternoonShift) shift = afternoonShift; // Shift 2: Afternoon (e.g., 16:30 start) -> Check-in window 14:00 - 21:59
            else shift = nightShift;                                                // Shift 3: Night (e.g., 00:30 start) -> Catches the rest (22:00 - 05:59)
            
            if (!shift) return null; // Or handle as an error

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
                const [endHour, endMinute] = shift.endTime.split(':').map(Number);
                const shiftEndTime = new Date(inLog.timestamp);
                shiftEndTime.setHours(endHour, endMinute, 0, 0);

                if (endHour < startHour) { // Shift crosses midnight
                    shiftEndTime.setDate(shiftEndTime.getDate() + 1);
                }

                if (new Date().getTime() > shiftEndTime.getTime()) {
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


export const AdminView = ({ users, logs, shifts, geoSettings, onLogout, onAddUser, onSaveShifts, onSaveGeoSettings, onUpdateUser, onDeleteUser, onUpdateAdminPassword }: {
    users: User[],
    logs: TimeLog[],
    shifts: Shift[],
    geoSettings: GeolocationSettings,
    onLogout: () => void,
    onAddUser: (user: Omit<User, 'id' | 'role'>) => Promise<void>,
    onSaveShifts: (shifts: Shift[]) => Promise<void>,
    onSaveGeoSettings: (settings: GeolocationSettings) => Promise<void>,
    onUpdateUser: (userId: number | string, userData: Partial<User>) => Promise<void>,
    onDeleteUser: (userId: number | string) => Promise<void>,
    onUpdateAdminPassword: (newPassword: string) => Promise<void>,
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
                {activeTab === 'users' && <UserManagement users={users} onAddUser={onAddUser} onUpdateUser={onUpdateUser} onDeleteUser={onDeleteUser} />}
                {activeTab === 'settings' && <Settings initialShifts={shifts} initialGeoSettings={geoSettings} onSaveShifts={onSaveShifts} onSaveGeoSettings={onSaveGeoSettings} onUpdateAdminPassword={onUpdateAdminPassword} />}
                {activeTab === 'report' && <Report logs={logs} users={users} shifts={shifts} />}
            </div>
        </div>
    );
};