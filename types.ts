
export interface User {
  id: number | string;
  username: string;
  password?: string; // Optional for display
  firstName: string;
  lastName: string;
  position: string;
  staffType: string;
  workGroup: string;
  role: 'employee' | 'admin';
}

export interface TimeLog {
  id: number | string;
  userId: number | string;
  timestamp: number;
  type: 'in' | 'out';
  location: {
    latitude: number;
    longitude: number;
  };
  ipAddress?: string;
}

export interface Shift {
  id: number | string;
  name: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  lateGracePeriod: number; // in minutes
}

export interface GeolocationSettings {
  center: {
    latitude: number;
    longitude: number;
  } | null;
  radius: number; // in meters
}