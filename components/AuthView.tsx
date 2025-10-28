
import React, { useState } from 'react';
import { POSITIONS, STAFF_TYPES, WORK_GROUPS } from '../constants';
import type { User } from '../types';

interface LoginViewProps {
    onLogin: (username: string, password: string) => void;
    onSwitchToRegister: () => void;
    error: string | null;
}

export const LoginView = ({ onLogin, onSwitchToRegister, error }: LoginViewProps) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(username, password);
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-gray-800">ระบบลงเวลา</h1>
                <p className="text-center text-gray-500">กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}
                    <div>
                        <label className="text-sm font-bold text-gray-600 block">ชื่อผู้ใช้</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 mt-1 text-gray-800 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-600 block">รหัสผ่าน</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 mt-1 text-gray-800 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <button type="submit" className="w-full py-3 px-4 text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-300">
                            เข้าสู่ระบบ
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <button onClick={onSwitchToRegister} className="text-sm text-primary-600 hover:underline">
                        ยังไม่มีบัญชี? สมัครใช้งาน
                    </button>
                </div>
            </div>
        </div>
    );
};


interface RegisterViewProps {
    onRegister: (userData: Omit<User, 'id' | 'role'>) => void;
    onSwitchToLogin: () => void;
    error: string | null;
}

export const RegisterView = ({ onRegister, onSwitchToLogin, error }: RegisterViewProps) => {
    const [formData, setFormData] = useState({
        username: '', password: '', firstName: '', lastName: '',
        position: POSITIONS[0], staffType: STAFF_TYPES[0], workGroup: WORK_GROUPS[0]
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onRegister(formData);
    };

    return (
        <div className="flex items-center justify-center min-h-screen py-10">
            <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-gray-800">สมัครใช้งาน</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="ชื่อ" name="firstName" value={formData.firstName} onChange={handleChange} required />
                        <InputField label="นามสกุล" name="lastName" value={formData.lastName} onChange={handleChange} required />
                        <InputField label="ชื่อผู้ใช้ (Username)" name="username" value={formData.username} onChange={handleChange} required />
                        <InputField label="รหัสผ่าน" name="password" type="password" value={formData.password} onChange={handleChange} required />
                        <SelectField label="ตำแหน่ง" name="position" value={formData.position} onChange={handleChange} options={POSITIONS} />
                        <SelectField label="ประเภทเจ้าหน้าที่" name="staffType" value={formData.staffType} onChange={handleChange} options={STAFF_TYPES} />
                        <SelectField label="กลุ่มงาน" name="workGroup" value={formData.workGroup} onChange={handleChange} options={WORK_GROUPS} />
                    </div>
                    <div>
                        <button type="submit" className="w-full py-3 px-4 text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-300">
                            สมัครใช้งาน
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <button onClick={onSwitchToLogin} className="text-sm text-primary-600 hover:underline">
                        มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper components for form fields
const InputField = ({ label, name, type = 'text', value, onChange, required=false }: {
    label: string, name: string, type?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, required?: boolean
}) => (
    <div>
        <label className="text-sm font-bold text-gray-600 block">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full p-2 mt-1 text-gray-800 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required={required}
        />
    </div>
);

const SelectField = ({ label, name, value, onChange, options }: {
    label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[]
}) => (
    <div>
        <label className="text-sm font-bold text-gray-600 block">{label}</label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            className="w-full p-2 mt-1 text-gray-800 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);
