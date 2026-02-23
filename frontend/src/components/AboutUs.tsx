import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Code2, MapPin, Heart, Sparkles, BookOpen } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
    const words = text.split(" ");
    return (
        <motion.div className="inline-block">
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    className="inline-block mr-2"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                        duration: 0.5,
                        delay: delay + i * 0.1,
                        ease: [0.2, 0.65, 0.3, 0.9],
                    }}
                >
                    {word}
                </motion.span>
            ))}
        </motion.div>
    );
};

const TiltCard = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate rotation (-10 to 10 degrees)
        const rX = ((mouseY / height) - 0.5) * -20;
        const rY = ((mouseX / width) - 0.5) * 20;

        setRotateX(rX);
        setRotateY(rY);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: 1000,
                transformStyle: "preserve-3d",
            }}
            className={`relative w-full ${className}`}
        >
            <motion.div
                animate={{ rotateX, rotateY }}
                transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.5 }}
                className="w-full h-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-white/[0.06] hover:border-cyan-500/40 relative overflow-hidden group"
            >
                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent pointer-events-none transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]" style={{ transition: "transform 1s ease, opacity 0.5s ease" }} />
                {children}
            </motion.div>
        </motion.div>
    );
};

export function AboutUs({ onBack }: { onBack: () => void }) {
    const { scrollYProgress } = useScroll();
    const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY,
            });
        };
        window.addEventListener("mousemove", handleGlobalMouseMove);
        return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
    }, []);

    return (
        <div className="min-h-screen bg-[#050914] text-white relative overflow-hidden font-sans selection:bg-cyan-500/30">

            {/* Liquid / Ambient Background Motion */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Interactive Mouse Blob */}
                <motion.div
                    className="absolute w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[100px] opacity-20 bg-gradient-to-r from-cyan-600 to-blue-600"
                    animate={{
                        x: mousePosition.x - 300,
                        y: mousePosition.y - 300,
                    }}
                    transition={{ type: "tween", ease: "backOut", duration: 1.5 }}
                />

                {/* Parallax Background Orbs */}
                <motion.div style={{ y: yBg }} className="absolute inset-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[150px] mix-blend-screen animate-pulse duration-[10000ms]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[150px] mix-blend-screen animate-pulse duration-[8000ms] delay-700" />
                </motion.div>

                {/* Topographic / Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,black_10%,transparent_80%)]" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full">
                {/* Navbar */}
                <div className="fixed top-0 left-0 w-full p-6 z-50 mix-blend-difference">
                    <button
                        onClick={onBack}
                        className="group flex items-center gap-2 text-white/70 hover:text-white transition-all duration-300 hover:-translate-x-2 font-medium"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </button>
                </div>

                {/* Hero Section */}
                <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="text-center relative"
                    >
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="text-cyan-400 font-mono tracking-widest text-sm md:text-base mb-4 uppercase flex items-center justify-center gap-2"
                        >
                            <Code2 className="w-4 h-4" /> About the Developer
                        </motion.h2>

                        {/* Split Text Reveal */}
                        <div className="overflow-hidden">
                            <motion.h1
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                                className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/20 pb-4"
                            >
                                ANKIT
                            </motion.h1>
                        </div>
                        <div className="overflow-hidden">
                            <motion.h1
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                                className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-blue-600 pb-4 drop-shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                            >
                                KUMAR
                            </motion.h1>
                        </div>

                        {/* Scroll Indicator */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5, duration: 1 }}
                            className="absolute -bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
                        >
                            <span className="text-xs tracking-widest uppercase font-mono">Scroll</span>
                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent"
                            />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Content Sections */}
                <div className="max-w-5xl mx-auto px-4 pb-32 space-y-20 md:space-y-32">

                    {/* Section 1: Personal Info Grid */}
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        <TiltCard delay={0.2} className="md:sticky md:top-32">
                            <h3 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white inline-block">Personal Data</h3>
                            <div className="space-y-6">
                                <div className="group/item">
                                    <p className="text-sm text-cyan-500/80 font-mono tracking-wider uppercase mb-1">Age</p>
                                    <p className="text-2xl font-medium text-white/90 group-hover/item:text-white transition-colors">15 years old</p>
                                </div>
                                <div className="group/item">
                                    <p className="text-sm text-cyan-500/80 font-mono tracking-wider uppercase mb-1">Father's Name</p>
                                    <p className="text-xl font-medium text-white/90 group-hover/item:text-white transition-colors">OMPRAKASH MEGHWAL</p>
                                </div>
                                <div className="group/item">
                                    <p className="text-sm text-cyan-500/80 font-mono tracking-wider uppercase mb-1">Mother's Name</p>
                                    <p className="text-xl font-medium text-white/90 group-hover/item:text-white transition-colors">SAVITRI DEVI</p>
                                </div>
                                <div className="group/item pt-4 border-t border-white/5 mt-4">
                                    <p className="text-sm text-cyan-500/80 font-mono tracking-wider uppercase mb-2 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> Location
                                    </p>
                                    <p className="text-xl font-medium text-white/90">KADIYA RATANGRH(CHURU) RAJASTHAN</p>
                                </div>
                            </div>
                        </TiltCard>

                        <div className="space-y-8">
                            <TiltCard delay={0.4}>
                                <h3 className="text-2xl font-bold mb-4 text-white/90 flex items-center gap-3">
                                    <BookOpen className="w-6 h-6 text-cyan-400" /> Education
                                </h3>
                                <p className="text-lg text-white/70 leading-relaxed font-light">
                                    <TypewriterText text="Currently studying at Govt. S. S. School Kadiya, Churu, Rajasthan in class 11th. Alongside school, learning Web Development through CodeYogi to build real-world technical skills and prepare for a future in technology." />
                                </p>
                            </TiltCard>

                            <TiltCard delay={0.6}>
                                <h3 className="text-2xl font-bold mb-4 text-white/90 flex items-center gap-3">
                                    <Heart className="w-6 h-6 text-pink-400" /> Interests
                                </h3>
                                <p className="text-lg text-white/70 leading-relaxed font-light">
                                    I have been passionate about technology since childhood, especially the design side of it. I love crafting beautiful user interfaces and bringing ideas to life on the web. Outside of coding, I enjoy playing football and exploring how new technologies like 3D Printing work. Building this School Management Portal gave me hands-on experience of how real-world full-stack applications are built from scratch.
                                </p>
                            </TiltCard>
                        </div>
                    </div>

                    {/* Section 2: Hobbies & Journey */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <TiltCard delay={0.1}>
                            <h3 className="text-2xl font-bold mb-6 text-white/90 flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-yellow-400" /> Hobbies & Dreams
                            </h3>
                            <ul className="space-y-4">
                                {['Coding', 'Learning about new technology', '3D Printing', 'Football player'].map((hobby, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + (i * 0.1) }}
                                        className="flex items-center gap-3 text-lg text-white/80"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> {hobby}
                                    </motion.li>
                                ))}
                            </ul>
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.8 }}
                                className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
                            >
                                <p className="text-cyan-100 font-medium italic">
                                    "I dream of traveling the world with my first salary with my parents."
                                </p>
                            </motion.div>
                        </TiltCard>

                        <TiltCard delay={0.3}>
                            <h3 className="text-2xl font-bold mb-6 text-white/90">Journey to Coding</h3>
                            <div className="prose prose-invert">
                                <p className="text-lg text-white/70 leading-relaxed font-light">
                                    I came to know about <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-bold">CodeYogi</span> through my school, Govt. s. s. school kadiya.
                                </p>
                                <p className="text-lg text-white/70 leading-relaxed font-light mt-4">
                                    Thanks to CodeYogi, I am gaining confidence in coding and building a strong foundation for my future in technology.
                                </p>
                                <p className="text-lg text-white/70 leading-relaxed font-light mt-4">
                                    Is project mein maine ek <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-bold">AI Study Assistant</span> bhi banaya hai jo Gemini AI se powered hai. Yeh assistant har student ki marks aur performance dekh kar unhe personalized study tips aur guidance deta hai — bilkul ek private tutor ki tarah, lekin digital!
                                </p>
                            </div>
                        </TiltCard>
                    </div>

                    {/* Section 3: Project Overview */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <TiltCard className="w-full">
                            <div className="relative z-10">
                                <h3 className="text-4xl md:text-5xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">Project Overview</h3>
                                <div className="grid md:grid-cols-2 gap-12">
                                    <div className="space-y-6 text-lg text-white/70 font-light leading-relaxed">
                                        <p>
                                            This project is a <strong className="text-white">School Management Portal</strong> — a full-stack web application built to digitize and simplify school operations.
                                        </p>
                                        <p>
                                            The portal provides dedicated dashboards for <strong className="text-white">Students, Parents, Teachers</strong>, and the <strong className="text-white">Principal</strong>. Students can view their marks, homework, and exam timetables. Teachers can manage their class data. Parents can track their child's academic performance in real-time. The Principal gets a school-wide analytics overview.
                                        </p>
                                        <p>
                                            It also includes an <strong className="text-white">AI Study Assistant</strong> powered by Gemini AI, which provides personalized study guidance based on each student's performance.
                                        </p>
                                    </div>
                                    <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5 h-fit">
                                        <p className="text-sm font-mono text-cyan-400 mb-4 uppercase tracking-widest">Tech Stack</p>
                                        <div className="flex flex-wrap gap-3">
                                            {['React', 'TypeScript', 'Node.js', 'Express', 'MySQL', 'Tailwind CSS', 'Framer Motion', 'Gemini AI'].map((tech) => (
                                                <span key={tech} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/90 font-medium">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="mt-6 text-white/50 text-sm italic">
                                            This project taught me how to build a complete, real-world application — from database design to a beautiful, responsive UI.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TiltCard>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
