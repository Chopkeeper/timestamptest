
import React, { useState, useEffect, useMemo } from 'react';
import type { User, TimeLog, GeolocationSettings } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';
import { getDistanceFromLatLonInMeters } from '../services/geolocationService';
import { LoginIcon, LogoutIcon, LocationOnIcon, LocationOffIcon, CheckCircleIcon, XCircleIcon } from './icons';

interface ConfirmationMessage {
    type: 'in' | 'out';
    time: string;
    name: string;
    position: string;
    workGroup: string;
    distance: number;
}

export const EmployeeView = ({ user, logs, onLogout, geoSettings, onClock }: {
    user: User,
    logs: TimeLog[],
    onLogout: () => void,
    geoSettings: GeolocationSettings,
    onClock: (log: Omit<TimeLog, 'id'>) => Promise<void>
}) => {
    const [time, setTime] = useState(new Date());
    const [confirmationMessage, setConfirmationMessage] = useState<ConfirmationMessage | null>(null);
    const location = useGeolocation();
    
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const userLastLog = useMemo(() => {
        return logs
            .filter(log => log.userId === user.id)
            .sort((a, b) => b.timestamp - a.timestamp)[0] || null;
    }, [logs, user.id]);

    const isClockedIn = userLastLog?.type === 'in';

    const canClockOut = useMemo(() => {
        if (!isClockedIn || !userLastLog) return false;
        const timeDiff = Date.now() - userLastLog.timestamp;
        const fourHoursInMillis = 4 * 60 * 60 * 1000;
        return timeDiff >= fourHoursInMillis;
    }, [isClockedIn, userLastLog, time]);

    const distance = useMemo(() => {
        if (location.latitude && location.longitude && geoSettings.center) {
            return getDistanceFromLatLonInMeters(
                location.latitude,
                location.longitude,
                geoSettings.center.latitude,
                geoSettings.center.longitude
            );
        }
        return null;
    }, [location, geoSettings.center]);

    const isInArea = distance !== null && distance <= geoSettings.radius;

    const handleClock = async (type: 'in' | 'out') => {
        if (!location.latitude || !location.longitude) {
            alert("ไม่สามารถระบุตำแหน่งได้");
            return;
        }
        if (!isInArea) {
             alert("คุณอยู่นอกพื้นที่ที่กำหนด");
            return;
        }

        if (type === 'out') {
            if (userLastLog && isClockedIn && !canClockOut) {
                const timeDiff = Date.now() - userLastLog.timestamp;
                const fourHoursInMillis = 4 * 60 * 60 * 1000;
                const remainingMillis = fourHoursInMillis - timeDiff;
                const remainingHours = Math.floor(remainingMillis / (1000 * 60 * 60));
                const remainingMinutes = Math.ceil((remainingMillis % (1000 * 60 * 60)) / (1000 * 60));
                alert(`ต้องทำงานอย่างน้อย 4 ชั่วโมงจึงจะสามารถลงเวลาออกได้ (เหลืออีกประมาณ ${remainingHours} ชั่วโมง ${remainingMinutes} นาที)`);
                return;
            }
        }

        let ipAddress = 'N/A';
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            if (response.ok) {
                const data = await response.json();
                ipAddress = data.ip;
            }
        } catch (error) {
            console.warn('Could not fetch IP address:', error);
        }

        const newLogData = {
            userId: user.id,
            timestamp: Date.now(),
            type,
            location: {
                latitude: location.latitude,
                longitude: location.longitude,
            },
            ipAddress,
        };

        try {
            await onClock(newLogData);
            setConfirmationMessage({
                type,
                time: new Date(newLogData.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
                name: `${user.firstName} ${user.lastName}`,
                position: user.position,
                workGroup: user.workGroup,
                distance: distance !== null ? Math.round(distance) : 0,
            });
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการบันทึกเวลา");
            console.error(error);
        }
    };

    if (confirmationMessage) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <div className="bg-slate-50 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-200">
                    <h2 className="text-2xl font-bold text-green-600 mb-6">
                        {confirmationMessage.type === 'in' ? 'บันทึกเวลาเข้างานสำเร็จ!' : 'บันทึกเวลาออกงานสำเร็จ!'}
                    </h2>
                    <div className="text-left space-y-3 text-lg text-gray-700">
                        <p><span className="font-semibold">เวลาที่บันทึก:</span> {confirmationMessage.time}</p>
                        <p><span className="font-semibold">ชื่อ-สกุล:</span> {confirmationMessage.name}</p>
                        <p><span className="font-semibold">ตำแหน่ง:</span> {confirmationMessage.position}</p>
                        <p><span className="font-semibold">กลุ่มงาน:</span> {confirmationMessage.workGroup}</p>
                        <p><span className="font-semibold">ระยะห่าง:</span> {confirmationMessage.distance} เมตร</p>
                    </div>
                    <button 
                        onClick={() => setConfirmationMessage(null)} 
                        className="mt-8 w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 transition duration-300"
                    >
                        ตกลง
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
             <div className="absolute top-4 right-4">
                 <button onClick={onLogout} className="bg-white text-gray-700 py-2 px-4 rounded-md shadow hover:bg-gray-50 transition">ออกจากระบบ</button>
             </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                <div className="mb-4">
                    <p className="text-xl text-gray-600">สวัสดี,</p>
                    <h1 className="text-4xl font-bold text-primary-700">{user.firstName} {user.lastName}</h1>
                    <p className="text-gray-500">{user.position}</p>
                </div>

                <div className="my-8 bg-gray-900 text-white rounded-lg p-6 font-mono text-6xl tracking-widest">
                    {time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                </div>
                
                 <div className={`flex items-center justify-center gap-2 p-3 rounded-md mb-6 ${isInArea ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isInArea ? <LocationOnIcon className="w-6 h-6"/> : <LocationOffIcon className="w-6 h-6"/>}
                    <span className="font-semibold">
                        {
                            location.error ? 'ข้อผิดพลาด: ' + location.error :
                            distance === null ? 'กำลังระบุตำแหน่ง...' :
                            isInArea ? `คุณอยู่ในพื้นที่ (ห่าง ${distance.toFixed(0)} ม.)` : `คุณอยู่นอกพื้นที่ (ห่าง ${distance.toFixed(0)} ม.)`
                        }
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => handleClock('in')} 
                        disabled={isClockedIn || !isInArea}
                        className="flex flex-col items-center justify-center gap-2 bg-green-500 text-white p-6 rounded-lg text-2xl font-bold transition duration-300 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        <LoginIcon className="w-10 h-10" />
                        <span>เข้างาน</span>
                    </button>
                    <button 
                        onClick={() => handleClock('out')} 
                        disabled={!isClockedIn || !isInArea || !canClockOut}
                        className="flex flex-col items-center justify-center gap-2 bg-red-500 text-white p-6 rounded-lg text-2xl font-bold transition duration-300 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        <LogoutIcon className="w-10 h-10" />
                        <span>ออกงาน</span>
                    </button>
                </div>

                <div className="mt-8 text-left p-4 bg-slate-50 rounded-lg">
                    <h2 className="font-semibold text-lg mb-2 text-gray-700">สถานะล่าสุด</h2>
                    {userLastLog ? (
                        <div className={`flex items-center gap-3 ${isClockedIn ? 'text-green-700' : 'text-red-700'}`}>
                             {isClockedIn ? <CheckCircleIcon className="w-6 h-6"/> : <XCircleIcon className="w-6 h-6" />}
                            <div>
                                <p className="font-bold">
                                    {isClockedIn ? 'เข้างาน' : 'ออกงาน'} เมื่อ
                                </p>
                                <p className="text-gray-600">
                                    {new Date(userLastLog.timestamp).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'medium' })}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">ยังไม่มีข้อมูลการลงเวลา</p>
                    )}
                </div>
            </div>
        </div>
    );
};
