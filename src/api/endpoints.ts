import { apiClient, isMockMode } from './client';
import { mockApi } from './mock/mockService';
import {
  AuthResponse,
  Department,
  Program,
  AcademicTerm,
  Section,
  Subject,
  Room,
  Holiday,
  Student,
  Teacher,
  CourseOffering,
  TimetableSlot,
  Session,
  AttendanceRecord,
  FaceReviewEvent,
  Device,
  AttendancePolicy,
  LeaveRequest,
  AttendanceCorrectionRequest,
  AuditLog,
  NotificationItem,
  User,
  PaginatedResponse,
  StudentShortfallSummary,
} from '../types';

export const api = {
  // Auth
  auth: {
    login: async (email: string, pass: string): Promise<AuthResponse> => {
      if (isMockMode()) return mockApi.login(email, pass);
      const res = await apiClient.post<AuthResponse>('/auth/login', { email, password: pass });
      return res.data;
    },
    refresh: async (refreshToken: string) => {
      if (isMockMode()) return mockApi.refresh(refreshToken);
      const res = await apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken });
      return res.data;
    },
    logout: async (userEmail?: string) => {
      if (isMockMode()) return mockApi.logout(userEmail);
      const res = await apiClient.post('/auth/logout');
      return res.data;
    },
    getMe: async (userId: string): Promise<User> => {
      if (isMockMode()) return mockApi.getMe(userId);
      const res = await apiClient.get<User>('/auth/me');
      return res.data;
    },
  },

  // Master Data
  departments: {
    list: async (): Promise<Department[]> => {
      if (isMockMode()) return mockApi.getDepartments();
      const res = await apiClient.get<Department[]>('/departments');
      return res.data;
    },
    create: async (data: Partial<Department>): Promise<Department> => {
      if (isMockMode()) return mockApi.createDepartment(data);
      const res = await apiClient.post<Department>('/departments', data);
      return res.data;
    },
    update: async (id: string, data: Partial<Department>): Promise<Department> => {
      if (isMockMode()) return mockApi.updateDepartment(id, data);
      const res = await apiClient.put<Department>(`/departments/${id}`, data);
      return res.data;
    },
    delete: async (id: string) => {
      if (isMockMode()) return mockApi.deleteDepartment(id);
      const res = await apiClient.delete(`/departments/${id}`);
      return res.data;
    },
  },

  programs: {
    list: async (): Promise<Program[]> => {
      if (isMockMode()) return mockApi.getPrograms();
      const res = await apiClient.get<Program[]>('/programs');
      return res.data;
    },
    create: async (data: Partial<Program>): Promise<Program> => {
      if (isMockMode()) return mockApi.createProgram(data);
      const res = await apiClient.post<Program>('/programs', data);
      return res.data;
    },
    update: async (id: string, data: Partial<Program>): Promise<Program> => {
      if (isMockMode()) return mockApi.updateProgram(id, data);
      const res = await apiClient.put<Program>(`/programs/${id}`, data);
      return res.data;
    },
    delete: async (id: string) => {
      if (isMockMode()) return mockApi.deleteProgram(id);
      const res = await apiClient.delete(`/programs/${id}`);
      return res.data;
    },
  },

  terms: {
    list: async (): Promise<AcademicTerm[]> => {
      if (isMockMode()) return mockApi.getTerms();
      const res = await apiClient.get<AcademicTerm[]>('/terms');
      return res.data;
    },
    getCurrent: async (): Promise<AcademicTerm> => {
      if (isMockMode()) return mockApi.getCurrentTerm();
      const res = await apiClient.get<AcademicTerm>('/terms/current');
      return res.data;
    },
    setCurrent: async (id: string): Promise<AcademicTerm | undefined> => {
      if (isMockMode()) return mockApi.setCurrentTerm(id);
      const res = await apiClient.patch<AcademicTerm>(`/terms/${id}/set-current`);
      return res.data;
    },
    create: async (data: Partial<AcademicTerm>): Promise<AcademicTerm> => {
      if (isMockMode()) return mockApi.createTerm(data);
      const res = await apiClient.post<AcademicTerm>('/terms', data);
      return res.data;
    },
    delete: async (id: string) => {
      if (isMockMode()) return mockApi.deleteTerm(id);
      const res = await apiClient.delete(`/terms/${id}`);
      return res.data;
    },
  },

  sections: {
    list: async (): Promise<Section[]> => {
      if (isMockMode()) return mockApi.getSections();
      const res = await apiClient.get<Section[]>('/sections');
      return res.data;
    },
    create: async (data: Partial<Section>): Promise<Section> => {
      if (isMockMode()) return mockApi.createSection(data);
      const res = await apiClient.post<Section>('/sections', data);
      return res.data;
    },
    delete: async (id: string) => {
      if (isMockMode()) return mockApi.deleteSection(id);
      const res = await apiClient.delete(`/sections/${id}`);
      return res.data;
    },
  },

  subjects: {
    list: async (): Promise<Subject[]> => {
      if (isMockMode()) return mockApi.getSubjects();
      const res = await apiClient.get<Subject[]>('/subjects');
      return res.data;
    },
    create: async (data: Partial<Subject>): Promise<Subject> => {
      if (isMockMode()) return mockApi.createSubject(data);
      const res = await apiClient.post<Subject>('/subjects', data);
      return res.data;
    },
    delete: async (id: string) => {
      if (isMockMode()) return mockApi.deleteSubject(id);
      const res = await apiClient.delete(`/subjects/${id}`);
      return res.data;
    },
  },

  rooms: {
    list: async (): Promise<Room[]> => {
      if (isMockMode()) return mockApi.getRooms();
      const res = await apiClient.get<Room[]>('/rooms');
      return res.data;
    },
    create: async (data: Partial<Room>): Promise<Room> => {
      if (isMockMode()) return mockApi.createRoom(data);
      const res = await apiClient.post<Room>('/rooms', data);
      return res.data;
    },
    delete: async (id: string) => {
      if (isMockMode()) return mockApi.deleteRoom(id);
      const res = await apiClient.delete(`/rooms/${id}`);
      return res.data;
    },
  },

  holidays: {
    list: async (): Promise<Holiday[]> => {
      if (isMockMode()) return mockApi.getHolidays();
      const res = await apiClient.get<Holiday[]>('/holidays');
      return res.data;
    },
    create: async (data: Partial<Holiday>): Promise<Holiday> => {
      if (isMockMode()) return mockApi.createHoliday(data);
      const res = await apiClient.post<Holiday>('/holidays', data);
      return res.data;
    },
    delete: async (id: string) => {
      if (isMockMode()) return mockApi.deleteHoliday(id);
      const res = await apiClient.delete(`/holidays/${id}`);
      return res.data;
    },
  },

  // Students
  students: {
    list: async (params?: { search?: string; sectionId?: string; status?: string; page?: number; size?: number }): Promise<PaginatedResponse<Student>> => {
      if (isMockMode()) return mockApi.getStudents(params);
      const res = await apiClient.get<PaginatedResponse<Student>>('/students', { params });
      return res.data;
    },
    create: async (data: Partial<Student>): Promise<Student> => {
      if (isMockMode()) return mockApi.createStudent(data);
      const res = await apiClient.post<Student>('/students', data);
      return res.data;
    },
    update: async (id: string, data: Partial<Student>): Promise<Student> => {
      if (isMockMode()) return mockApi.updateStudent(id, data);
      const res = await apiClient.put<Student>(`/students/${id}`, data);
      return res.data;
    },
    delete: async (id: string) => {
      if (isMockMode()) return mockApi.deleteStudent(id);
      const res = await apiClient.delete(`/students/${id}`);
      return res.data;
    },
    bulkImport: async (rows: Array<{ studentId: string; name: string; email: string; section: string; parentEmail?: string }>) => {
      if (isMockMode()) return mockApi.bulkImportStudents(rows);
      const res = await apiClient.post('/students/bulk-import', { rows });
      return res.data;
    },
    exportCsv: async () => {
      if (isMockMode()) {
        const students = (await mockApi.getStudents({ page: 0, size: 500 })).content;
        const header = 'Student ID,Name,Email,Section,Program,Attendance %,Face Enrolled,Status\n';
        const rows = students
          .map((s) => `${s.studentId},"${s.name}",${s.email},${s.sectionName},"${s.programName}",${s.overallAttendancePercentage}%,${s.faceEnrolled ? 'Yes' : 'No'},${s.status}`)
          .join('\n');
        return header + rows;
      }
      const res = await apiClient.get<string>('/students/export');
      return res.data;
    },
  },

  // Teachers
  teachers: {
    list: async (): Promise<Teacher[]> => {
      if (isMockMode()) return mockApi.getTeachers();
      const res = await apiClient.get<Teacher[]>('/teachers');
      return res.data;
    },
    create: async (data: Partial<Teacher>): Promise<Teacher> => {
      if (isMockMode()) return mockApi.createTeacher(data);
      const res = await apiClient.post<Teacher>('/teachers', data);
      return res.data;
    },
    getMyOfferings: async (teacherId: string): Promise<CourseOffering[]> => {
      if (isMockMode()) return mockApi.getTeacherOfferings(teacherId);
      const res = await apiClient.get<CourseOffering[]>('/teachers/me/offerings');
      return res.data;
    },
  },

  // Offerings
  offerings: {
    list: async (): Promise<CourseOffering[]> => {
      if (isMockMode()) return mockApi.getOfferings();
      const res = await apiClient.get<CourseOffering[]>('/offerings');
      return res.data;
    },
    create: async (data: { subjectId: string; sectionId: string; teacherId: string; termId: string }): Promise<CourseOffering> => {
      if (isMockMode()) return mockApi.createOffering(data);
      const res = await apiClient.post<CourseOffering>('/offerings', data);
      return res.data;
    },
    updateTeacher: async (id: string, teacherId: string): Promise<CourseOffering> => {
      if (isMockMode()) return mockApi.updateOfferingTeacher(id, teacherId);
      const res = await apiClient.patch<CourseOffering>(`/offerings/${id}/teacher`, { teacherId });
      return res.data;
    },
    getDefaulters: async (offeringId: string): Promise<Student[]> => {
      if (isMockMode()) return mockApi.getOfferingDefaulters(offeringId);
      const res = await apiClient.get<Student[]>(`/offerings/${offeringId}/defaulters`);
      return res.data;
    },
  },

  // Timetable
  timetable: {
    list: async (): Promise<TimetableSlot[]> => {
      if (isMockMode()) return mockApi.getTimetable();
      const res = await apiClient.get<TimetableSlot[]>('/timetable');
      return res.data;
    },
    bySection: async (sectionId: string): Promise<TimetableSlot[]> => {
      if (isMockMode()) return mockApi.getTimetableBySection(sectionId);
      const res = await apiClient.get<TimetableSlot[]>(`/timetable/section/${sectionId}`);
      return res.data;
    },
    myToday: async (teacherId: string): Promise<TimetableSlot[]> => {
      if (isMockMode()) return mockApi.getTodayTimetableForTeacher(teacherId);
      const res = await apiClient.get<TimetableSlot[]>('/timetable/me/today');
      return res.data;
    },
    create: async (slot: Omit<TimetableSlot, 'id'>): Promise<TimetableSlot> => {
      if (isMockMode()) return mockApi.createTimetableSlot(slot);
      const res = await apiClient.post<TimetableSlot>('/timetable', slot);
      return res.data;
    },
    delete: async (id: string) => {
      if (isMockMode()) return mockApi.deleteTimetableSlot(id);
      const res = await apiClient.delete(`/timetable/${id}`);
      return res.data;
    },
  },

  // Sessions
  sessions: {
    list: async (): Promise<Session[]> => {
      if (isMockMode()) return mockApi.getSessions();
      const res = await apiClient.get<Session[]>('/sessions');
      return res.data;
    },
    generate: async (startDate: string, endDate: string) => {
      if (isMockMode()) return mockApi.generateSessions(startDate, endDate);
      const res = await apiClient.post('/sessions/generate', { startDate, endDate });
      return res.data;
    },
    open: async (id: string): Promise<Session> => {
      if (isMockMode()) return mockApi.openSession(id);
      const res = await apiClient.post<Session>(`/sessions/${id}/open`);
      return res.data;
    },
    close: async (id: string): Promise<Session> => {
      if (isMockMode()) return mockApi.closeSession(id);
      const res = await apiClient.post<Session>(`/sessions/${id}/close`);
      return res.data;
    },
    cancel: async (id: string): Promise<Session> => {
      if (isMockMode()) return mockApi.cancelSession(id);
      const res = await apiClient.post<Session>(`/sessions/${id}/cancel`);
      return res.data;
    },
    getQr: async (id: string): Promise<{ token: string; expiresIn: number; refreshAt: string }> => {
      if (isMockMode()) return mockApi.getSessionQR(id);
      const res = await apiClient.get<{ token: string; expiresIn: number; refreshAt: string }>(`/sessions/${id}/qr`);
      return res.data;
    },
  },

  // Attendance
  attendance: {
    mark: async (data: { sessionId: string; studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; remarks?: string }) => {
      if (isMockMode()) return mockApi.markSingleAttendance(data);
      const res = await apiClient.post('/attendance/mark', data);
      return res.data;
    },
    bulk: async (sessionId: string, records: Array<{ studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' }>) => {
      if (isMockMode()) return mockApi.bulkMarkAttendance(sessionId, records);
      const res = await apiClient.post('/attendance/bulk', { sessionId, records });
      return res.data;
    },
    face: async (sessionId: string, frameData: string | FormData) => {
      if (isMockMode()) return mockApi.recognizeFaceFrame(sessionId, frameData);
      const res = await apiClient.post('/attendance/face', frameData, {
        headers: typeof frameData === 'string' ? { 'Content-Type': 'application/json' } : { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    qr: async (sessionId: string, token: string, studentId: string) => {
      if (isMockMode()) return mockApi.markQrAttendance(sessionId, token, studentId);
      const res = await apiClient.post('/attendance/qr', { sessionId, token, studentId });
      return res.data;
    },
    geofence: async (sessionId: string, coords: { lat: number; lng: number }, studentId: string) => {
      if (isMockMode()) return mockApi.markGeofenceAttendance(sessionId, coords, studentId);
      const res = await apiClient.post('/attendance/geofence', { sessionId, ...coords, studentId });
      return res.data;
    },
    bySession: async (sessionId: string): Promise<AttendanceRecord[]> => {
      if (isMockMode()) return mockApi.getSessionAttendance(sessionId);
      const res = await apiClient.get<AttendanceRecord[]>(`/sessions/${sessionId}/attendance`);
      return res.data;
    },
    byStudent: async (studentId: string): Promise<AttendanceRecord[]> => {
      if (isMockMode()) return mockApi.getStudentAttendance(studentId);
      const res = await apiClient.get<AttendanceRecord[]>(`/students/${studentId}/attendance`);
      return res.data;
    },
    mySummary: async (studentId: string): Promise<StudentShortfallSummary> => {
      if (isMockMode()) return mockApi.getMyAttendanceSummary(studentId);
      const res = await apiClient.get<StudentShortfallSummary>('/attendance/summary/me');
      return res.data;
    },
    shortfall: async (studentId: string): Promise<StudentShortfallSummary> => {
      if (isMockMode()) return mockApi.getMyAttendanceSummary(studentId);
      const res = await apiClient.get<StudentShortfallSummary>(`/students/${studentId}/shortfall`);
      return res.data;
    },
  },

  // Faces
  faces: {
    enroll: async (studentId: string, frames: string[]) => {
      if (isMockMode()) return mockApi.enrollFace(studentId, frames);
      const res = await apiClient.post(`/faces/enroll/${studentId}`, { frames });
      return res.data;
    },
    delete: async (studentId: string) => {
      if (isMockMode()) return mockApi.deleteFace(studentId);
      const res = await apiClient.delete(`/faces/${studentId}`);
      return res.data;
    },
    reviewQueue: async (): Promise<FaceReviewEvent[]> => {
      if (isMockMode()) return mockApi.getFaceReviewQueue();
      const res = await apiClient.get<FaceReviewEvent[]>('/faces/review-queue');
      return res.data;
    },
    review: async (eventId: string, approve: boolean, reviewerRemarks?: string) => {
      if (isMockMode()) return mockApi.reviewFaceEvent(eventId, approve, reviewerRemarks);
      const res = await apiClient.post(`/faces/review/${eventId}`, { approve, reviewerRemarks });
      return res.data;
    },
  },

  // Consents
  consents: {
    get: async () => {
      if (isMockMode()) return mockApi.getConsents();
      const res = await apiClient.get('/consents');
      return res.data;
    },
    grant: async (studentId: string) => {
      if (isMockMode()) return mockApi.grantConsent(studentId);
      const res = await apiClient.post('/consents', { studentId });
      return res.data;
    },
    revoke: async (studentId: string) => {
      if (isMockMode()) return mockApi.revokeConsent(studentId);
      const res = await apiClient.delete(`/consents/${studentId}`);
      return res.data;
    },
  },

  // Leaves
  leaves: {
    list: async (): Promise<LeaveRequest[]> => {
      if (isMockMode()) return mockApi.getLeaves();
      const res = await apiClient.get<LeaveRequest[]>('/leaves');
      return res.data;
    },
    create: async (data: { studentId: string; startDate: string; endDate: string; reason: string; documentName?: string }) => {
      if (isMockMode()) return mockApi.createLeave(data);
      const res = await apiClient.post('/leaves', data);
      return res.data;
    },
    approve: async (id: string, reviewerName: string, remarks?: string) => {
      if (isMockMode()) return mockApi.approveLeave(id, reviewerName, remarks);
      const res = await apiClient.patch(`/leaves/${id}/approve`, { remarks });
      return res.data;
    },
    reject: async (id: string, reviewerName: string, remarks?: string) => {
      if (isMockMode()) return mockApi.rejectLeave(id, reviewerName, remarks);
      const res = await apiClient.patch(`/leaves/${id}/reject`, { remarks });
      return res.data;
    },
  },

  // Corrections
  corrections: {
    listPending: async (): Promise<AttendanceCorrectionRequest[]> => {
      if (isMockMode()) return mockApi.getCorrections();
      const res = await apiClient.get<AttendanceCorrectionRequest[]>('/corrections/pending');
      return res.data;
    },
    create: async (data: Parameters<typeof mockApi.createCorrection>[0]) => {
      if (isMockMode()) return mockApi.createCorrection(data);
      const res = await apiClient.post('/corrections', data);
      return res.data;
    },
    approve: async (id: string, reviewerName: string, comment?: string) => {
      if (isMockMode()) return mockApi.approveCorrection(id, reviewerName, comment);
      const res = await apiClient.patch(`/corrections/${id}/approve`, { comment });
      return res.data;
    },
    reject: async (id: string, reviewerName: string, comment?: string) => {
      if (isMockMode()) return mockApi.rejectCorrection(id, reviewerName, comment);
      const res = await apiClient.patch(`/corrections/${id}/reject`, { comment });
      return res.data;
    },
  },

  // Devices
  devices: {
    list: async (): Promise<Device[]> => {
      if (isMockMode()) return mockApi.getDevices();
      const res = await apiClient.get<Device[]>('/devices');
      return res.data;
    },
    create: async (data: Parameters<typeof mockApi.createDevice>[0]) => {
      if (isMockMode()) return mockApi.createDevice(data);
      const res = await apiClient.post('/devices', data);
      return res.data;
    },
    rotateKey: async (id: string) => {
      if (isMockMode()) return mockApi.rotateDeviceKey(id);
      const res = await apiClient.post<{ rawApiKey: string }>(`/devices/${id}/rotate-key`);
      return res.data;
    },
  },

  // Policies
  policies: {
    list: async (): Promise<AttendancePolicy[]> => {
      if (isMockMode()) return mockApi.getPolicies();
      const res = await apiClient.get<AttendancePolicy[]>('/policies');
      return res.data;
    },
    update: async (id: string, updates: Partial<AttendancePolicy>) => {
      if (isMockMode()) return mockApi.updatePolicy(id, updates);
      const res = await apiClient.put(`/policies/${id}`, updates);
      return res.data;
    },
  },

  // Notifications
  notifications: {
    list: async (userId: string): Promise<NotificationItem[]> => {
      if (isMockMode()) return mockApi.getNotifications(userId);
      const res = await apiClient.get<NotificationItem[]>('/notifications');
      return res.data;
    },
    markRead: async (id: string) => {
      if (isMockMode()) return mockApi.markNotificationRead(id);
      const res = await apiClient.patch(`/notifications/${id}/read`);
      return res.data;
    },
    markAllRead: async (userId: string) => {
      if (isMockMode()) return mockApi.markAllNotificationsRead(userId);
      const res = await apiClient.patch('/notifications/read-all');
      return res.data;
    },
  },

  // Reports
  reports: {
    download: async (type: 'student' | 'section' | 'offering' | 'department', id: string, format: 'pdf' | 'xlsx') => {
      if (isMockMode()) {
        const dummyContent = `AcuAttend Official Attendance Audit Report\nTarget: ${type.toUpperCase()} [${id}]\nFormat: ${format.toUpperCase()}\nGenerated: ${new Date().toISOString()}\nStatus: Verified`;
        const blob = new Blob([dummyContent], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AcuAttend_Report_${type}_${id}_${new Date().toISOString().slice(0, 10)}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        return { success: true };
      }
      const res = await apiClient.get(`/reports/${type}/${id}`, { params: { format }, responseType: 'blob' });
      return res.data;
    },
  },

  // Analytics
  analytics: {
    dashboard: async () => {
      if (isMockMode()) return mockApi.getDashboardAnalytics();
      const res = await apiClient.get('/analytics/dashboard');
      return res.data;
    },
    atRisk: async (offeringId: string) => {
      if (isMockMode()) return mockApi.getOfferingDefaulters(offeringId);
      const res = await apiClient.get(`/analytics/offerings/${offeringId}/at-risk`);
      return res.data;
    },
  },

  // Audit Logs
  auditLogs: {
    list: async (): Promise<AuditLog[]> => {
      if (isMockMode()) return mockApi.getAuditLogs();
      const res = await apiClient.get<AuditLog[]>('/audit-logs');
      return res.data;
    },
  },

  // Users
  users: {
    list: async (): Promise<User[]> => {
      if (isMockMode()) return mockApi.getUsers();
      const res = await apiClient.get<User[]>('/users');
      return res.data;
    },
    updateStatus: async (id: string, status: 'ACTIVE' | 'LOCKED' | 'SUSPENDED') => {
      if (isMockMode()) return mockApi.updateUserStatus(id, status);
      const res = await apiClient.patch(`/users/${id}/status`, { status });
      return res.data;
    },
    updateRole: async (id: string, role: any) => {
      if (isMockMode()) return mockApi.updateUserRole(id, role);
      const res = await apiClient.patch(`/users/${id}/role`, { role });
      return res.data;
    },
  },
};
