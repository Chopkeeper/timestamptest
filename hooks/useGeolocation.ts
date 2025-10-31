
import { useState, useEffect } from 'react';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
  });

  useEffect(() => {
    // ตรวจสอบ secure context ก่อน เพื่อป้องกัน error ที่พบบ่อยที่สุด
    if (window.isSecureContext === false) {
      setLocation(prev => ({ ...prev, error: 'ฟังก์ชันระบุตำแหน่งใช้งานได้บนการเชื่อมต่อที่ปลอดภัย (HTTPS) เท่านั้น' }));
      return;
    }

    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, error: 'เบราว์เซอร์ของคุณไม่รองรับ Geolocation' }));
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      // แปลงข้อความ error ที่เกี่ยวกับ "secure origin" ให้เข้าใจง่าย
      if (error.code === error.PERMISSION_DENIED && error.message.includes('secure origin')) {
         setLocation(prev => ({ ...prev, error: 'ฟังก์ชันระบุตำแหน่งใช้งานได้บนการเชื่อมต่อที่ปลอดภัย (HTTPS) เท่านั้น' }));
      } else if (error.code === error.PERMISSION_DENIED) {
         setLocation(prev => ({...prev, error: 'กรุณาอนุญาตให้เข้าถึงตำแหน่งของคุณ'}));
      }
      else {
         setLocation(prev => ({ ...prev, error: `เกิดข้อผิดพลาด: ${error.message}` }));
      }
    };

    const watcher = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  return location;
};
