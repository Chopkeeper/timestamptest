import React, { useState, useEffect, useCallback } from 'react';
import type { User, TimeLog, Shift, GeolocationSettings } from './types';
import { LoginView, RegisterView } from './components/AuthView';
import { EmployeeView } from './components/EmployeeView';
import { AdminView } from './components/AdminView';

// --- !!! สำคัญ: แก้ไข IP Address ตรงนี้ !!! ---
// 1. หา IP Address ของคอมพิวเตอร์ที่รัน Backend Server (ใช้คำสั่ง ipconfig ใน cmd)
// 2. นำ IP Address ที่ได้ (เช่น 192.168.1.105) มาใส่แทนที่ "your_computer_ip_address"
const API_URL = 'http://your_computer_ip_address:3001/api'; 

const App = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [geoSettings, setGeoSettings] = useState<GeolocationSettings>({ center: null, radius: 100 });

    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const savedUser = sessionStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [authError, setAuthError] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<'login' | 'register'>('login');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // --- Data Fetching ---
    const fetchDataForUser = useCallback(async (user: User) => {
        setIsLoading(true);
        try {
            if (user.role === 'admin') {
                const res = await fetch(`${API_URL}/data/all`);
                if (!res.ok) throw new Error('Failed to fetch admin data');
                const data = await res.json();
                setUsers(data.users);
                setTimeLogs(data.logs);
                setShifts(data.shifts);
                setGeoSettings(data.geoSettings);
            } else {
                const res = await fetch(`${API_URL}/data/employee/${user.id}`);
                if (!res.ok) throw new Error('Failed to fetch employee data');
                const data = await res.json();
                setTimeLogs(data.logs);
                setShifts(data.shifts);
                setGeoSettings(data.geoSettings);
            }
        } catch (error: any) {
            console.error("Fetch data error:", error);
            setAuthError(error.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchDataForUser(currentUser);
        } else {
            setIsLoading(false);
        }
    }, [currentUser, fetchDataForUser]);


    // --- API Handlers ---
    const handleLogin = useCallback(async (username: string, password: string): Promise<void> => {
        try {
            setAuthError(null);
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Login failed');
            
            setCurrentUser(data);
            sessionStorage.setItem('currentUser', JSON.stringify(data));
        } catch (error: any) {
            setAuthError(error.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
    }, []);
    
    const handleLogout = useCallback((): void => {
        setCurrentUser(null);
        sessionStorage.removeItem('currentUser');
    }, []);

    const handleRegister = useCallback(async (userData: Omit<User, 'id' | 'role'>): Promise<void> => {
        try {
            setAuthError(null);
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Registration failed');
           
            alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
            setCurrentView('login');
        } catch (error: any) {
             setAuthError(error.message || 'ชื่อผู้ใช้นี้มีอยู่แล้ว');
        }
    }, []);
    
    const handleAddUserByAdmin = useCallback(async (userData: Omit<User, 'id' | 'role'>): Promise<void> => {
         try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to add user');
            
            setUsers(prev => [...prev, data]); // Add new user to local state
        } catch (error: any) {
            console.error(error);
            throw error; // re-throw to be caught in component
        }
    }, []);

    const handleUpdateUser = useCallback(async (userId: number | string, userData: Partial<User>): Promise<void> => {
        try {
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            const updatedUser = await response.json();
            if (!response.ok) {
                throw new Error(updatedUser.error || 'Failed to update user');
            }
            setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
        } catch (error: any) {
            console.error(error);
            throw error;
        }
    }, [setUsers]);

    const handleUpdateAdminPassword = useCallback(async (newPassword: string): Promise<void> => {
        try {
            const response = await fetch(`${API_URL}/admin/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword }),
            });
             if (!response.ok) {
                const result = await response.json().catch(() => ({ error: 'An unexpected error occurred.' }));
                throw new Error(result.error || 'Failed to update admin password');
            }
        } catch (error: any) {
            console.error(error);
            throw error;
        }
    }, []);


    const handleDeleteUser = useCallback(async (userId: number | string): Promise<void> => {
        try {
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete user');
            }
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error: any) {
            console.error(error);
            alert(error.message);
            throw error;
        }
    }, [setUsers]);

    const handleClock = useCallback(async (logData: Omit<TimeLog, 'id'>): Promise<void> => {
        const response = await fetch(`${API_URL}/timelogs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData),
        });
        const newLog = await response.json();
        if (!response.ok) throw new Error(newLog.error || 'Failed to clock in/out');

        setTimeLogs(prev => [...prev, newLog]);
    }, []);
    
    const handleSaveGeoSettings = useCallback(async (settings: GeolocationSettings): Promise<void> => {
        const response = await fetch(`${API_URL}/settings/geo`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        if (!response.ok) throw new Error('Failed to save geo settings');
        setGeoSettings(settings);
    }, []);

    const handleSaveShifts = useCallback(async (updatedShifts: Shift[]): Promise<void> => {
        const response = await fetch(`${API_URL}/settings/shifts`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedShifts),
        });
        if (!response.ok) throw new Error('Failed to save shift settings');
        setShifts(updatedShifts);
    }, []);


    // --- View Rendering ---
    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">กำลังโหลด...</div>;
    }

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
            logs={timeLogs}
            shifts={shifts}
            geoSettings={geoSettings}
            onLogout={handleLogout}
            onAddUser={handleAddUserByAdmin}
            onSaveGeoSettings={handleSaveGeoSettings}
            onSaveShifts={handleSaveShifts}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onUpdateAdminPassword={handleUpdateAdminPassword}
        />;
    }
    
    return <EmployeeView 
                user={currentUser} 
                logs={timeLogs} 
                onLogout={handleLogout}
                geoSettings={geoSettings}
                onClock={handleClock}
            />;
};

export default App;