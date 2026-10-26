# AcuAttend - AI-Powered College Attendance Management System

AcuAttend is an enterprise-grade, responsive college attendance management web frontend engineered with React 18, TypeScript, Vite, and Tailwind CSS. It features multi-modal attendance taking (Edge Camera Face AI sweep, 25-second dynamic rotating QR codes, manual rosters, and GPS campus geofencing), four specialized user roles (Admin, Teacher, Student, Parent), weekly conflict-proof timetable matrices, and comprehensive biometric consent and enrollment workflows.

---

## Key Capabilities & Features

### 1. Role-Based Portals & Dashboards
- **ADMIN**:
  - Live university KPI cards (total students, faculty, today's turnout %, active lecture sessions).
  - 30-day interactive attendance trend line chart & department distribution bar chart.
  - Master Data CRUD for Departments, Programs, Academic Terms (with "Set as Current"), Sections, Subjects, Rooms, and Holidays.
  - Student Directory with CSV batch import (with row-by-row error reporting) and CSV export.
  - Faculty directory with assigned course offerings.
  - Timetable scheduling with automatic HTTP 409 clash detection (preventing room, teacher, and section conflicts).
  - Academic session generator for date ranges with holiday bypass.
  - Hardware device registration (camera rigs & kiosks) with one-time copyable API key disclosure and key rotation.
  - Program-level attendance policy sliders (minimum %, late-arrival minutes, face match threshold, and review bounds).
  - Centralized approval queues for leave applications and attendance corrections.
  - Face AI analytics with anti-spoof liveness telemetry.
  - Immutable security audit logs with CSV export.
  - User access control (lock/unlock accounts and role modification).

- **TEACHER**:
  - Today's schedule cards with instant "Open Session" action.
  - Course offerings directory and enrolled section rosters.
  - **Take Attendance Studio (3 Modes)**:
    - **Face Mode**: Live camera preview, 1-click classroom sweep & recognition, confidence scores, and ISO/IEC 30107-3 anti-spoof liveness indicators.
    - **QR Mode**: Large animated QR broadcast that auto-refreshes every 25 seconds with an SVG countdown ring.
    - **Manual Mode**: Segmented toggle buttons (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`), "Mark All Present" shortcut, and bulk roster synchronization (`POST /attendance/bulk`).
    - Finalize & Close Session dialog that automatically marks absentees.
  - Face review queue for borderline confidence or flagged captures with Approve/Reject decisions.
  - Student dispute correction approvals.
  - Official attendance register exports (PDF & Excel).

- **STUDENT**:
  - Overall attendance ring and per-subject circular progress rings color-coded green, amber, or red against the 75% threshold.
  - Real-time examination shortfall calculator: computes the exact number of consecutive classes required to reach 75%.
  - Attendance history table filtered by subject and date range.
  - **Check-In Terminal**: In-app QR camera scanner & GPS geofence radar verifying presence within campus boundaries.
  - Formal leave application with document upload simulation.
  - Attendance record dispute petition workflow.
  - **Biometric Privacy & Face Enrollment Wizard**: Guided 4-pose facial capture wizard with on-screen reticles (Straight, Left, Right, Smile) and 1-click consent revocation with permanent template purging.

- **PARENT / GUARDIAN**:
  - Read-only real-time attendance tracking of the linked student.
  - Defaulter warnings and examination eligibility alerts.
  - Course-by-course breakdown and pending leave tracking.

---

## Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4, custom Plus Jakarta Sans & JetBrains Mono typography
- **Routing**: React Router v6 with `ProtectedRoute` and `RoleRoute` access guards
- **Data Layer**: TanStack Query + Axios instance with Bearer interceptors and automatic 401 token refresh queue
- **Charts**: Recharts (LineChart, BarChart, ResponsiveContainer)
- **Icons**: Lucide React

---

## Quick Start & Local Setup

### 1. Installation
```bash
npm install
```

### 2. Running in Mock Mode (Default)
By default, the application runs with mock simulation enabled (`VITE_USE_MOCK=true`), requiring no external backend or database setup.
```bash
npm run dev
```

### 3. Demo Credentials
On the login screen, click any of the instant demo credential buttons:
- **Admin**: `admin@demo.com` / `Demo@1234`
- **Teacher**: `teacher@demo.com` / `Demo@1234`
- **Student**: `student@demo.com` / `Demo@1234`
- **Parent**: `parent@demo.com` / `Demo@1234`

---

## Connecting to the Spring Boot Backend

To connect AcuAttend to a real Spring Boot 3.x backend:

1. Create or edit your local `.env` file (copied from `.env.example`):
   ```env
   # Set mock mode to false to dispatch real HTTP requests
   VITE_USE_MOCK=false

   # Set your Spring Boot API base URL (default is /api/v1)
   VITE_API_BASE_URL="http://localhost:8080/api/v1"
   ```

2. **Backend Contract Expected by AcuAttend**:
   - **Authentication**:
     - `POST /auth/login` returning `{ accessToken, refreshToken, user: { id, name, email, role } }`
     - `POST /auth/refresh` returning `{ accessToken, refreshToken }`
     - `POST /auth/logout`
     - `GET /auth/me`
   - **Error Handling**:
     ```json
     {
       "timestamp": "2026-10-26T12:00:00Z",
       "status": 400,
       "message": "Validation failed",
       "path": "/api/v1/students",
       "fieldErrors": [
         { "field": "email", "message": "Institutional email must be unique" }
       ]
     }
     ```
   - **Pagination**:
     ```json
     {
       "content": [...],
       "totalElements": 1420,
       "totalPages": 142,
       "number": 0,
       "size": 10
     }
     ```
   - **Timetable Clash Detection**:
     Returns HTTP `409 Conflict` with a descriptive message if a room, teacher, or section is double-booked.

3. Restart the Vite development server:
   ```bash
   npm run dev
   ```
