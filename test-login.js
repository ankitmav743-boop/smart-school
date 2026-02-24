async function test() {
    const req = await fetch('http://localhost:4000/api/auth/teacher-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            teacherId: 'T101',
            schoolId: '08123456789',
            password: 'password123',
            subject: 'Mathematics' // Wrong! T101 is Computer Science.
        })
    });
    console.log('Status:', req.status);
    console.log('Response:', await req.json());
}
test();
