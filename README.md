# 🏥 MediSlot — Smart Medical Appointment Booking System

![MediSlot Banner](https://img.shields.io/badge/MediSlot-Healthcare%20Platform-blue?style=for-the-badge&logo=heart)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

> MediSlot is a full-stack medical appointment booking platform that connects patients with doctors seamlessly — featuring an AI-powered symptom checker, real-time updates, and dedicated portals for patients, doctors, and admins.

---

## ✨ What Makes MediSlot Unique?

Unlike typical appointment booking apps, MediSlot goes beyond just scheduling:

- 🤖 **Built-in Symptom Checker** — Patients can check symptoms before booking, helping them find the right specialist automatically
- 👨‍⚕️ **Three-Panel Architecture** — Separate, dedicated dashboards for Patients, Doctors, and Admins — not just one generic interface
- ⚡ **Real-time Updates** — Powered by Socket.IO for live appointment status changes
- 🏥 **Doctor Profile Management** — Doctors can manage their own profiles, availability, and appointments independently
- 🔐 **Role-based Access Control** — Secure, separate login flows for each user type

---

## 🖥️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend (Patient) | React.js, Tailwind CSS |
| Frontend (Admin/Doctor) | React.js, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Real-time | Socket.IO |
| Authentication | JWT (JSON Web Tokens) |
| File Uploads | Cloudinary |

---

## 🚀 Features

### 👤 Patient Portal
- Register/Login securely
- Browse and search doctors by speciality
- Book, view, and cancel appointments
- Manage personal profile
- **Symptom Checker** — get doctor recommendations based on symptoms

### 👨‍⚕️ Doctor Portal
- View and manage appointments
- Update availability and profile
- Track patient history

### 🛠️ Admin Panel
- Add/remove doctors
- Manage all appointments
- View platform-wide statistics
- Full doctor and user management

---

## 📁 Project Structure

```
MediSlot-Main/
├── Frontend/          # Patient-facing React app
│   ├── src/
│   │   ├── pages/     # Home, Appointments, Doctors, Login, Profile
│   │   ├── components/# TopDoctors, SymptomChecker, etc.
│   │   ├── context/   # Global app state (AppContext)
│   │   └── utils/     # Symptom matching logic
│
├── Admin/             # Admin & Doctor React dashboard
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Admin/ # AddDoctor, DoctorsList
│   │   │   └── Doctor/# DoctorAppointments, DoctorProfile
│   │   └── context/   # AdminContext
│
└── Backend/           # Node.js + Express REST API
    ├── controllers/   # adminController, doctorController, userController
    ├── models/        # User, Doctor, Appointment schemas
    └── routes/        # Admin and user routes
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js >= 14
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/akanksha426/MediSlot.git
cd MediSlot
```

### 2. Setup Backend
```bash
cd Backend
npm install
```
Create a `.env` file in the Backend folder:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret
```
```bash
npm start
```

### 3. Setup Frontend
```bash
cd ../Frontend
npm install
npm run dev
```

### 4. Setup Admin Panel
```bash
cd ../Admin
npm install
npm run dev
```

---

## 🌐 Live Demo
> Coming soon...

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License.

---

## 👩‍💻 Author

**Akanksha**  
GitHub: [@akanksha426](https://github.com/akanksha426)

---

> ⭐ If you found this project helpful, please give it a star!
