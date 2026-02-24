import bcrypt from 'bcryptjs';
import { getStudyAdvice } from './ai-service.js';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { assertDatabaseConnection, pool } from './db.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Always load backend/.env even if process is started from repo root
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
// Render jaise platforms PORT env variable dete hain, warna local API_PORT ya 4000 use karo
const apiPort = Number(process.env.PORT ?? process.env.API_PORT ?? '4000');
const FONNTE_TOKEN = process.env.FONNTE_TOKEN || '';
const WHATSAPP_NUMBER = process.env.WHATSAPP_NOTIFY_NUMBER || '';

// Gmail / Email notification config
const GMAIL_USER = process.env.GMAIL_USER || '';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';
const PARENT_NOTIFY_EMAIL = process.env.PARENT_NOTIFY_EMAIL || GMAIL_USER;
const SMTP_ALLOW_SELF_SIGNED = String(process.env.SMTP_ALLOW_SELF_SIGNED || '').toLowerCase() === 'true';

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
    // Helps on networks where IPv6 SMTP is blocked
    family: 4,
    ...(SMTP_ALLOW_SELF_SIGNED ? { tls: { rejectUnauthorized: false } } : {}),
  });

  emailTransporter
    .verify()
    .then(() => {
      console.log('[Email] SMTP transporter verified. Email notifications enabled.');
    })
    .catch((err) => {
      console.error('[Email] SMTP verify failed. Email notifications may not work:', err?.message ?? err);
    });
} else {
  console.log('[Email] GMAIL_USER ya GMAIL_APP_PASSWORD set nahi hai, email notifications skip honge.');
}

async function sendHomeworkEmailNotification({ subject, classValue, description, due_date }) {
  if (!emailTransporter || !PARENT_NOTIFY_EMAIL) {
    console.log('[Email] Transporter ya PARENT_NOTIFY_EMAIL missing hai, homework email skip.');
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
    console.log(`[Email] Homework notification sent to ${PARENT_NOTIFY_EMAIL}`);
  } catch (err) {
    console.error('[Email] Error sending homework email:', err.message);
  }
}

async function sendMarksEmailNotification({ studentName, classValue, subject, exam_type, marks, total_marks, grade }) {
  if (!emailTransporter || !PARENT_NOTIFY_EMAIL) {
    console.log('[Email] Transporter ya PARENT_NOTIFY_EMAIL missing hai, marks email skip.');
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
    console.log(`[Email] Marks notification sent to ${PARENT_NOTIFY_EMAIL}`);
  } catch (err) {
    console.error('[Email] Error sending marks email:', err.message);
  }
}

async function sendMarksEmailToStudent({ email, studentName, classValue, subject, exam_type, marks, total_marks, grade }) {
  if (!emailTransporter) {
    return;
  }

  const cleanEmail = String(email || '').trim();
  if (!cleanEmail) {
    await sendMarksEmailNotification({ studentName, classValue, subject, exam_type, marks, total_marks, grade });
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
      to: cleanEmail,
      subject: mailSubject,
      text: textBody,
    });
    console.log(`[Email] Marks notification sent to student email: ${cleanEmail}`);
  } catch (err) {
    console.error('[Email] Error sending marks email to student:', err.message);
  }
}

async function sendHomeworkEmailToStudents({ schoolId, classValue, subject, description, due_date }) {
  if (!emailTransporter) {
    return;
  }

  try {
    const [rows] = await pool.query(
      `SELECT email FROM students WHERE school_id = ? AND \`class\` = ?`,
      [schoolId, classValue]
    );

    const emails = Array.from(
      new Set(
        (rows || [])
          .map((r) => String(r.email || '').trim())
          .filter(Boolean)
      )
    );

    if (!emails.length) {
      // fallback demo email if configured
      await sendHomeworkEmailNotification({ subject, classValue, description, due_date });
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
      `— School Portal`;

    await emailTransporter.sendMail({
      from: `"School Portal" <${GMAIL_USER}>`,
      to: emails.join(','),
      subject: mailSubject,
      text: textBody,
    });
    console.log(`[Email] Homework notification sent to students: ${emails.join(', ')}`);
  } catch (err) {
    console.error('[Email] Error sending homework email to students:', err.message);
  }
}

// WhatsApp notification via Fonnte API
async function sendWhatsAppNotification(message) {
  if (!FONNTE_TOKEN || !WHATSAPP_NUMBER) {
    console.log('[WhatsApp] (DEMO) Token ya number set nahi hai, isliye abhi sirf console log ho raha hai.');
    console.log('[WhatsApp DEMO MESSAGE]:', message);
    return;
  }
  try {
    const resp = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': FONNTE_TOKEN,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        target: WHATSAPP_NUMBER,
        message: message,
        countryCode: '91',
      }).toString(),
    });
    const data = await resp.json();
    if (data.status) {
      console.log(`[WhatsApp] Message sent to ${WHATSAPP_NUMBER}:`, data);
    } else {
      console.warn('[WhatsApp] Send failed:', data);
    }
  } catch (err) {
    console.error('[WhatsApp] Error sending message:', err.message);
  }
}

app.use(cors());
app.use(express.json());

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
  const { teacherId, schoolId, password, subject } = req.body;

  if (!teacherId || !schoolId || !password || !subject) {
    return res.status(400).json({
      message: 'teacherId, schoolId, password, and subject are required',
    });
  }

  const cleanTeacherId = teacherId.trim();

  try {
    console.log(`Teacher Login Attempt: ID=${cleanTeacherId}, School=${schoolId}, Pass=${password}, Subject=${subject}`);

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

    // Validate subject matches the database record
    if (rows[0].subject !== subject) {
      console.log(`Teacher Login Failed: Subject mismatch for ID=${cleanTeacherId}. Input: ${subject}, DB: ${rows[0].subject}`);
      return res.status(401).json({ message: 'Aapne galat subject select kiya hai. Kripya apna sahi subject chunein.' });
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
  const { studentName, classValue, srNumber, schoolId, password } = req.body;

  if (!studentName || !classValue || !srNumber || !schoolId) {
    return res.status(400).json({
      message: 'studentName, classValue, srNumber, and schoolId are required',
    });
  }

  // Trim whitespace which often causes mobile login failures
  const cleanName = studentName.trim();
  const cleanClass = classValue.trim();
  const cleanSr = srNumber.trim();
  const cleanPassword = (password || '').trim();

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
      return res.status(401).json({ message: 'Student not found. Please check the details.' });
    }

    // Password check
    if (cleanPassword) {
      let isValid = false;
      try {
        isValid = await bcrypt.compare(cleanPassword, rows[0].password);
      } catch (e) { /* not a bcrypt hash */ }

      // Fallback for plain-text passwords
      if (!isValid && cleanPassword === rows[0].password) {
        isValid = true;
      }

      if (!isValid) {
        console.log(`Parent Login Failed: Wrong password for Name=${cleanName}, SR=${cleanSr}`);
        return res.status(401).json({ message: 'Galat password hai. Please check karein.' });
      }
    } else {
      // Password field nahi diya = reject
      return res.status(401).json({ message: 'Password required for secure login.' });
    }

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

    // Student ka naam fetch karo notification ke liye
    const [studentRows] = await pool.query(
      `SELECT name, \`class\`, email FROM students WHERE id = ? LIMIT 1`,
      [student_id]
    );
    const studentName = studentRows[0]?.name || 'Student';
    const studentClass = studentRows[0]?.class || '';
    const studentEmail = studentRows[0]?.email || '';

    await pool.query(
      `INSERT INTO notifications (id, user_id, title, message, created_at)
       VALUES (UUID(), ?, 'New Marks Published', ?, NOW())`,
      [student_id, `Marks for ${subject} (${exam_type}) have been published.`]
    );

    // WhatsApp notification
    const waMarksMsg =
      `📊 *Marks Update - School Portal*\n\n` +
      `👤 *Student:* ${studentName}\n` +
      `🏫 *Class:* ${studentClass}\n` +
      `📖 *Subject:* ${subject}\n` +
      `📝 *Exam:* ${exam_type}\n` +
      `✅ *Marks:* ${marks}/${total_marks}\n` +
      `🏅 *Grade:* ${grade}\n\n` +
      `— School Portal`;
    sendWhatsAppNotification(waMarksMsg).catch(() => { });

    // Email notification (student email; fallback demo email)
    sendMarksEmailToStudent({
      email: studentEmail,
      studentName,
      classValue: studentClass,
      subject,
      exam_type,
      marks,
      total_marks,
      grade,
    }).catch(() => { });

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
    // Purana homework us subject + class ka delete karo (teacher ne update kiya)
    await pool.query(
      `DELETE FROM homework WHERE school_id = ? AND subject = ? AND \`class\` = ?`,
      [school_id, subject, classValue]
    );

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

    // WhatsApp notification parents ko bhejo (demo friendly)
    const waMessage =
      `📚 *School Homework Alert!*\n\n` +
      `📖 *Subject:* ${subject}\n` +
      `🏫 *Class:* ${classValue}\n` +
      `📝 *Homework:* ${description}\n` +
      `📅 *Due Date:* ${due_date}\n\n` +
      `Please ensure your child completes the homework on time.\n` +
      `— School Portal`;
    // Fire and forget - don't block response
    sendWhatsAppNotification(waMessage).catch(() => { });

    // Email notification (single configured parent email / demo)
    sendHomeworkEmailToStudents({
      schoolId: school_id,
      classValue,
      subject,
      description,
      due_date,
    }).catch(() => { });

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

    // Ensure students.email exists (non-breaking for older DBs)
    try {
      await pool.query(`ALTER TABLE students ADD COLUMN email VARCHAR(255) NULL`);
      console.log('Added students.email column');
    } catch (err) {
      // Ignore "Duplicate column" and similar
    }
  } catch (error) {
    console.warn('MySQL not connected:', error?.message ?? error);
    console.warn('Update .env with MYSQL_PASSWORD and run: npm run db:init');
  }
  // --- AUTO-CLEANUP JOB ---
  // The user requested that 'Today Class Test' marks automatically delete after 2 days.
  // This runs every 12 hours (43200000 ms) to clean up old class test marks.
  setInterval(async () => {
    try {
      const [result] = await pool.query(
        `DELETE FROM marks 
       WHERE exam_type = 'Today Class Test' 
       AND created_at < NOW() - INTERVAL 2 DAY`
      );
      if (result.affectedRows > 0) {
        console.log(`Auto-Cleanup: Deleted ${result.affectedRows} expired 'Today Class Test' records.`);
      }
    } catch (error) {
      console.error('Auto-Cleanup Error:', error);
    }
  }, 12 * 60 * 60 * 1000);

  // Start server
  app.listen(apiPort, () => {
    console.log(`API server running on http://localhost:${apiPort}`);
  });
}

start();
