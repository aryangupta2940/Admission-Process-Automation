# Admission Process Automation — ABESEC Ghaziabad

A complete, full-stack MERN (MongoDB, Express.js, React, Node.js) web application built to digitize and automate the college admission workflow for **ABESEC Ghaziabad**.

---

## Project Overview
The **Admission Process Automation System** replaces manual paper-based college admission workflows with a centralized, role-based web portal. Prospective students can register online, submit personal and academic details, upload required verification documents, track application progress in real time, and receive status notifications. Administrators can view live statistics, search and filter applications, inspect uploaded documents, approve or reject applications with remarks/reasons, and manage student accounts.

---

## Problem Statement
Traditional college admission procedures rely on physical forms, manual record keeping, and repetitive in-person inquiries, resulting in processing delays, document misplacement risks, and zero real-time status visibility for applicants.

---

## Objectives
- Digitize student registration, admission form submission, and document uploads.
- Store structured applicant records and binary documents persistently in MongoDB.
- Provide transparent status tracking (`Pending`, `Under Review`, `Approved`, `Rejected`).
- Equip administrators with search, filtering, document preview, and audit-logged review workflows.
- Enforce role-based access control (RBAC) using JWT authentication and bcrypt password hashing.

---

## Main Features

### Student Panel
- **Registration & Authentication:** Secure student signup, login, and logout (`JWT` + `bcryptjs`).
- **Student Dashboard:** Application status summary, 4-step admission progress tracker, and recent updates.
- **Online Admission Form:**
  - *Personal Information:* Full Name, Email, Phone Number, Date of Birth, Gender, Address, City, State, Pincode.
  - *Academic Information:* 10th Percentage, 12th Percentage, Previous School/College, Course Selection.
  - *Document Uploads:* Passport-size Photograph, 10th Marksheet, 12th Marksheet, Identity Proof (stored in MongoDB, max 2 MB each).
- **Conditional Editing:** Edit application details and replace documents while status is `Pending` (automatically locked once `Under Review`, `Approved`, or `Rejected`).
- **Application Details & Timeline:** View submitted details, secure document previews/downloads, admin remarks/rejection reasons, and audit timeline.
- **Notifications:** Real-time portal notifications for submission and every administrative status update.

### Admin Panel
- **Protected Admin Access:** Role-guarded routes (`authorize('admin')`) inaccessible to student accounts.
- **Admin Dashboard:** Live cards for Total Registered Students, Total Applications, Pending, Under Review, Approved, and Rejected counts, plus course breakdown and recent applications.
- **Search & Filter:** Search applications by Student Name, Email, or Application ID (`ABES-YYYY-XXXX`), and filter by status.
- **Application Review & Document Verification:** Inspect full applicant profiles and preview/download all 4 uploaded documents securely.
- **Decision Controls:** Mark `Under Review`, `Approve` with optional remarks, or `Reject` with a mandatory rejection reason.
- **Student Record Management:** Search registered students, view linked application status, activate/deactivate accounts, or remove records.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Axios, Lucide React |
| **Backend** | Node.js, Express.js, Multer, Helmet, CORS, Express Rate Limit, Morgan |
| **Database** | MongoDB, Mongoose ODM |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`) |
| **Deployment** | Render Web Service + MongoDB Atlas |

---

## System Architecture

```text
Client Browser (React + Vite + Tailwind CSS)
        │
        │ HTTPS (REST JSON / multipart FormData + Bearer JWT)
        ▼
Render Web Service (Node.js + Express.js)
  ├── Serves built SPA (frontend/dist) in production
  ├── JWT & RBAC Middleware (protect, authorize)
  ├── Multer Memory Upload Handler (2 MB limit, MIME validation)
  └── REST API (/api/auth, /api/courses, /api/applications, /api/admin, /api/files, /api/notifications)
        │
        │ Mongoose ODM
        ▼
MongoDB Atlas (users, courses, applications, uploadedfiles, notifications)
```

For detailed ER diagrams, DFDs, Use Case diagrams, and API specifications, refer to:
- [System Design Markdown](docs/system-design.md)
- [FSD System Design Document PDF](FSD-System-Design-Document.pdf)

---

## Project Folder Structure

```text
Admission-Process-Automation/
├── backend/
│   ├── config/
│   │   └── db.js                   # MongoDB connection helper
│   ├── middleware/
│   │   ├── auth.js                 # JWT protect & RBAC authorize middleware
│   │   ├── errorHandler.js         # Centralized Express error handler
│   │   └── upload.js               # Multer memoryStorage & MIME/size limits
│   ├── models/
│   │   ├── Application.js          # Admission application schema & status history
│   │   ├── Course.js               # Offered academic programs
│   │   ├── Notification.js         # Student status notifications
│   │   ├── UploadedFile.js         # Persistent binary document storage
│   │   └── User.js                 # Student & Admin user schema
│   ├── routes/
│   │   ├── adminRoutes.js          # Admin stats, search, review & student records
│   │   ├── applicationRoutes.js    # Student form submit, fetch & edit
│   │   ├── authRoutes.js           # Register, login, profile & logout
│   │   ├── courseRoutes.js         # Active courses endpoint
│   │   ├── fileRoutes.js           # Protected document streaming endpoint
│   │   └── notificationRoutes.js   # Notification read/list endpoints
│   ├── tests/
│   │   └── api.test.js             # Automated integration test suite
│   ├── utils/
│   │   ├── generateAppId.js        # Sequential ABES-YYYY-XXXX ID generator
│   │   ├── seedData.js             # Idempotent course & demo account seeder
│   │   └── validators.js           # Server-side input validation
│   ├── app.js                      # Express app setup & static serving
│   ├── seed.js                     # Standalone seed CLI script
│   ├── server.js                   # Server entrypoint
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/client.js           # Axios client with JWT interceptor
│   │   ├── components/             # CollegeHeader, Footer, DashboardLayout, SecureFilePreview, etc.
│   │   ├── context/AuthContext.jsx # Auth state & session persistence
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── student/            # StudentDashboard, ApplicationFormPage, ApplicationDetailsPage, NotificationsPage
│   │   │   └── admin/              # AdminDashboard, ManageApplicationsPage, ReviewApplicationPage, ManageStudentsPage
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
├── docs/
│   └── system-design.md            # Full FSD System Design Document (Markdown)
├── FSD-System-Design-Document.pdf  # Formatted PDF for college submission
├── render.yaml                     # Render deployment blueprint
├── .env.example
├── package.json                    # Root build/start/test orchestration scripts
└── README.md
```

---

## Installation & Local Setup

### Prerequisites
- **Node.js** v18+ and **npm**
- **MongoDB** (Local MongoDB Community Server or a free **MongoDB Atlas** cluster)

### 1. Clone the Repository
```bash
git clone https://github.com/aryangupta2940/Admission-Process-Automation.git
cd Admission-Process-Automation
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Configure Environment Variables
Create `backend/.env` based on `backend/.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/abesec_admission?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
SERVE_FRONTEND=false
AUTO_SEED=true
```
*(Never commit `.env` files to GitHub.)*

### 4. Seed Database (Optional — also runs safely on startup when `AUTO_SEED=true`)
```bash
npm run seed
```
The seed script is idempotent and can be run repeatedly without duplicating accounts or courses.

### 5. Run the Project Locally
Open two terminals:
```bash
# Terminal 1: Start Backend API (http://localhost:5000)
npm --prefix backend run dev

# Terminal 2: Start Frontend Dev Server (http://localhost:5173)
npm --prefix frontend run dev
```

### 6. Run Automated Integration Tests
```bash
npm test
```

---

## How to Deploy on Render

### Step 1: Create a Persistent MongoDB Atlas Database
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free **M0** cluster.
2. Under **Database Access**, create a database user with read/write permissions.
3. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) so Render servers can connect.
4. Copy the connection string (`mongodb+srv://...`) and replace `<username>`, `<password>`, and database name (`abesec_admission`).

### Step 2: Deploy on Render (Single Web Service via Blueprint or Manual Setup)
1. Push your repository to GitHub (`main` branch).
2. Log in to [Render](https://render.com/) and click **New +** -> **Web Service** (or **Blueprint** using `render.yaml`).
3. Connect the GitHub repository `aryangupta2940/Admission-Process-Automation` (`main` branch).
4. Configure the Web Service settings:
   - **Root Directory:** `.` (repository root)
   - **Runtime:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
5. Add the following **Environment Variables** in Render:
   - `NODE_ENV` = `production`
   - `SERVE_FRONTEND` = `true`
   - `AUTO_SEED` = `true`
   - `MONGO_URI` = `<your MongoDB Atlas connection string>`
   - `JWT_SECRET` = `<a strong 64-character random string>`
   - `JWT_EXPIRES_IN` = `7d`
6. Click **Create Web Service**. Once live, open `https://<your-service>.onrender.com/api/health` to verify `"status": "ok"` and `"database": "connected"`.

*(Note: Because `SERVE_FRONTEND=true`, the Express server serves the built React app from the same domain, eliminating cross-origin cookie/CORS issues. If you deploy the frontend separately as a Render Static Site, set `VITE_API_URL` on the frontend and `CORS_ORIGIN` on the backend to your static site URL.)*

---

## Repository & Deployment URLs
- **GitHub Repository:** https://github.com/aryangupta2940/Admission-Process-Automation
- **Deployed Render URL:** *Pending deployment — follow the Render steps above and update this line with your live `https://*.onrender.com` URL after deploying.*

---

## Demo Login Credentials (For Testing Only)

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@abesec.ac.in` | `Admin@12345` |
| **Student** | `student@abesec.ac.in` | `Student@12345` |

> **Security Note for Production:** Change the demo passwords before opening the portal to real applicants by setting `SEED_ADMIN_PASSWORD` and `SEED_STUDENT_PASSWORD` in your environment variables before initial seeding (or updating the user password in MongoDB Atlas / setting `AUTO_SEED=false` after creating your production admin account).

---

## Team Members
| Role | Name | University Roll Number | Branch & Section |
|---|---|---|---|
| **Team Leader** | Aryan Gupta | `2400320100289` | CSE (`CSE-15`) |
| **Team Member 2** | Aryan Tyagi | `2400320100295` | CSE (`CSE-15`) |

- **Academic Details:** B.Tech, 5th Semester, Batch 2024–28, Full Stack Development (FSD)

---

## Future Scope
- Online admission fee payment gateway integration (Razorpay / Stripe).
- Automated email and SMS notifications on application approval/rejection.
- Downloadable PDF admission offer letter and fee receipt.
- Automated OCR pre-verification of 10th and 12th marksheets.
- Department-wise merit list generation and seat allocation analytics.

---
**Developed & Maintained By:** Aryan Gupta, Aryan Tyagi, CSE-15  
© 2026 ABESEC Ghaziabad. All Rights Reserved.
