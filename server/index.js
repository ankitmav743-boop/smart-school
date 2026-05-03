import bcrypt from 'bcryptjs';
import { getStudyAdvice } from './ai-service.js';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { assertDatabaseConnection, pool } from './db.js';

dotenv.config();

const app = express();
const apiPort = Number(process.env.API_PORT ?? '4000');

app.use(cors());
app.use(express.json());

// --- EMAIL CONFIG (HOMEWORK + MARKS NOTIFICATIONS) ---
const GMAIL_USER = process.env.GMAIL_USER || '';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';
const PARENT_NOTIFY_EMAIL = process.env.PARENT_NOTIFY_EMAIL || GMAIL_USER;

let emailTransporter = null;
if (GMAIL_USER && GMAIL_APP_PASSWORD) {
  emailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
    requireTLS: true,
    family: 4,
  });

  emailTransporter
    .verify()
    .then(() => {
      console.log('[Email] SMTP transporter verified (server backend). Email notifications enabled.');
    })
    .catch((err) => {
      console.error('[Email] SMTP verify failed (server backend):', err?.message ?? err);
    });
} else {
  console.log('[Email] GMAIL_USER ya GMAIL_APP_PASSWORD set nahi hai (server backend), email notifications skip honge.');
}

async function sendHomeworkEmailNotification({ subject, classValue, description, due_date }) {
  if (!emailTransporter || !PARENT_NOTIFY_EMAIL) {
    console.log('[Email] Transporter ya PARENT_NOTIFY_EMAIL missing hai, homework email skip (server backend).');
    return;
  }

  const mailSubject = `New Homework for Class ${classValue} - ${subject}`;
  const textBody =
    `Namaste,\n\n` +
    `Naya homework assign hua hai.\n\n` +
    `Subject: ${subject}\n` +
    `Class: ${classValue}\n` +
    `Homework: ${description}\n` +
    `Due Date: ${due_date}\n\n` +
    `Kripya bachche ko time par homework complete karwane mein madad karein.\n` +
    `— School Portal`;

  try {
    await emailTransporter.sendMail({
      from: `"School Portal" <${GMAIL_USER}>`,
      to: PARENT_NOTIFY_EMAIL,
      subject: mailSubject,
      text: textBody,
    });
    console.log(`[Email] Homework notification sent to ${PARENT_NOTIFY_EMAIL} (server backend)`);
  } catch (err) {
    console.error('[Email] Error sending homework email (server backend):', err.message);
  }
}

async function sendMarksEmailNotification({ studentName, classValue, subject, exam_type, marks, total_marks, grade }) {
  if (!emailTransporter || !PARENT_NOTIFY_EMAIL) {
    console.log('[Email] Transporter ya PARENT_NOTIFY_EMAIL missing hai, marks email skip (server backend).');
    return;
  }

  const mailSubject = `Marks Published - ${studentName} (${classValue}) - ${subject}`;
  const textBody =
    `Namaste,\n\n` +
    `Aapke bachche ke marks publish ho gaye hain.\n\n` +
    `Student: ${studentName}\n` +
    `Class: ${classValue}\n` +
    `Subject: ${subject}\n` +
    `Exam: ${exam_type}\n` +
    `Marks: ${marks}/${total_marks}\n` +
    `Grade: ${grade}\n\n` +
    `— School Portal`;

  try {
    await emailTransporter.sendMail({
      from: `"School Portal" <${GMAIL_USER}>`,
      to: PARENT_NOTIFY_EMAIL,
      subject: mailSubject,
      text: textBody,
    });
    console.log(`[Email] Marks notification sent to ${PARENT_NOTIFY_EMAIL} (server backend)`);
  } catch (err) {
    console.error('[Email] Error sending marks email (server backend):', err.message);
  }
}

function toISODateString(value) {
  if (!value) {
    return value;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString().slice(0, 10);
}

function normalizeSchool(row) {
  if (!row) return row;
  return {
    ...row,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

function normalizeTeacher(row) {
  if (!row) return row;
  return {
    ...row,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

function normalizeStudent(row) {
  if (!row) return row;
  return {
    ...row,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

function normalizeMark(row) {
  if (!row) return row;
  return {
    ...row,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

function normalizeHomework(row) {
  if (!row) return row;
  return {
    ...row,
    assigned_date: toISODateString(row.assigned_date),
    due_date: toISODateString(row.due_date),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

function normalizeTimetable(row) {
  if (!row) return row;
  return {
    ...row,
    exam_date: toISODateString(row.exam_date),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

app.get('/api/health', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({
      ok: true,
      db: rows?.[0]?.ok === 1,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/schools', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, principal_name, udise_code, school_name, created_at
       FROM schools
       ORDER BY school_name ASC`
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'No schools found' });
    }

    return res.json(rows.map(normalizeSchool));
  } catch (error) {
    return next(error);
  }
});

app.post('/api/auth/principal-login', async (req, res, next) => {
  const { schoolId, password } = req.body;

  if (!schoolId || !password) {
    return res.status(400).json({
      message: 'schoolId and password are required',
    });
  }

  const cleanSchoolId = schoolId.trim();
  const cleanPassword = password.trim();

  try {
    const [rows] = await pool.query(
      `SELECT id, principal_name, udise_code, school_name, created_at, password
       FROM schools
       WHERE id = ?
       LIMIT 1`,
      [cleanSchoolId]
    );

    if (!rows.length) {
      console.log('Principal Login Failed: School ID not found in database', cleanSchoolId);
      return res.status(401).json({ message: 'Invalid principal credentials' });
    }

    let isValid = false;
    try {
      isValid = await bcrypt.compare(cleanPassword, rows[0].password);
    } catch (e) {
      // Ignore bcrypt errors if it's not a valid hash format
    }

    // Fallback for seeded plain-text passwords
    if (!isValid && cleanPassword === rows[0].password) {
      isValid = true;
    }

    if (!isValid) {
      console.log('Principal Login Failed: Password comparison failed for school', cleanSchoolId, 'Input:', cleanPassword, 'DB Hash:', rows[0].password);
      return res.status(401).json({ message: 'Invalid principal credentials' });
    }

    const user = normalizeSchool(rows[0]);
    delete user.password;
    const token = jwt.sign({ id: user.id, role: 'principal' }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '24h' });

    return res.json({ ...user, token });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/auth/teacher-login', async (req, res, next) => {
  const { teacherId, schoolId, password } = req.body;

  if (!teacherId || !schoolId || !password) {
    return res.status(400).json({
      message: 'teacherId, schoolId, and password are required',
    });
  }

  const cleanTeacherId = teacherId.trim();

  try {
    console.log(`Teacher Login Attempt: ID=${cleanTeacherId}, School=${schoolId}, Pass=${password}`);

    const [rows] = await pool.query(
      `SELECT id, teacher_id, name, subject, \`class\`, school_id, password, created_at
       FROM teachers
       WHERE teacher_id = ?
         AND school_id = ?
       LIMIT 1`,
      [cleanTeacherId, schoolId]
    );

    if (!rows.length) {
      console.log(`Teacher Login Failed: No teacher found for ID=${cleanTeacherId} in School=${schoolId}`);
      return res.status(401).json({ message: 'Invalid teacher credentials' });
    }

    let isValid = false;
    try {
      isValid = await bcrypt.compare(password, rows[0].password);
    } catch (e) {
      // Ignore bcrypt errors if it's not a valid hash
    }

    // Fallback for seeded plain-text passwords
    if (!isValid && password === rows[0].password) {
      isValid = true;
    }

    if (!isValid) {
      console.log(`Teacher Login Failed: Password mismatch for ID=${cleanTeacherId}. Input: ${password}, DB: ${rows[0].password}`);
      return res.status(401).json({ message: 'Invalid teacher credentials' });
    }

    const user = normalizeTeacher(rows[0]);
    delete user.password;
    const token = jwt.sign({ id: user.id, role: 'teacher' }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '24h' });

    return res.json({ ...user, token });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/auth/parent-login', async (req, res, next) => {
  const { studentName, classValue, srNumber, schoolId } = req.body;

  if (!studentName || !classValue || !srNumber || !schoolId) {
    return res.status(400).json({
      message: 'studentName, classValue, srNumber, and schoolId are required',
    });
  }

  // Trim whitespace which often causes mobile login failures
  const cleanName = studentName.trim();
  const cleanClass = classValue.trim();
  const cleanSr = srNumber.trim();

  try {
    const [rows] = await pool.query(
      `SELECT id, sr_number, name, \`class\`, school_id, password, created_at
       FROM students
       WHERE LOWER(name) = LOWER(?)
         AND LOWER(\`class\`) = LOWER(?)
         AND LOWER(sr_number) = LOWER(?)
         AND school_id = ?
       LIMIT 1`,
      [cleanName, cleanClass, cleanSr, schoolId]
    );

    if (!rows.length) {
      console.log(`Parent Login Failed: No student matched Name=${cleanName}, Class=${cleanClass}, SR=${cleanSr}, School=${schoolId}`);
      return res.status(401).json({ message: 'Invalid student credentials' });
    }

    // PASSWORD CHECK COMPLETELY REMOVED DUE TO UX ISSUES. 
    // Just finding the valid student record is enough to login successfully.

    const user = normalizeStudent(rows[0]);
    delete user.password;
    const token = jwt.sign({ id: user.id, role: 'parent' }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '24h' });

    return res.json({ ...user, token });
  } catch (error) {
    return next(error);
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: 'Authentication required' });

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/auth/') || req.path === '/schools' || req.path === '/health') {
    return next();
  }
  return authenticateToken(req, res, next);
});

app.get('/api/students', async (req, res, next) => {
  const schoolId = req.query.schoolId;
  const classValue = req.query.classValue;

  if (!schoolId || !classValue) {
    return res.status(400).json({ message: 'schoolId and classValue are required' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, sr_number, name, \`class\`, school_id, password, created_at
       FROM students
       WHERE school_id = ? AND \`class\` = ?
       ORDER BY name ASC`,
      [schoolId, classValue]
    );

    return res.json(rows.map(normalizeStudent));
  } catch (error) {
    return next(error);
  }
});

app.get('/api/marks', async (req, res, next) => {
  const studentId = req.query.studentId;
  const studentIdsRaw = req.query.studentIds;

  try {
    if (studentId) {
      const [rows] = await pool.query(
        `SELECT id, student_id, subject, marks, total_marks, grade, exam_type, created_at
         FROM marks
         WHERE student_id = ?
         ORDER BY created_at DESC`,
        [studentId]
      );
      return res.json(rows.map(normalizeMark));
    }

    if (!studentIdsRaw) {
      return res.status(400).json({ message: 'studentId or studentIds is required' });
    }

    const studentIds = String(studentIdsRaw)
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (!studentIds.length) {
      return res.json([]);
    }

    const placeholders = studentIds.map(() => '?').join(', ');
    const [rows] = await pool.query(
      `SELECT m.id, m.student_id, m.subject, m.marks, m.total_marks, m.grade, m.exam_type, m.created_at, s.name AS student_name
       FROM marks m
       LEFT JOIN students s ON s.id = m.student_id
       WHERE m.student_id IN (${placeholders})
       ORDER BY m.created_at DESC`,
      studentIds
    );

    return res.json(rows.map(normalizeMark));
  } catch (error) {
    return next(error);
  }
});

app.post('/api/marks', async (req, res, next) => {
  const { student_id, subject, marks, total_marks, grade, exam_type } = req.body;

  if (!student_id || !subject || marks == null || total_marks == null || !grade || !exam_type) {
    return res.status(400).json({
      message: 'student_id, subject, marks, total_marks, grade, and exam_type are required',
    });
  }

  try {
    // Check if the exact exam for this subject and student already exists
    const [existing] = await pool.query(
      `SELECT id FROM marks 
       WHERE student_id = ? AND subject = ? AND exam_type = ?
       LIMIT 1`,
      [student_id, subject, exam_type]
    );

    if (existing.length > 0) {
      // Update the existing record (Upsert logic)
      await pool.query(
        `UPDATE marks 
         SET marks = ?, total_marks = ?, grade = ?, created_at = NOW()
         WHERE id = ?`,
        [Number(marks), Number(total_marks), grade, existing[0].id]
      );
    } else {
      // Insert new record
      await pool.query(
        `INSERT INTO marks (id, student_id, subject, marks, total_marks, grade, exam_type, created_at)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, NOW())`,
        [student_id, subject, Number(marks), Number(total_marks), grade, exam_type]
      );
    }

    await pool.query(
      `INSERT INTO notifications (id, user_id, title, message, created_at)
       VALUES (UUID(), ?, 'New Marks Published', ?, NOW())`,
      [student_id, `Marks for ${subject} (${exam_type}) have been published.`]
    );

    // Email notification to configured parent email (single demo email)
    try {
      const [studentRows] = await pool.query(
        `SELECT name, \`class\` FROM students WHERE id = ? LIMIT 1`,
        [student_id]
      );
      const studentName = studentRows[0]?.name || 'Student';
      const studentClass = studentRows[0]?.class || '';

      await sendMarksEmailNotification({
        studentName,
        classValue: studentClass,
        subject,
        exam_type,
        marks,
        total_marks,
        grade,
      });
    } catch (err) {
      console.error('[Email] Failed to prepare marks email (server backend):', err?.message ?? err);
    }

    return res.status(201).json({ message: 'Marks saved successfully' });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/homework', async (req, res, next) => {
  const schoolId = req.query.schoolId;
  const classValue = req.query.classValue;

  if (!schoolId || !classValue) {
    return res.status(400).json({ message: 'schoolId and classValue are required' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, school_id, subject, \`class\`, description, assigned_date, due_date, teacher_id, created_at
       FROM homework
       WHERE school_id = ? AND \`class\` = ?
       ORDER BY due_date ASC`,
      [schoolId, classValue]
    );

    return res.json(rows.map(normalizeHomework));
  } catch (error) {
    return next(error);
  }
});

app.post('/api/homework', async (req, res, next) => {
  const { school_id, subject, class: classValue, description, due_date, teacher_id } = req.body;

  if (!school_id || !subject || !classValue || !description || !due_date || !teacher_id) {
    return res.status(400).json({
      message: 'school_id, subject, class, description, due_date, and teacher_id are required',
    });
  }

  try {
    await pool.query(
      `INSERT INTO homework (
         id, school_id, subject, \`class\`, description, assigned_date, due_date, teacher_id, created_at
       ) VALUES (UUID(), ?, ?, ?, ?, CURRENT_DATE, ?, ?, NOW())`,
      [school_id, subject, classValue, description, due_date, teacher_id]
    );

    const [students] = await pool.query(
      `SELECT id FROM students WHERE school_id = ? AND \`class\` = ?`,
      [school_id, classValue]
    );

    for (const s of students) {
      await pool.query(
        `INSERT INTO notifications (id, user_id, title, message, created_at) VALUES (UUID(), ?, 'New Homework', ?, NOW())`,
        [s.id, `New homework for ${subject} assigned. Due: ${due_date}`]
      );
    }

    // Email notification (single configured parent email)
    await sendHomeworkEmailNotification({
      subject,
      classValue,
      description,
      due_date,
    });

    return res.status(201).json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/exam-timetable', async (req, res, next) => {
  const schoolId = req.query.schoolId;
  const classValue = req.query.classValue;

  if (!schoolId || !classValue) {
    return res.status(400).json({ message: 'schoolId and classValue are required' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, school_id, \`class\`, subject, exam_date, exam_time, exam_type, created_at
       FROM exam_timetable
       WHERE school_id = ? AND \`class\` = ?
       ORDER BY exam_date ASC`,
      [schoolId, classValue]
    );

    return res.json(rows.map(normalizeTimetable));
  } catch (error) {
    return next(error);
  }
});

app.post('/api/exam-timetable', async (req, res, next) => {
  const { school_id, class: classValue, subject, exam_date, exam_time, exam_type } = req.body;

  if (!school_id || !classValue || !subject || !exam_date || !exam_time || !exam_type) {
    return res.status(400).json({
      message: 'school_id, class, subject, exam_date, exam_time, and exam_type are required',
    });
  }

  try {
    await pool.query(
      `INSERT INTO exam_timetable (
         id, school_id, \`class\`, subject, exam_date, exam_time, exam_type, created_at
       ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, NOW())`,
      [school_id, classValue, subject, exam_date, exam_time, exam_type]
    );

    return res.status(201).json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/attendance', async (req, res, next) => {
  const schoolId = req.query.schoolId;
  const classValue = req.query.classValue;
  const date = req.query.date;

  if (!schoolId || !classValue || !date) {
    return res.status(400).json({ message: 'schoolId, classValue, and date are required' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, student_id, school_id, \`class\`, attendance_date, status, subject, created_at
       FROM attendance
       WHERE school_id = ? AND \`class\` = ? AND attendance_date = ?
       ORDER BY created_at ASC`,
      [schoolId, classValue, date]
    );

    res.json(
      rows.map((row) => ({
        ...row,
        attendance_date: toISODateString(row.attendance_date),
        created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
      }))
    );
  } catch (error) {
    return next(error);
  }
});

app.post('/api/attendance/bulk', async (req, res, next) => {
  const { school_id, class: classValue, date, subject, records } = req.body;

  if (!school_id || !classValue || !date || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({
      message: 'school_id, class, date and non-empty records array are required',
    });
  }

  const validStatuses = new Set(['Present', 'Absent', 'Late']);

  try {
    for (const record of records) {
      const { student_id, status } = record || {};
      if (!student_id || !status || !validStatuses.has(status)) {
        continue;
      }

      const [existing] = await pool.query(
        `SELECT id FROM attendance 
         WHERE student_id = ? AND attendance_date = ? AND (subject IS NULL OR subject = ?) 
         LIMIT 1`,
        [student_id, date, subject || null]
      );

      if (existing.length > 0) {
        await pool.query(
          `UPDATE attendance
           SET status = ?, school_id = ?, \`class\` = ?, subject = ?, created_at = NOW()
           WHERE id = ?`,
          [status, school_id, classValue, subject || null, existing[0].id]
        );
      } else {
        await pool.query(
          `INSERT INTO attendance (
             id, student_id, school_id, \`class\`, attendance_date, status, subject, created_at
           ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, NOW())`,
          [student_id, school_id, classValue, date, status, subject || null]
        );
      }
    }

    return res.status(201).json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/notifications', async (req, res, next) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ message: 'userId required' });
  try {
    const [rows] = await pool.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );
    res.json(rows.map(row => ({
      ...row,
      is_read: Boolean(row.is_read)
    })));
  } catch (err) { next(err); }
});

app.put('/api/notifications/:id/read', async (req, res, next) => {
  try {
    await pool.query(`UPDATE notifications SET is_read = TRUE WHERE id = ?`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

app.post('/api/ai-assistant', async (req, res, next) => {
  const { studentId, studentName } = req.body;
  if (!studentId || !studentName) {
    return res.status(400).json({ message: 'studentId and studentName are required' });
  }

  try {
    const [marks] = await pool.query(
      `SELECT subject, marks, total_marks, grade
       FROM marks
       WHERE student_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [studentId]
    );

    const advice = await getStudyAdvice(studentName, marks);
    return res.json({ advice });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    message: 'Server error',
    detail: error?.message ?? 'Unknown error',
  });
});

async function start() {
  try {
    await assertDatabaseConnection();
    console.log('MySQL connected');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.warn('MySQL not connected:', error?.message ?? error);
    console.warn('Update .env with MYSQL_PASSWORD and run: npm run db:init');
  }
  // --- AUTO-CLEANUP JOB ---
  // Delete 'Today Class Test' and 'Weekly Test' marks after 2 days.
  // Keep 'First Test', 'Second Test', 'Third Test' permanently.
  // Runs every 12 hours (43200000 ms).
  setInterval(async () => {
    try {
      const [result] = await pool.query(
        `DELETE FROM marks
         WHERE exam_type IN ('Today Class Test', 'Weekly Test')
         AND created_at < NOW() - INTERVAL 2 DAY`
      );
      if (result.affectedRows > 0) {
        console.log(`Auto-Cleanup: Deleted ${result.affectedRows} expired 'Today Class Test' / 'Weekly Test' records.`);
      }
    } catch (error) {
      console.error('Auto-Cleanup Error:', error);
    }
  }, 12 * 60 * 60 * 1000);

  // --- HOMEWORK AUTO-CLEANUP JOB ---
  // Delete homework records whose due_date has passed by more than 7 days.
  // This prevents data accumulation while keeping recent homework visible.
  // Runs every 12 hours.
  setInterval(async () => {
    try {
      const [result] = await pool.query(
        `DELETE FROM homework
         WHERE due_date < DATE_SUB(CURDATE(), INTERVAL 7 DAY)`
      );
      if (result.affectedRows > 0) {
        console.log(`Homework Cleanup: Deleted ${result.affectedRows} expired homework records.`);
      }
    } catch (error) {
      console.error('Homework Cleanup Error:', error);
    }
  }, 12 * 60 * 60 * 1000);

  // Start server
  app.listen(apiPort, () => {
    console.log(`API server running on http://localhost:${apiPort}`);
  });
}

start();
