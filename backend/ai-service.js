import { GoogleGenerativeAI } from '@google/generative-ai';

export async function getStudyAdvice(studentName, marksData) {
    // Extracting marks summary for the prompt
    const marksSummary = marksData.map(m => `${m.subject}: ${m.marks}/${m.total_marks} (${m.grade})`).join(', ');

    const prompt = `You are an AI Study Assistant for a school portal. Based on the following recent marks for student ${studentName}, provide a very short, encouraging, and specific piece of advice (max 3 sentences).
Marks: ${marksSummary}
Advice:`;

    // Fallback if no API key is provided
    if (!process.env.GEMINI_API_KEY) {
        console.log('No GEMINI_API_KEY found. Using simulated AI response.');

        // Simple simulated advice if no key
        const lowSubjects = marksData.filter(m => (m.marks / m.total_marks) < 0.5).map(m => m.subject);

        if (lowSubjects.length > 0) {
            return `Hello ${studentName}! I noticed you're struggling a bit with ${lowSubjects.join(' and ')}. Focus on practicing those areas and don't hesitate to ask your teachers for help! Keep pushing!`;
        } else {
            return `Great job, ${studentName}! Your recent scores look solid. Keep maintaining this consistent effort and you'll do wonders!`;
        }
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error with Gemini API:', error);
        return `Hi ${studentName}! Keep up the hard work. Review your recent tests to see where you can improve next time!`;
    }
}
