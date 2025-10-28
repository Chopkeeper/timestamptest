
import React, { useState, useEffect, useCallback } from 'react';
import type { User, TimeLog, Shift, GeolocationSettings } from './types';
import { LoginView, RegisterView } from './components/AuthView';
import { EmployeeView } from './components/EmployeeView';
import { AdminView } from './components/AdminView';

// Custom hook for persisting state to localStorage
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        const stickyValue = window.localStorage.getItem(key);
        return stickyValue !== null
            ? JSON.parse(stickyValue)
            : defaultValue;
    });
    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
    return [value, setValue];
}

const App = () => {
    const [users, setUsers] = useStickyState<User[]>([
        { id: 'admin', username: 'admin', password: 'password', firstName: 'Admin', lastName: 'User', position: 'System Admin', staffType: 'ข้าราชการ', workGroup: 'กลุ่มงานบริหาร', role: 'admin' }
    ], 'app-users');
    
    const [timeLogs, setTimeLogs] = useStickyState<TimeLog[]>([], 'app-time-logs');
    
    const [shifts, setShifts] = useStickyState<Shift[]>([
        { id: 'shift1', name: 'กะเช้า', startTime: '08:30', endTime: '16:30', lateGracePeriod: 15 },
        { id: 'shift2', name: 'กะบ่าย', startTime: '16:30', endTime: '00:30', lateGracePeriod: 15 },
        { id: 'shift3', name: 'กะดึก', startTime: '00:30', endTime: '08:30', lateGracePeriod: 15 },
    ], 'app-shifts');
    
    const [geoSettings, setGeoSettings] = useStickyState<GeolocationSettings>({
        center: null,
        radius: 100 // default 100 meters
    }, 'app-geo-settings');

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<'login' | 'register'>('login');

    const handleLogin = useCallback((username: string, password: string): void => {
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            setCurrentUser(user);
            setAuthError(null);
        } else {
            setAuthError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
    }, [users]);
    
    const handleLogout = useCallback((): void => {
        setCurrentUser(null);
    }, []);

    const handleRegister = useCallback((userData: Omit<User, 'id' | 'role'>): void => {
        if (users.some(u => u.username === userData.username)) {
            setAuthError('ชื่อผู้ใช้นี้มีอยู่แล้ว');
            return;
        }
        const newUser: User = {
            ...userData,
            id: `user_${Date.now()}`,
            role: 'employee',
        };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser); // Auto-login after registration
        setAuthError(null);
    }, [users, setUsers]);

    if (!currentUser) {
        if (currentView === 'register') {
            return <RegisterView 
                        onRegister={handleRegister} 
                        onSwitchToLogin={() => { setAuthError(null); setCurrentView('login'); }}
                        error={authError} 
                    />;
        }
        return <LoginView 
                    onLogin={handleLogin} 
                    onSwitchToRegister={() => { setAuthError(null); setCurrentView('register'); }} 
                    error={authError} 
                />;
    }

    if (currentUser.role === 'admin') {
        return <AdminView 
            users={users}
            setUsers={setUsers}
            logs={timeLogs}
            shifts={shifts}
            setShifts={setShifts}
            geoSettings={geoSettings}
            setGeoSettings={setGeoSettings}
            onLogout={handleLogout}
        />;
    }
    
    return <EmployeeView 
                user={currentUser} 
                logs={timeLogs} 
                setLogs={setTimeLogs}
                onLogout={handleLogout}
                geoSettings={geoSettings}
            />;
};

export default App;
