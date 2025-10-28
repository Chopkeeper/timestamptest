# Backend สำหรับระบบลงเวลาเข้า-ออกงาน

นี่คือ Backend Server ที่สร้างด้วย Node.js, Express, และ MySQL เพื่อรองรับการทำงานของแอปพลิเคชันลงเวลา

## ขั้นตอนการติดตั้งและรัน (Setup and Run)

### 1. สิ่งที่ต้องมี (Prerequisites)

-   [Node.js](https://nodejs.org/) (เวอร์ชัน 14 ขึ้นไป)
-   ฐานข้อมูล MySQL หรือ MariaDB

### 2. ติดตั้ง Dependencies

ใน Terminal หรือ Command Prompt, ไปที่โฟลเดอร์ `backend` แล้วรันคำสั่ง:

```bash
npm install express mysql2 cors bcryptjs dotenv
```

### 3. ตั้งค่าฐานข้อมูล

1.  เปิดโปรแกรมจัดการฐานข้อมูลของคุณ (เช่น phpMyAdmin, MySQL Workbench, หรือผ่าน Command Line)
2.  สร้างฐานข้อมูลชื่อ `time_attendance_db` (หรือชื่ออื่นตามต้องการ)
3.  นำเข้า (Import) ไฟล์ `database.sql` ที่อยู่ในโฟลเดอร์นี้เพื่อสร้างตารางและข้อมูลเริ่มต้น

### 4. สร้างไฟล์ Environment Variables (`.env`)

ในโฟลเดอร์ `backend` สร้างไฟล์ใหม่ชื่อ `.env` และใส่ข้อมูลการเชื่อมต่อฐานข้อมูลของคุณลงไป:

```env
# Port ที่จะรันเซิร์ฟเวอร์
PORT=3001

# ข้อมูลการเชื่อมต่อฐานข้อมูล MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=time_attendance_db
```

**สำคัญ:** แก้ไข `your_mysql_password` เป็นรหัสผ่านฐานข้อมูล MySQL ของคุณ

### 5. รันเซิร์ฟเวอร์

หลังจากตั้งค่าทุกอย่างเรียบร้อยแล้ว รันเซิร์ฟเวอร์ด้วยคำสั่ง:

```bash
node server.js
```

คุณจะเห็นข้อความ "Backend server is running on http://localhost:3001" แสดงว่าเซิร์ฟเวอร์พร้อมใช้งานแล้ว

---

## หมายเหตุ

-   **การเชื่อมต่อ Frontend:** คุณจะต้องแก้ไขโค้ดฝั่ง Frontend เพื่อให้เรียกใช้ API จาก Backend นี้แทนการใช้ `localStorage`
-   **ความปลอดภัย:** ระบบนี้ใช้ `bcryptjs` ในการเข้ารหัสรหัสผ่าน แต่ยังไม่มีระบบ Token (เช่น JWT) สำหรับการยืนยันตัวตนในแต่ละ Request ซึ่งเป็นสิ่งที่ควรเพิ่มในระบบจริงเพื่อความปลอดภัย
