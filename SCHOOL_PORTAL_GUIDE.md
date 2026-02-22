# Smart School Parent Portal - User Guide

## Overview
This is a complete School Management Portal with three levels of authentication:
1. **School Login** - Principal verification
2. **Teacher Login** - Teacher dashboard for managing marks, homework, timetables
3. **Parent Login** - Parent dashboard to view student performance

## Features

### Teacher Panel
- Add and manage student marks with automatic grading (Weak/Average/Good)
- Create and assign homework to classes
- Manage exam timetables
- View student performance with color-coded indicators:
  - 🔴 Red = Weak (below 50%)
  - 🟡 Yellow = Average (50-74%)
  - 🟢 Green = Good (75% and above)

### Parent Panel
- View overall student performance with average scores
- See subject-wise performance breakdown
- Check all marks and exam results
- View assigned homework with due dates
- Access exam timetable

## Test Credentials

### School Login
- **Principal Name:** Dr. Rajesh Kumar
- **UDISE Code:** UDISE001

### Teacher Login (after school login)
- **Teacher ID:** T001
- **Name:** Priya Sharma
- **Subject:** Mathematics
- **Class:** 10th A

### Parent Login (after school login)
- **Student Name:** Rahul Singh
- **Class:** 10th A
- **SR Number:** SR001

## How to Use

1. **Start with School Login**
   - Enter principal name and UDISE code
   - This verifies which school you're accessing

2. **Select User Type**
   - Choose either "Teacher Login" or "Parent Login"

3. **Teacher Flow**
   - Login with teacher credentials
   - Use tabs to navigate between:
     - Add Marks
     - Homework Management
     - Exam Timetable
     - Student Performance

4. **Parent Flow**
   - Login with student credentials (SR Number)
   - View comprehensive student performance data
   - Check homework assignments
   - See upcoming exam schedule

## Database Structure

The system uses the following tables:
- `schools` - School information and principal details
- `teachers` - Teacher accounts and subjects
- `students` - Student information and SR numbers
- `marks` - All student marks with automatic grading
- `homework` - Homework assignments by class
- `exam_timetable` - Exam schedules
- `results` - Overall exam results

## Security Features

- Row Level Security (RLS) enabled on all tables
- Secure authentication flow
- School-level data isolation
- Protected routes and dashboards
