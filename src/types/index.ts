/**
 * Core Domain Types & DTOs for AcuAttend College Attendance Management System
 */

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  departmentId?: string;
  departmentName?: string;
  phone?: string;
  status: 'ACTIVE' | 'LOCKED' | 'SUSPENDED';
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  headOfDepartment: string;
  totalStudents: number;
  totalTeachers: number;
}

export interface Program {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  departmentName: string;
  degree: 'B.Tech' | 'M.Tech' | 'B.Sc' | 'MBA' | 'BBA' | 'PhD';
  totalSemesters: number;
}

export interface AcademicTerm {
  id: string;
  name: string; // e.g. "Fall 2026", "Spring 2026"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Section {
  id: string;
  name: string; // e.g. "CSE-4A"
  programId: string;
  programName: string;
  termId: string;
  semester: number;
  capacity: number;
  studentCount: number;
}

export interface Subject {
  id: string;
  code: string; // e.g. "CS401"
  name: string; // e.g. "Distributed Operating Systems"
  departmentId: string;
  credits: number;
  type: 'THEORY' | 'PRACTICAL' | 'HYBRID';
}

export interface Room {
  id: string;
  code: string; // e.g. "LH-201"
  building: string;
  floor: number;
  capacity: number;
  type: 'LECTURE_HALL' | 'LAB' | 'SEMINAR_HALL';
  hasCamera: boolean;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  endDate?: string;
  type: 'NATIONAL' | 'ACADEMIC' | 'INSTITUTIONAL';
}

export interface Student {
  id: string;
  studentId: string; // e.g. "STU-2023-0104"
  name: string;
  email: string;
  sectionId: string;
  sectionName: string;
  programId: string;
  programName: string;
  semester: number;
  status: 'ACTIVE' | 'LOCKED' | 'SUSPENDED';
  faceEnrolled: boolean;
  faceConsentGranted: boolean;
  overallAttendancePercentage: number;
  parentEmail?: string;
  parentName?: string;
  parentPhone?: string;
  phone?: string;
  createdAt: string;
}

export interface Teacher {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  departmentId: string;
  departmentName: string;
  designation: string; // e.g. "Associate Professor"
  phone: string;
  status: 'ACTIVE' | 'LOCKED';
  totalOfferings: number;
  createdAt: string;
}

export interface CourseOffering {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  sectionId: string;
  sectionName: string;
  teacherId: string;
  teacherName: string;
  termId: string;
  termName: string;
  enrolledStudentsCount: number;
  averageAttendance: number;
}

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export interface TimetableSlot {
  id: string;
  offeringId: string;
  subjectName: string;
  subjectCode: string;
  sectionId: string;
  sectionName: string;
  teacherId: string;
  teacherName: string;
  roomId: string;
  roomCode: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
}

export type SessionStatus = 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'CANCELLED';

export interface Session {
  id: string;
  offeringId: string;
  subjectCode: string;
  subjectName: string;
  sectionId: string;
  sectionName: string;
  teacherId: string;
  teacherName: string;
  roomId: string;
  roomCode: string;
  date: string; // "2026-10-26"
  startTime: string;
  endTime: string;
  status: SessionStatus;
  attendanceMode?: 'FACE' | 'QR' | 'MANUAL' | 'MIXED';
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type CheckInMethod = 'FACE' | 'QR' | 'GEOFENCE' | 'MANUAL';

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  status: AttendanceStatus;
  checkInTime?: string;
  method?: CheckInMethod;
  confidenceScore?: number;
  livenessStatus?: 'PASSED' | 'FAILED' | 'SPOOF_SUSPECTED';
  remarks?: string;
}

export interface FaceReviewEvent {
  id: string;
  sessionId: string;
  sessionTitle: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  snapshotUrl: string;
  confidenceScore: number;
  reason: 'LOW_CONFIDENCE' | 'LIVENESS_SUSPECT' | 'ANOMALY';
  capturedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Device {
  id: string;
  name: string; // "East Wing Kiosk Cam 1"
  type: 'CAMERA' | 'KIOSK' | 'GATEWAY';
  roomId: string;
  roomCode: string;
  ipAddress: string;
  macAddress: string;
  apiKeyMasked: string;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  lastHeartbeat: string;
  firmwareVersion: string;
}

export interface AttendancePolicy {
  id: string;
  programId: string;
  programName: string;
  minimumPercentage: number; // e.g. 75
  lateAfterMinutes: number;   // e.g. 15
  faceMatchThreshold: number; // e.g. 85 (%)
  reviewQueueThreshold: number; // e.g. 70 (%)
  allowGeofenceCheckIn: boolean;
  geofenceRadiusMeters: number;
}

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  documentUrl?: string;
  documentName?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerRemarks?: string;
  createdAt: string;
}

export type CorrectionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AttendanceCorrectionRequest {
  id: string;
  attendanceId: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  sessionDate: string;
  subjectName: string;
  currentStatus: AttendanceStatus;
  requestedStatus: AttendanceStatus;
  reason: string;
  status: CorrectionStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerComment?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  details: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface StudentSubjectAttendance {
  offeringId: string;
  subjectCode: string;
  subjectName: string;
  teacherName: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL'; // >= 75% SAFE, 65-74% WARNING, < 65% CRITICAL
  shortfallNeeded: number; // classes still need to attend consecutively to reach 75%
}

export interface StudentShortfallSummary {
  studentId: string;
  overallPercentage: number;
  minimumRequired: number;
  totalClassesHeld: number;
  totalClassesAttended: number;
  classesNeededOverall: number;
  subjects: StudentSubjectAttendance[];
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  message: string;
  path: string;
  fieldErrors?: ApiFieldError[];
}
