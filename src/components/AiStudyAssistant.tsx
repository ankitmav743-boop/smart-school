import { useState } from 'react';
import { Bot, Sparkles, Loader2 } from 'lucide-react';
import { getAiStudyAdvice } from '../lib/api';

type AiStudyAssistantProps = {
    studentId: string;
    studentName: string;
};

export function AiStudyAssistant({ studentId, studentName }: AiStudyAssistantProps) {
    const [advice, setAdvice] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGetAdvice = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getAiStudyAdvice({ studentId, studentName });
            setAdvice(res.advice);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Could not fetch advice. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 opacity-50 z-0 pointer-events-none"></div>

            <div className="relative z-10 p-8 flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-full shadow-lg mb-6 relative group transform transition-all duration-300 hover:scale-110">
                    <Bot className="w-12 h-12 text-white" />
                    <div className="absolute -top-1 -right-1 bg-yellow-400 p-1 rounded-full animate-bounce">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                </div>

                <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-3">
                    AI Study Advisor
                </h2>

                <p className="text-gray-600 mb-8 max-w-md text-lg">
                    Hello! I am your AI-powered mentor. I can analyze {studentName}'s recent grades and provide personalized, actionable study tips!
                </p>

                {!advice && !loading && (
                    <button
                        onClick={handleGetAdvice}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full font-bold shadow-lg shadow-purple-500/30 transform transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3 text-lg"
                    >
                        <Sparkles className="w-6 h-6" />
                        Analyze & Give Advice
                    </button>
                )}

                {loading && (
                    <div className="flex flex-col items-center gap-4 text-purple-600 my-4">
                        <Loader2 className="w-12 h-12 animate-spin" />
                        <p className="font-semibold text-lg animate-pulse">Analyzing {studentName}'s performance...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl font-medium border border-red-200 mt-4 max-w-md w-full">
                        {error}
                    </div>
                )}

                {advice && !loading && (
                    <div className="mt-4 text-left w-full max-w-2xl animate-fade-in-up">
                        <div className="bg-white border-2 border-purple-100 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
                            <div className="absolute -top-4 -left-4 bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-full shadow-md">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-gray-800 text-lg leading-relaxed font-semibold">
                                "{advice}"
                            </p>
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleGetAdvice}
                                    className="text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-5 py-2.5 rounded-full transition-colors flex items-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Get fresh advice
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
