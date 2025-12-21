
---

# 🌐 HealthSphere Frontend

> **HealthSphere** is a modern, role-based healthcare web application frontend built with **Next.js**.
> It connects to the HealthSphere backend (FastAPI) to provide a complete hospital management experience for **Admins, Doctors, and Patients**.

![HealthAI Banner](https://github.com/AKHIL-SAURABH/HealthSphere-Frontend/blob/main/HealthSphere%20healthcare%20management%20platform%20banner.png?raw=true)

---
🚀 **Live Web App (Vercel):**
👉 **[https://health-sphere-frontend-eight.vercel.app](https://health-sphere-frontend-eight.vercel.app/login)**

⚠️ **Important:**
The frontend **requires the backend server to be running** (deployed on Render) to function correctly.

First create the users in backend at https://health-sphere-c2a3.onrender.com/docs at register endpoints then login as those users using above link.

---

## 🧭 Application Overview

The frontend handles:

* 🔐 Authentication & Role-based Routing
* 🧑‍⚕️ Doctor Dashboards (Appointments, MediSlot)
* 🧑‍🦽 Patient Dashboards (Appointments, Bed Requests, HealthAI)
* 🛠️ Admin Panel (Users, Doctors, Bed Allocation, Analytics)
* 📊 Charts, Status Badges, Real-time UI updates

---

## 🏗️ Architecture Overview

```
┌─────────────────────┐
│     Frontend        │
│   (Next.js, Vercel) │
│                     │
│  • UI / UX          │
│  • Auth Context     │
│  • Role Guards      │
│  • API Calls        │
└─────────▲───────────┘
          │ HTTPS (REST API)
          ▼
┌─────────────────────┐
│      Backend        │
│ (FastAPI, Render)   │
│                     │
│  • Auth (JWT)       │
│  • MediSlot         │
│  • Bed Allocation   │
│  • HealthAI         │
│  • Admin APIs       │
└─────────▲───────────┘
          │
          ▼
┌─────────────────────┐
│     Database        │
│   (PostgreSQL)      │
└─────────────────────┘
```

---

## ⚙️ Tech Stack — Frontend

### 🚀 Core Technologies

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge\&logo=next.js\&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge\&logo=react\&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge\&logo=typescript\&logoColor=white)

---

### 🎨 Styling & UI

![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0F172A?style=for-the-badge\&logo=tailwind-css\&logoColor=38BDF8)
![Dark Mode](https://img.shields.io/badge/Dark_Mode-Enabled-black?style=for-the-badge)

---

### 🔐 Authentication & State

![JWT](https://img.shields.io/badge/JWT-Authentication-purple?style=for-the-badge)
![Context API](https://img.shields.io/badge/React_Context-Auth_State-orange?style=for-the-badge)

---

### 📊 Data Visualization

![Recharts](https://img.shields.io/badge/Recharts-Data_Visualization-blue?style=for-the-badge)

---

### ☁️ Deployment & Hosting

![Vercel](https://img.shields.io/badge/Vercel-Deployment-black?style=for-the-badge\&logo=vercel)
![GitHub](https://img.shields.io/badge/GitHub-Source_Control-181717?style=for-the-badge\&logo=github)

---

## 🔗 Backend Dependency (Very Important)

This frontend **will NOT work independently**.

You must have the backend running first:

* **Backend Repo:** 👉 *HealthSphere Backend* https://github.com/AKHIL-SAURABH/HealthSphere-Backend
* **Backend Live URL (Render):**
  👉 [https://health-sphere-c2a3.onrender.com/](https://health-sphere-c2a3.onrender.com/)

The frontend communicates with backend APIs using:

```env
NEXT_PUBLIC_API_BASE_URL=https://health-sphere-c2a3.onrender.com
```

Make sure this environment variable is set in **Vercel → Project → Settings → Environment Variables**.

---

## 🛠️ Local Development Setup

```bash
# Clone repo
git clone https://github.com/your-username/health-sphere-frontend.git
cd health-sphere-frontend

# Install dependencies
npm install

# Run locally
npm run dev
```

➡️ App runs at: **[http://localhost:3000](http://localhost:3000)**

⚠️ Backend must be running for login & dashboards to work.

---

## 🔐 User Roles Supported

| Role    | Capabilities                                                |
| ------- | ----------------------------------------------------------- |
| Admin   | User management, Doctor approval, Bed allocation, Analytics |
| Doctor  | Appointments, MediSlot approval, HealthAI verification      |
| Patient | Book appointments, Request beds, View status, HealthAI      |

---

## 📌 Key Features

* ✅ Role-based sidebar & routing
* ✅ Protected pages with auth guards
* ✅ Real-time appointment & bed status updates
* ✅ Clean, professional dark UI
* ✅ Fully deployed & production-ready

---

## 🚀 Deployment

Frontend is deployed using **Vercel**:

* Automatic builds on GitHub push
* Optimized Next.js production build
* Secure HTTPS access

---

## 📄 License

This project is built for **learning, portfolio, and demonstration purposes**.

---

