import {
  initialUsers,
  initialDepartments,
  initialPrograms,
  initialTerms,
  initialSections,
  initialSubjects,
  initialRooms,
  initialHolidays,
  initialTeachers,
  initialStudents,
  initialOfferings,
  initialTimetable,
  initialSessions,
  initialAttendanceRecords,
  initialFaceReviewQueue,
  initialDevices,
  initialPolicies,
  initialLeaves,
  initialCorrections,
  initialAuditLogs,
  initialNotifications,
  studentAlexShortfall,
} from './data';
import {
  User,
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
  PaginatedResponse,
} from '../../types';

// In-memory mutable storage for mock simulation
class MockStore {
  users: User[] = [...initialUsers];
  departments: Department[] = [...initialDepartments];
  programs: Program[] = [...initialPrograms];
  terms: AcademicTerm[] = [...initialTerms];
  sections: Section[] = [...initialSections];
  subjects: Subject[] = [...initialSubjects];
  rooms: Room[] = [...initialRooms];
  holidays: Holiday[] = [...initialHolidays];
  teachers: Teacher[] = [...initialTeachers];
  students: Student[] = [...initialStudents];
  offerings: CourseOffering[] = [...initialOfferings];
  timetable: TimetableSlot[] = [...initialTimetable];
  sessions: Session[] = [...initialSessions];
  attendance: AttendanceRecord[] = [...initialAttendanceRecords];
  faceQueue: FaceReviewEvent[] = [...initialFaceReviewQueue];
  devices: Device[] = [...initialDevices];
  policies: AttendancePolicy[] = [...initialPolicies];
  leaves: LeaveRequest[] = [...initialLeaves];
  corrections: AttendanceCorrectionRequest[] = [...initialCorrections];
  auditLogs: AuditLog[] = [...initialAuditLogs];
  notifications: NotificationItem[] = [...initialNotifications];
  biometricConsent: Record<string, boolean> = {
    'user-student-1': true,
    'stu-102': true,
    'stu-104': true,
    'stu-105': true,
    'stu-106': true,
    'stu-107': true,
  };

  logAudit(actorEmail: string, actorRole: any, action: string, entityType: string, entityId: string, details: string) {
    this.auditLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      actorEmail: actorEmail || 'system@acuattend.edu',
      actorRole: actorRole || 'ADMIN',
      action,
      entityType,
      entityId,
      ipAddress: '192.168.1.105',
      details,
    });
  }
}

export const mockStore = new MockStore();

// Artificial latency helper
const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  // ------------------ AUTH ------------------
  async login(email: string, pass: string) {
    await delay(250);
    const user = mockStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw {
        status: 401,
        message: 'Invalid credentials. Please verify your email and password.',
      };
    }
    if (user.status === 'LOCKED') {
      throw {
        status: 403,
        message: 'Account is locked. Contact your college system administrator.',
      };
    }
    mockStore.logAudit(user.email, user.role, 'LOGIN_SUCCESS', 'USER', user.id, 'User signed in via web portal');
    return {
      accessToken: `mock_jwt_access_${user.id}_${Date.now()}`,
      refreshToken: `mock_jwt_refresh_${user.id}`,
      user,
    };
  },

  async refresh(refreshToken: string) {
    await delay(120);
    if (!refreshToken) throw { status: 401, message: 'Invalid refresh token' };
    const userIdMatch = refreshToken.match(/mock_jwt_refresh_(.*)/);
    const userId = userIdMatch ? userIdMatch[1] : 'user-admin-1';
    const user = mockStore.users.find((u) => u.id === userId) || mockStore.users[0];
    return {
      accessToken: `mock_jwt_access_${user.id}_${Date.now()}`,
      refreshToken: `mock_jwt_refresh_${user.id}`,
    };
  },

  async logout(userEmail?: string) {
    await delay(100);
    if (userEmail) {
      mockStore.logAudit(userEmail, 'TEACHER', 'LOGOUT', 'USER', 'session', 'User logged out');
    }
    return { success: true };
  },

  async getMe(userId: string) {
    await delay(100);
    const user = mockStore.users.find((u) => u.id === userId) || mockStore.users[0];
    return user;
  },

  // ------------------ MASTER DATA ------------------
  async getDepartments() {
    await delay();
    return [...mockStore.departments];
  },
  async createDepartment(data: Partial<Department>) {
    await delay();
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      code: data.code || 'NEW',
      name: data.name || '',
      headOfDepartment: data.headOfDepartment || 'TBD',
      totalStudents: 0,
      totalTeachers: 0,
    };
    mockStore.departments.push(newDept);
    return newDept;
  },
  async updateDepartment(id: string, data: Partial<Department>) {
    await delay();
    const idx = mockStore.departments.findIndex((d) => d.id === id);
    if (idx !== -1) {
      mockStore.departments[idx] = { ...mockStore.departments[idx], ...data };
      return mockStore.departments[idx];
    }
    throw { status: 404, message: 'Department not found' };
  },
  async deleteDepartment(id: string) {
    await delay();
    mockStore.departments = mockStore.departments.filter((d) => d.id !== id);
    return { success: true };
  },

  // Programs
  async getPrograms() {
    await delay();
    return [...mockStore.programs];
  },
  async createProgram(data: Partial<Program>) {
    await delay();
    const dept = mockStore.departments.find((d) => d.id === data.departmentId);
    const newProg: Program = {
      id: `prog-${Date.now()}`,
      code: data.code || 'PROG',
      name: data.name || '',
      departmentId: data.departmentId || 'dept-cse',
      departmentName: dept ? dept.name : 'Computer Science & Engineering',
      degree: data.degree || 'B.Tech',
      totalSemesters: Number(data.totalSemesters) || 8,
    };
    mockStore.programs.push(newProg);
    return newProg;
  },
  async updateProgram(id: string, data: Partial<Program>) {
    await delay();
    const idx = mockStore.programs.findIndex((p) => p.id === id);
    if (idx !== -1) {
      mockStore.programs[idx] = { ...mockStore.programs[idx], ...data };
      return mockStore.programs[idx];
    }
    throw { status: 404, message: 'Program not found' };
  },
  async deleteProgram(id: string) {
    await delay();
    mockStore.programs = mockStore.programs.filter((p) => p.id !== id);
    return { success: true };
  },

  // Terms
  async getTerms() {
    await delay();
    return [...mockStore.terms];
  },
  async getCurrentTerm() {
    await delay();
    return mockStore.terms.find((t) => t.isCurrent) || mockStore.terms[0];
  },
  async setCurrentTerm(id: string) {
    await delay();
    mockStore.terms = mockStore.terms.map((t) => ({
      ...t,
      isCurrent: t.id === id,
    }));
    return mockStore.terms.find((t) => t.id === id);
  },
  async createTerm(data: Partial<AcademicTerm>) {
    await delay();
    const newTerm: AcademicTerm = {
      id: `term-${Date.now()}`,
      name: data.name || 'New Term',
      startDate: data.startDate || '2026-08-01',
      endDate: data.endDate || '2026-12-31',
      isCurrent: data.isCurrent || false,
    };
    if (newTerm.isCurrent) {
      mockStore.terms = mockStore.terms.map((t) => ({ ...t, isCurrent: false }));
    }
    mockStore.terms.push(newTerm);
    return newTerm;
  },
  async deleteTerm(id: string) {
    await delay();
    mockStore.terms = mockStore.terms.filter((t) => t.id !== id);
    return { success: true };
  },

  // Sections
  async getSections() {
    await delay();
    return [...mockStore.sections];
  },
  async createSection(data: Partial<Section>) {
    await delay();
    const prog = mockStore.programs.find((p) => p.id === data.programId);
    const newSec: Section = {
      id: `sec-${Date.now()}`,
      name: data.name || 'NEW-SEC',
      programId: data.programId || 'prog-btech-cse',
      programName: prog ? prog.name : 'Bachelor of Technology in CSE',
      termId: data.termId || 'term-fall-2026',
      semester: Number(data.semester) || 1,
      capacity: Number(data.capacity) || 60,
      studentCount: 0,
    };
    mockStore.sections.push(newSec);
    return newSec;
  },
  async deleteSection(id: string) {
    await delay();
    mockStore.sections = mockStore.sections.filter((s) => s.id !== id);
    return { success: true };
  },

  // Subjects
  async getSubjects() {
    await delay();
    return [...mockStore.subjects];
  },
  async createSubject(data: Partial<Subject>) {
    await delay();
    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      code: data.code || 'SUB101',
      name: data.name || '',
      departmentId: data.departmentId || 'dept-cse',
      credits: Number(data.credits) || 3,
      type: data.type || 'THEORY',
    };
    mockStore.subjects.push(newSub);
    return newSub;
  },
  async deleteSubject(id: string) {
    await delay();
    mockStore.subjects = mockStore.subjects.filter((s) => s.id !== id);
    return { success: true };
  },

  // Rooms
  async getRooms() {
    await delay();
    return [...mockStore.rooms];
  },
  async createRoom(data: Partial<Room>) {
    await delay();
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      code: data.code || 'R-101',
      building: data.building || 'Main Block',
      floor: Number(data.floor) || 1,
      capacity: Number(data.capacity) || 60,
      type: data.type || 'LECTURE_HALL',
      hasCamera: Boolean(data.hasCamera),
    };
    mockStore.rooms.push(newRoom);
    return newRoom;
  },
  async deleteRoom(id: string) {
    await delay();
    mockStore.rooms = mockStore.rooms.filter((r) => r.id !== id);
    return { success: true };
  },

  // Holidays
  async getHolidays() {
    await delay();
    return [...mockStore.holidays];
  },
  async createHoliday(data: Partial<Holiday>) {
    await delay();
    const newHol: Holiday = {
      id: `hol-${Date.now()}`,
      name: data.name || '',
      date: data.date || '2026-11-01',
      endDate: data.endDate,
      type: data.type || 'ACADEMIC',
    };
    mockStore.holidays.push(newHol);
    return newHol;
  },
  async deleteHoliday(id: string) {
    await delay();
    mockStore.holidays = mockStore.holidays.filter((h) => h.id !== id);
    return { success: true };
  },

  // ------------------ STUDENTS ------------------
  async getStudents(params?: { search?: string; sectionId?: string; status?: string; page?: number; size?: number }): Promise<PaginatedResponse<Student>> {
    await delay();
    let list = [...mockStore.students];
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    }
    if (params?.sectionId) {
      list = list.filter((s) => s.sectionId === params.sectionId);
    }
    if (params?.status) {
      list = list.filter((s) => s.status === params.status);
    }
    const page = params?.page ?? 0;
    const size = params?.size ?? 10;
    const totalElements = list.length;
    const totalPages = Math.ceil(totalElements / size) || 1;
    const content = list.slice(page * size, (page + 1) * size);
    return {
      content,
      totalElements,
      totalPages,
      number: page,
      size,
    };
  },
  async createStudent(data: Partial<Student>) {
    await delay();
    const sec = mockStore.sections.find((s) => s.id === data.sectionId);
    const newStudent: Student = {
      id: `stu-${Date.now()}`,
      studentId: data.studentId || `STU-2023-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.name || '',
      email: data.email || '',
      sectionId: data.sectionId || 'sec-cse-7a',
      sectionName: sec ? sec.name : 'CSE-7A',
      programId: 'prog-btech-cse',
      programName: 'Bachelor of Technology in CSE',
      semester: sec ? sec.semester : 7,
      status: 'ACTIVE',
      faceEnrolled: false,
      faceConsentGranted: false,
      overallAttendancePercentage: 100,
      parentEmail: data.parentEmail,
      parentName: data.parentName,
      phone: data.phone,
      createdAt: new Date().toISOString(),
    };
    mockStore.students.push(newStudent);
    return newStudent;
  },
  async updateStudent(id: string, data: Partial<Student>) {
    await delay();
    const idx = mockStore.students.findIndex((s) => s.id === id);
    if (idx !== -1) {
      mockStore.students[idx] = { ...mockStore.students[idx], ...data };
      return mockStore.students[idx];
    }
    throw { status: 404, message: 'Student not found' };
  },
  async deleteStudent(id: string) {
    await delay();
    mockStore.students = mockStore.students.filter((s) => s.id !== id);
    return { success: true };
  },
  async bulkImportStudents(csvRows: Array<{ studentId: string; name: string; email: string; section: string; parentEmail?: string }>) {
    await delay(350);
    const errors: Array<{ row: number; field: string; message: string }> = [];
    let successCount = 0;

    csvRows.forEach((row, i) => {
      const rowNum = i + 1;
      if (!row.name || row.name.trim().length < 2) {
        errors.push({ row: rowNum, field: 'name', message: 'Name must have at least 2 characters' });
        return;
      }
      if (!row.email || !row.email.includes('@')) {
        errors.push({ row: rowNum, field: 'email', message: 'Valid institutional email required' });
        return;
      }
      if (mockStore.students.some((s) => s.email.toLowerCase() === row.email.toLowerCase())) {
        errors.push({ row: rowNum, field: 'email', message: `Duplicate email '${row.email}' already exists` });
        return;
      }

      const newStudent: Student = {
        id: `stu-${Date.now()}-${i}`,
        studentId: row.studentId || `STU-2023-${1000 + i}`,
        name: row.name,
        email: row.email,
        sectionId: 'sec-cse-7a',
        sectionName: row.section || 'CSE-7A',
        programId: 'prog-btech-cse',
        programName: 'Bachelor of Technology in CSE',
        semester: 7,
        status: 'ACTIVE',
        faceEnrolled: false,
        faceConsentGranted: false,
        overallAttendancePercentage: 100,
        parentEmail: row.parentEmail,
        createdAt: new Date().toISOString(),
      };
      mockStore.students.push(newStudent);
      successCount++;
    });

    return {
      successCount,
      failureCount: errors.length,
      errors,
    };
  },

  // ------------------ TEACHERS ------------------
  async getTeachers() {
    await delay();
    return [...mockStore.teachers];
  },
  async createTeacher(data: Partial<Teacher>) {
    await delay();
    const dept = mockStore.departments.find((d) => d.id === data.departmentId);
    const newTea: Teacher = {
      id: `tea-${Date.now()}`,
      employeeId: data.employeeId || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name || '',
      email: data.email || '',
      departmentId: data.departmentId || 'dept-cse',
      departmentName: dept ? dept.name : 'Computer Science & Engineering',
      designation: data.designation || 'Assistant Professor',
      phone: data.phone || '+1 (555) 000-0000',
      status: 'ACTIVE',
      totalOfferings: 0,
      createdAt: new Date().toISOString(),
    };
    mockStore.teachers.push(newTea);
    return newTea;
  },
  async getTeacherOfferings(teacherId: string) {
    await delay();
    return mockStore.offerings.filter((o) => o.teacherId === teacherId);
  },

  // ------------------ OFFERINGS ------------------
  async getOfferings() {
    await delay();
    return [...mockStore.offerings];
  },
  async createOffering(data: { subjectId: string; sectionId: string; teacherId: string; termId: string }) {
    await delay();
    const sub = mockStore.subjects.find((s) => s.id === data.subjectId);
    const sec = mockStore.sections.find((s) => s.id === data.sectionId);
    const tea = mockStore.teachers.find((t) => t.id === data.teacherId);
    const term = mockStore.terms.find((t) => t.id === data.termId);
    const newOff: CourseOffering = {
      id: `offering-${Date.now()}`,
      subjectId: data.subjectId,
      subjectCode: sub?.code || 'SUB',
      subjectName: sub?.name || 'Subject',
      sectionId: data.sectionId,
      sectionName: sec?.name || 'Section',
      teacherId: data.teacherId,
      teacherName: tea?.name || 'Teacher',
      termId: data.termId,
      termName: term?.name || 'Fall 2026',
      enrolledStudentsCount: sec ? sec.studentCount || 60 : 60,
      averageAttendance: 80.0,
    };
    mockStore.offerings.push(newOff);
    return newOff;
  },
  async updateOfferingTeacher(id: string, teacherId: string) {
    await delay();
    const tea = mockStore.teachers.find((t) => t.id === teacherId);
    const off = mockStore.offerings.find((o) => o.id === id);
    if (!off || !tea) throw { status: 404, message: 'Offering or Teacher not found' };
    off.teacherId = teacherId;
    off.teacherName = tea.name;
    return off;
  },

  // ------------------ TIMETABLE & CONFLICT CHECK (409) ------------------
  async getTimetable() {
    await delay();
    return [...mockStore.timetable];
  },
  async getTimetableBySection(sectionId: string) {
    await delay();
    return mockStore.timetable.filter((t) => t.sectionId === sectionId);
  },
  async getTodayTimetableForTeacher(teacherId: string) {
    await delay();
    // For demo purposes, map to current active day slots
    return mockStore.timetable.filter((t) => t.teacherId === teacherId && (t.dayOfWeek === 'MONDAY' || t.dayOfWeek === 'WEDNESDAY'));
  },
  async createTimetableSlot(slotData: Omit<TimetableSlot, 'id'>) {
    await delay();
    // Validate for 409 conflict
    const roomConflict = mockStore.timetable.find(
      (t) => t.roomId === slotData.roomId && t.dayOfWeek === slotData.dayOfWeek && t.startTime === slotData.startTime
    );
    if (roomConflict) {
      throw {
        status: 409,
        message: `Room conflict: ${slotData.roomCode} is already booked for ${roomConflict.subjectCode} (${roomConflict.sectionName}) at ${slotData.startTime}.`,
      };
    }

    const teacherConflict = mockStore.timetable.find(
      (t) => t.teacherId === slotData.teacherId && t.dayOfWeek === slotData.dayOfWeek && t.startTime === slotData.startTime
    );
    if (teacherConflict) {
      throw {
        status: 409,
        message: `Teacher conflict: ${slotData.teacherName} is already assigned to ${teacherConflict.sectionName} at ${slotData.startTime}.`,
      };
    }

    const sectionConflict = mockStore.timetable.find(
      (t) => t.sectionId === slotData.sectionId && t.dayOfWeek === slotData.dayOfWeek && t.startTime === slotData.startTime
    );
    if (sectionConflict) {
      throw {
        status: 409,
        message: `Section conflict: Section ${slotData.sectionName} already has ${sectionConflict.subjectCode} scheduled at ${slotData.startTime}.`,
      };
    }

    const newSlot: TimetableSlot = {
      id: `tt-${Date.now()}`,
      ...slotData,
    };
    mockStore.timetable.push(newSlot);
    return newSlot;
  },
  async deleteTimetableSlot(id: string) {
    await delay();
    mockStore.timetable = mockStore.timetable.filter((t) => t.id !== id);
    return { success: true };
  },

  // ------------------ SESSIONS ------------------
  async getSessions() {
    await delay();
    return [...mockStore.sessions];
  },
  async generateSessions(startDate: string, endDate: string) {
    await delay(350);
    // Generate mock sessions from timetable for the range
    const createdCount = 6;
    mockStore.logAudit('admin@demo.com', 'ADMIN', 'SESSIONS_GENERATED', 'SESSION_BATCH', `${startDate}_to_${endDate}`, `Generated ${createdCount} automated academic timetable sessions`);
    return { generatedCount: createdCount, message: `Successfully generated ${createdCount} classroom sessions across enrolled sections.` };
  },
  async openSession(sessionId: string) {
    await delay();
    const sess = mockStore.sessions.find((s) => s.id === sessionId);
    if (!sess) throw { status: 404, message: 'Session not found' };
    sess.status = 'OPEN';
    mockStore.logAudit('teacher@demo.com', 'TEACHER', 'SESSION_OPENED', 'SESSION', sessionId, `Attendance window opened for ${sess.subjectCode}`);
    return sess;
  },
  async closeSession(sessionId: string) {
    await delay();
    const sess = mockStore.sessions.find((s) => s.id === sessionId);
    if (!sess) throw { status: 404, message: 'Session not found' };
    sess.status = 'CLOSED';
    // Auto-mark remaining students as ABSENT
    mockStore.attendance = mockStore.attendance.map((att) => {
      if (att.sessionId === sessionId && att.status === 'ABSENT' && !att.remarks) {
        return { ...att, remarks: 'Auto-marked absent on session close' };
      }
      return att;
    });
    mockStore.logAudit('teacher@demo.com', 'TEACHER', 'SESSION_CLOSED', 'SESSION', sessionId, `Session closed. Absent students auto-finalized.`);
    return sess;
  },
  async cancelSession(sessionId: string) {
    await delay();
    const sess = mockStore.sessions.find((s) => s.id === sessionId);
    if (!sess) throw { status: 404, message: 'Session not found' };
    sess.status = 'CANCELLED';
    return sess;
  },
  async getSessionQR(sessionId: string) {
    await delay(80);
    const token = `ACU_QR_${sessionId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    return {
      token,
      expiresIn: 25, // seconds
      refreshAt: new Date(Date.now() + 25000).toISOString(),
    };
  },

  // ------------------ ATTENDANCE ACTIONS ------------------
  async markSingleAttendance(data: { sessionId: string; studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; method?: any; remarks?: string }) {
    await delay();
    const existing = mockStore.attendance.find((a) => a.sessionId === data.sessionId && a.studentId === data.studentId);
    if (existing) {
      existing.status = data.status;
      existing.method = data.method || 'MANUAL';
      if (data.remarks) existing.remarks = data.remarks;
      return existing;
    }
    const student = mockStore.students.find((s) => s.id === data.studentId);
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sessionId: data.sessionId,
      studentId: data.studentId,
      studentName: student?.name || 'Student',
      studentRoll: student?.studentId || 'STU-0000',
      status: data.status,
      checkInTime: new Date().toLocaleTimeString(),
      method: data.method || 'MANUAL',
      remarks: data.remarks,
    };
    mockStore.attendance.push(newRecord);
    return newRecord;
  },

  async bulkMarkAttendance(sessionId: string, records: Array<{ studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' }>) {
    await delay(300);
    records.forEach((rec) => {
      const match = mockStore.attendance.find((a) => a.sessionId === sessionId && a.studentId === rec.studentId);
      if (match) {
        match.status = rec.status;
        match.method = 'MANUAL';
      } else {
        const student = mockStore.students.find((s) => s.id === rec.studentId);
        mockStore.attendance.push({
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          sessionId,
          studentId: rec.studentId,
          studentName: student?.name || 'Student',
          studentRoll: student?.studentId || 'STU-0000',
          status: rec.status,
          checkInTime: new Date().toLocaleTimeString(),
          method: 'MANUAL',
        });
      }
    });

    const sess = mockStore.sessions.find((s) => s.id === sessionId);
    if (sess) {
      const currentList = mockStore.attendance.filter((a) => a.sessionId === sessionId);
      sess.presentCount = currentList.filter((a) => a.status === 'PRESENT').length;
      sess.absentCount = currentList.filter((a) => a.status === 'ABSENT').length;
      sess.lateCount = currentList.filter((a) => a.status === 'LATE').length;
      sess.excusedCount = currentList.filter((a) => a.status === 'EXCUSED').length;
    }

    return { success: true, count: records.length };
  },

  // Face attendance recognition simulation
  async recognizeFaceFrame(sessionId: string, frameData: string | FormData) {
    await delay(600);
    // Pick 2-3 enrolled students in this section that are not yet marked present
    const pool = mockStore.students.filter((s) => s.faceEnrolled);
    const chosen = pool.slice(0, 3);
    const recognised = chosen.map((s, idx) => {
      const confidence = Number((92 + Math.random() * 7.5).toFixed(1));
      const liveness: 'PASSED' | 'FAILED' | 'SPOOF_SUSPECTED' = idx === 2 && Math.random() > 0.8 ? 'SPOOF_SUSPECTED' : 'PASSED';
      
      // Auto mark in attendance store if passed
      if (liveness === 'PASSED') {
        const existing = mockStore.attendance.find((a) => a.sessionId === sessionId && a.studentId === s.id);
        if (existing) {
          existing.status = 'PRESENT';
          existing.method = 'FACE';
          existing.confidenceScore = confidence;
          existing.livenessStatus = liveness;
          existing.checkInTime = new Date().toLocaleTimeString();
        } else {
          mockStore.attendance.push({
            id: `att-face-${Date.now()}-${idx}`,
            sessionId,
            studentId: s.id,
            studentName: s.name,
            studentRoll: s.studentId,
            status: 'PRESENT',
            checkInTime: new Date().toLocaleTimeString(),
            method: 'FACE',
            confidenceScore: confidence,
            livenessStatus: liveness,
          });
        }
      } else {
        // Enqueue to face review queue
        mockStore.faceQueue.push({
          id: `fr-${Date.now()}`,
          sessionId,
          sessionTitle: 'CS401 - Distributed Operating Systems',
          studentId: s.id,
          studentName: s.name,
          studentRoll: s.studentId,
          snapshotUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          confidenceScore: confidence,
          reason: 'LIVENESS_SUSPECT',
          capturedAt: new Date().toISOString(),
          status: 'PENDING',
        });
      }

      return {
        studentId: s.id,
        name: s.name,
        studentRoll: s.studentId,
        confidenceScore: confidence,
        livenessStatus: liveness,
      };
    });

    return {
      sessionId,
      processedAt: new Date().toISOString(),
      recognisedCount: recognised.filter((r) => r.livenessStatus === 'PASSED').length,
      suspectedSpoofs: recognised.filter((r) => r.livenessStatus === 'SPOOF_SUSPECTED').length,
      students: recognised,
    };
  },

  async markQrAttendance(sessionId: string, token: string, studentId: string) {
    await delay(200);
    const student = mockStore.students.find((s) => s.id === studentId);
    if (!student) throw { status: 404, message: 'Student identity not found' };
    
    // Check if session is open
    const sess = mockStore.sessions.find((s) => s.id === sessionId);
    if (!sess || sess.status !== 'OPEN') {
      throw { status: 400, message: 'Session is not currently open for attendance.' };
    }

    const existing = mockStore.attendance.find((a) => a.sessionId === sessionId && a.studentId === studentId);
    if (existing) {
      existing.status = 'PRESENT';
      existing.method = 'QR';
      existing.checkInTime = new Date().toLocaleTimeString();
      return existing;
    }

    const record: AttendanceRecord = {
      id: `att-qr-${Date.now()}`,
      sessionId,
      studentId,
      studentName: student.name,
      studentRoll: student.studentId,
      status: 'PRESENT',
      checkInTime: new Date().toLocaleTimeString(),
      method: 'QR',
    };
    mockStore.attendance.push(record);
    return record;
  },

  async markGeofenceAttendance(sessionId: string, coords: { lat: number; lng: number }, studentId: string) {
    await delay(250);
    // College campus center coordinates
    const campusLat = 37.7749;
    const campusLng = -122.4194;
    // Calculate approximate distance
    const dist = Math.sqrt(Math.pow(coords.lat - campusLat, 2) + Math.pow(coords.lng - campusLng, 2)) * 111000;
    
    // Allow up to 300 meters or mock pass
    const student = mockStore.students.find((s) => s.id === studentId);
    if (!student) throw { status: 404, message: 'Student record not found' };

    const record: AttendanceRecord = {
      id: `att-geo-${Date.now()}`,
      sessionId,
      studentId,
      studentName: student.name,
      studentRoll: student.studentId,
      status: 'PRESENT',
      checkInTime: new Date().toLocaleTimeString(),
      method: 'GEOFENCE',
      remarks: `Geofence verified (${Math.round(dist > 500 ? 42 : dist)}m from lecture hall)`,
    };
    mockStore.attendance.push(record);
    return record;
  },

  async getSessionAttendance(sessionId: string) {
    await delay();
    return mockStore.attendance.filter((a) => a.sessionId === sessionId);
  },

  async getStudentAttendance(studentId: string) {
    await delay();
    return mockStore.attendance.filter((a) => a.studentId === studentId);
  },

  async getMyAttendanceSummary(studentId: string) {
    await delay();
    return studentAlexShortfall;
  },

  async getOfferingDefaulters(offeringId: string) {
    await delay();
    // Return students with < 75% attendance in CSE-7A
    return mockStore.students.filter((s) => s.overallAttendancePercentage < 75);
  },

  // ------------------ FACE ENROLLMENT & CONSENT ------------------
  async enrollFace(studentId: string, framesBase64: string[]) {
    await delay(700);
    const stu = mockStore.students.find((s) => s.id === studentId);
    if (!stu) throw { status: 404, message: 'Student not found' };
    stu.faceEnrolled = true;
    stu.faceConsentGranted = true;
    mockStore.biometricConsent[studentId] = true;
    mockStore.logAudit(stu.email, 'STUDENT', 'FACE_ENROLLED', 'BIOMETRIC_MODEL', studentId, `Enrolled 3D face representation vector (${framesBase64.length} capture poses)`);
    return {
      success: true,
      message: 'Facial biometric template generated and encrypted with AES-256 GCM.',
      enrolledAt: new Date().toISOString(),
    };
  },

  async deleteFace(studentId: string) {
    await delay(300);
    const stu = mockStore.students.find((s) => s.id === studentId);
    if (stu) {
      stu.faceEnrolled = false;
      stu.faceConsentGranted = false;
    }
    delete mockStore.biometricConsent[studentId];
    mockStore.logAudit(stu?.email || studentId, 'STUDENT', 'FACE_DELETED', 'BIOMETRIC_MODEL', studentId, 'Permanently purged biometric templates upon consent revocation');
    return { success: true };
  },

  async getConsents() {
    await delay();
    return mockStore.biometricConsent;
  },

  async grantConsent(studentId: string) {
    await delay();
    mockStore.biometricConsent[studentId] = true;
    const stu = mockStore.students.find((s) => s.id === studentId);
    if (stu) stu.faceConsentGranted = true;
    return { success: true };
  },

  async revokeConsent(studentId: string) {
    await delay();
    mockStore.biometricConsent[studentId] = false;
    const stu = mockStore.students.find((s) => s.id === studentId);
    if (stu) {
      stu.faceConsentGranted = false;
      stu.faceEnrolled = false;
    }
    return { success: true };
  },

  // Face review queue
  async getFaceReviewQueue() {
    await delay();
    return mockStore.faceQueue.filter((e) => e.status === 'PENDING');
  },

  async reviewFaceEvent(eventId: string, approve: boolean, reviewerRemarks?: string) {
    await delay();
    const event = mockStore.faceQueue.find((e) => e.id === eventId);
    if (!event) throw { status: 404, message: 'Review event not found' };
    event.status = approve ? 'APPROVED' : 'REJECTED';
    if (approve) {
      // Mark student as present
      const match = mockStore.attendance.find((a) => a.sessionId === event.sessionId && a.studentId === event.studentId);
      if (match) {
        match.status = 'PRESENT';
        match.remarks = 'Manually approved by teacher from face review queue';
      }
    }
    mockStore.logAudit('teacher@demo.com', 'TEACHER', approve ? 'FACE_REVIEW_APPROVED' : 'FACE_REVIEW_REJECTED', 'FACE_EVENT', eventId, `Manual decision: ${approve ? 'Approved' : 'Rejected'}`);
    return event;
  },

  // ------------------ LEAVES & CORRECTIONS ------------------
  async getLeaves() {
    await delay();
    return [...mockStore.leaves];
  },
  async createLeave(data: { studentId: string; startDate: string; endDate: string; reason: string; documentName?: string }) {
    await delay();
    const stu = mockStore.students.find((s) => s.id === data.studentId);
    const newLeave: LeaveRequest = {
      id: `leave-${Date.now()}`,
      studentId: data.studentId,
      studentName: stu?.name || 'Alex Chen',
      studentRoll: stu?.studentId || 'STU-2023-0101',
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
      status: 'PENDING',
      documentName: data.documentName,
      createdAt: new Date().toISOString(),
    };
    mockStore.leaves.unshift(newLeave);
    return newLeave;
  },
  async approveLeave(id: string, reviewerName: string, remarks?: string) {
    await delay();
    const leave = mockStore.leaves.find((l) => l.id === id);
    if (!leave) throw { status: 404, message: 'Leave request not found' };
    leave.status = 'APPROVED';
    leave.reviewedBy = reviewerName;
    leave.reviewedAt = new Date().toISOString();
    leave.reviewerRemarks = remarks || 'Approved';
    return leave;
  },
  async rejectLeave(id: string, reviewerName: string, remarks?: string) {
    await delay();
    const leave = mockStore.leaves.find((l) => l.id === id);
    if (!leave) throw { status: 404, message: 'Leave request not found' };
    leave.status = 'REJECTED';
    leave.reviewedBy = reviewerName;
    leave.reviewedAt = new Date().toISOString();
    leave.reviewerRemarks = remarks || 'Rejected';
    return leave;
  },

  // Corrections
  async getCorrections() {
    await delay();
    return [...mockStore.corrections];
  },
  async createCorrection(data: { attendanceId: string; sessionId: string; studentId: string; sessionDate: string; subjectName: string; currentStatus: any; requestedStatus: any; reason: string }) {
    await delay();
    const stu = mockStore.students.find((s) => s.id === data.studentId);
    const newCorr: AttendanceCorrectionRequest = {
      id: `corr-${Date.now()}`,
      attendanceId: data.attendanceId,
      sessionId: data.sessionId,
      studentId: data.studentId,
      studentName: stu?.name || 'Alex Chen',
      studentRoll: stu?.studentId || 'STU-2023-0101',
      sessionDate: data.sessionDate,
      subjectName: data.subjectName,
      currentStatus: data.currentStatus,
      requestedStatus: data.requestedStatus,
      reason: data.reason,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    mockStore.corrections.unshift(newCorr);
    return newCorr;
  },
  async approveCorrection(id: string, reviewerName: string, comment?: string) {
    await delay();
    const corr = mockStore.corrections.find((c) => c.id === id);
    if (!corr) throw { status: 404, message: 'Correction request not found' };
    corr.status = 'APPROVED';
    corr.reviewedBy = reviewerName;
    corr.reviewedAt = new Date().toISOString();
    corr.reviewerComment = comment || 'Verified and updated';
    // Update underlying attendance record
    const att = mockStore.attendance.find((a) => a.id === corr.attendanceId || (a.sessionId === corr.sessionId && a.studentId === corr.studentId));
    if (att) {
      att.status = corr.requestedStatus;
      att.remarks = `Correction applied by ${reviewerName}: ${corr.reason}`;
    }
    return corr;
  },
  async rejectCorrection(id: string, reviewerName: string, comment?: string) {
    await delay();
    const corr = mockStore.corrections.find((c) => c.id === id);
    if (!corr) throw { status: 404, message: 'Correction request not found' };
    corr.status = 'REJECTED';
    corr.reviewedBy = reviewerName;
    corr.reviewedAt = new Date().toISOString();
    corr.reviewerComment = comment || 'Evidence insufficient';
    return corr;
  },

  // ------------------ DEVICES ------------------
  async getDevices() {
    await delay();
    return [...mockStore.devices];
  },
  async createDevice(data: { name: string; type: 'CAMERA' | 'KIOSK' | 'GATEWAY'; roomId: string; ipAddress: string; macAddress: string }) {
    await delay();
    const room = mockStore.rooms.find((r) => r.id === data.roomId);
    const newDev: Device = {
      id: `dev-${Date.now()}`,
      name: data.name,
      type: data.type,
      roomId: data.roomId,
      roomCode: room ? room.code : 'R-101',
      ipAddress: data.ipAddress,
      macAddress: data.macAddress,
      apiKeyMasked: 'acu_' + (data.type === 'CAMERA' ? 'cam' : 'ksk') + '_live_••••••••' + Math.random().toString(36).substr(2, 4),
      status: 'ONLINE',
      lastHeartbeat: new Date().toISOString(),
      firmwareVersion: 'v2.4.1-edge',
    };
    mockStore.devices.push(newDev);
    const plainApiKey = `acu_live_${Math.random().toString(36).substr(2, 12)}_${Math.random().toString(36).substr(2, 12)}`;
    return {
      device: newDev,
      rawApiKey: plainApiKey,
    };
  },
  async rotateDeviceKey(deviceId: string) {
    await delay();
    const dev = mockStore.devices.find((d) => d.id === deviceId);
    if (!dev) throw { status: 404, message: 'Device not found' };
    const plainApiKey = `acu_rotated_${Math.random().toString(36).substr(2, 12)}_${Date.now()}`;
    dev.apiKeyMasked = 'acu_live_••••••••' + plainApiKey.substr(-4);
    return { rawApiKey: plainApiKey };
  },

  // ------------------ ATTENDANCE POLICIES ------------------
  async getPolicies() {
    await delay();
    return [...mockStore.policies];
  },
  async updatePolicy(id: string, updates: Partial<AttendancePolicy>) {
    await delay();
    const pol = mockStore.policies.find((p) => p.id === id);
    if (!pol) throw { status: 404, message: 'Policy not found' };
    Object.assign(pol, updates);
    mockStore.logAudit('admin@demo.com', 'ADMIN', 'POLICY_UPDATED', 'POLICY', id, `Updated thresholds for ${pol.programName}`);
    return pol;
  },

  // ------------------ NOTIFICATIONS ------------------
  async getNotifications(userId: string) {
    await delay();
    return mockStore.notifications.filter((n) => n.userId === userId || n.userId === 'user-admin-1');
  },
  async markNotificationRead(id: string) {
    await delay(80);
    const n = mockStore.notifications.find((notif) => notif.id === id);
    if (n) n.isRead = true;
    return { success: true };
  },
  async markAllNotificationsRead(userId: string) {
    await delay(100);
    mockStore.notifications.forEach((n) => {
      if (n.userId === userId || n.userId === 'user-admin-1') n.isRead = true;
    });
    return { success: true };
  },

  // ------------------ ANALYTICS & AUDIT ------------------
  async getDashboardAnalytics() {
    await delay();
    return {
      totalStudents: mockStore.students.length * 60, // scaled representative
      totalTeachers: mockStore.teachers.length,
      todayAttendancePercentage: 86.4,
      activeSessionsCount: mockStore.sessions.filter((s) => s.status === 'OPEN').length,
      defaulterCount: mockStore.students.filter((s) => s.overallAttendancePercentage < 75).length,
      attendanceTrend30Days: [
        { date: 'Oct 01', rate: 84.2 },
        { date: 'Oct 05', rate: 88.5 },
        { date: 'Oct 08', rate: 86.1 },
        { date: 'Oct 12', rate: 89.4 },
        { date: 'Oct 15', rate: 87.0 },
        { date: 'Oct 19', rate: 85.3 },
        { date: 'Oct 22', rate: 86.8 },
        { date: 'Oct 26', rate: 88.2 },
      ],
      departmentRates: [
        { department: 'Computer Science', rate: 88.4, students: 480 },
        { department: 'Electronics', rate: 84.1, students: 360 },
        { department: 'Mechanical', rate: 81.6, students: 320 },
        { department: 'Management', rate: 91.2, students: 240 },
      ],
      faceAnalytics: {
        totalFacesProcessedToday: 1420,
        matchSuccessRate: 97.4,
        spoofAttemptsDetected: 3,
        reviewQueueSize: mockStore.faceQueue.filter((e) => e.status === 'PENDING').length,
      },
    };
  },

  async getAuditLogs() {
    await delay();
    return [...mockStore.auditLogs];
  },

  // ------------------ USERS ------------------
  async getUsers() {
    await delay();
    return [...mockStore.users];
  },
  async updateUserStatus(id: string, status: 'ACTIVE' | 'LOCKED' | 'SUSPENDED') {
    await delay();
    const u = mockStore.users.find((user) => user.id === id);
    if (!u) throw { status: 404, message: 'User not found' };
    u.status = status;
    return u;
  },
  async updateUserRole(id: string, role: any) {
    await delay();
    const u = mockStore.users.find((user) => user.id === id);
    if (!u) throw { status: 404, message: 'User not found' };
    u.role = role;
    return u;
  },
};
