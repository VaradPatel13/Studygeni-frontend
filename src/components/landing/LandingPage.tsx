'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap, Brain, MessageSquare, Star, Upload, FileText, CheckCircle2, GraduationCap, Clock, Users, ChevronRight, PlayCircle } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import SpacedRepetitionModal from '@/components/landing/modals/SpacedRepetitionModal';


export default function LandingPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { theme } = useTheme(); // Assuming you might use theme for conditional animations later, but mostly styles update automatically.

    // Animation Variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 10 }
        }
    };

    const fadeUpVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const scaleVariants: Variants = {
        hidden: { scale: 0.9, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { duration: 0.5, ease: "backOut" }
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg-page)] font-sans transition-colors duration-300 overflow-x-hidden">

            <Navbar />
            <SpacedRepetitionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            <main className="pt-32 pb-24 flex-grow">

                <motion.section
                    className="app-container text-center mb-24 lg:mb-32 relative"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    {/* Hero Background Gradients */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-brand-blue)]/5 rounded-full blur-[100px] -z-10 pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--color-brand-yellow)]/5 rounded-full blur-[80px] -z-10 pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-brand-red)]/5 rounded-full blur-[80px] -z-10 pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>

                    <motion.h1
                        className="app-title text-5xl md:text-7xl mb-6 max-w-5xl mx-auto leading-[1.1] tracking-tight text-[var(--text-primary)]"
                        variants={itemVariants}
                    >
                        Turn your messy notes into <br className="hidden md:block" />
                        <span className="text-gradient-brand">top grades instantly.</span>
                    </motion.h1>

                    <motion.p
                        className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed"
                        variants={itemVariants}
                    >
                        Upload PDFs, Images or videos. StudyMate.io generates quizzes, flashcards, <br className="hidden lg:block" />
                        and summaries to help you study smarter, not harder.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        variants={itemVariants}
                    >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link href="/register" className="btn-app btn-primary h-14 text-lg px-8 w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all">
                                Start Studying for Free
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link href="#demo" className="btn-app btn-outline h-14 text-lg px-8 w-full sm:w-auto flex items-center gap-2">
                                <PlayCircle className="w-5 h-5" />
                                Watch Demo
                            </Link>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="mt-8 flex items-center justify-center gap-6 text-sm text-[var(--text-tertiary)]"
                        variants={itemVariants}
                    >
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[var(--color-brand-green)]" /> No credit card required</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[var(--color-brand-green)]" /> Cancel anytime</span>
                    </motion.div>
                </motion.section>


                {/* --- How It Works --- */}
                <section id="how-it-works" className="app-container mb-32">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeUpVariants}
                    >
                        <h2 className="text-3xl md:text-4xl font-medium text-[var(--text-primary)] mb-4">Master any subject in 3 steps</h2>
                        <p className="text-[var(--text-secondary)] text-lg">Stop highlighting everything. Let AI structure your learning.</p>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-3 gap-8"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={containerVariants}
                    >
                        {[
                            { title: 'Upload Content', desc: 'Drag & drop PDFs, paste text, or link YouTube videos.', icon: Upload, color: 'text-[var(--color-brand-blue)]', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                            { title: 'AI Processing', desc: 'Our models extract key concepts, dates, and definitions in seconds.', icon: Brain, color: 'text-[var(--color-brand-red)]', bg: 'bg-red-50 dark:bg-red-500/10' },
                            { title: 'Active Recall', desc: 'Test yourself with generated quizzes and spaced-repetition cards.', icon: Zap, color: 'text-[var(--color-brand-yellow)]', bg: 'bg-yellow-50 dark:bg-yellow-500/10' }
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                className="app-card relative flex flex-col items-center text-center group bg-white dark:bg-[#141517] dark:border-[#2C2E33] hover:border-[var(--color-brand-blue)]/50 transition-all duration-300 p-8"
                                variants={itemVariants}
                                whileHover={{ y: -8, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
                            >
                                <div className={`w-16 h-16 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center mb-6 text-xl font-bold shadow-sm transition-transform group-hover:scale-110 border border-transparent dark:border-white/5`}>
                                    <step.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-medium text-[var(--text-primary)] mb-3">{step.title}</h3>
                                <p className="text-[var(--text-secondary)] leading-relaxed text-sm">{step.desc}</p>


                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* --- Key Features (Bento Grid) --- */}
                <section className="app-container mb-32">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-medium text-[var(--text-primary)] mb-4">Everything you need to ace the exam</h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">

                        {/* Feature 1: AI Recall */}
                        <motion.div
                            className="app-card col-span-1 md:col-span-6 lg:col-span-8 bg-[#F8F9FA] dark:bg-[#303134] overflow-hidden relative group"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={scaleVariants}
                        >
                            <div className="flex flex-col md:flex-row h-full">
                                <div className="flex-1 z-10 p-8">
                                    <div className="w-12 h-12 rounded-full bg-white dark:bg-[#3C4043] flex items-center justify-center text-[var(--color-brand-blue)] mb-6 shadow-sm">
                                        <Brain className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-medium mb-2 text-[var(--text-primary)]">AI Recall System</h3>
                                    <p className="text-[var(--text-secondary)] mb-6 max-w-sm">Forget forgetting. Our algorithm schedules reviews exactly when you're about to forget, boosting long-term retention by 300%.</p>
                                    <div
                                        onClick={() => setIsModalOpen(true)}
                                        className="text-sm font-medium text-[var(--color-brand-blue)] group-hover:underline cursor-pointer flex items-center gap-1"
                                    >
                                        Learn about Spaced Repetition <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                                {/* Visual */}
                                <div className="flex-1 relative min-h-[200px] md:min-h-0">
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#F8F9FA] dark:from-[#303134] to-transparent z-10 w-20"></div>
                                    <motion.div
                                        className="absolute right-0 top-8 w-[90%] bg-white dark:bg-[#202124] rounded-tl-2xl shadow-lg border border-[var(--border-subtle)] p-6 space-y-4"
                                        initial={{ x: 50, opacity: 0 }}
                                        whileInView={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.3, duration: 0.6 }}
                                        viewport={{ once: true }}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase">Next Review</span>
                                            <span className="text-xs font-bold text-[var(--color-brand-green)] bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">Due Now</span>
                                        </div>
                                        <div className="text-lg font-medium text-[var(--text-primary)]">What is the mitochondria's primary function?</div>
                                        <div className="h-2 w-full bg-[var(--bg-surface-highlight)] rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-[var(--color-brand-blue)]"
                                                initial={{ width: "0%" }}
                                                whileInView={{ width: "75%" }}
                                                transition={{ delay: 0.6, duration: 1 }}
                                                viewport={{ once: true }}
                                            ></motion.div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Feature 2: Chat */}
                        <motion.div
                            className="app-card col-span-1 md:col-span-6 lg:col-span-4 bg-[#E8F0FE] dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20 flex flex-col justify-between p-6"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={scaleVariants}
                            transition={{ delay: 0.1 }}
                        >
                            <div>
                                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#3C4043] flex items-center justify-center text-[var(--color-brand-blue)] mb-6 shadow-sm">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-medium mb-2 text-[var(--text-primary)]">Chat with Data</h3>
                                <p className="text-[var(--text-secondary)]">Ask "What were the key themes in Chapter 4?" and get instant answers with citations.</p>
                            </div>
                        </motion.div>

                        {/* Feature 3: Quizzes */}
                        <motion.div
                            className="app-card col-span-1 md:col-span-4 lg:col-span-4 p-6"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={scaleVariants}
                            transition={{ delay: 0.2 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 mb-6">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-medium mb-2 text-[var(--text-primary)]">Instant Quizzes</h3>
                            <p className="text-[var(--text-secondary)]">Turn a 50-page PDF into a comprehensive quiz in under 30 seconds.</p>
                        </motion.div>

                        {/* Feature 4: Summary */}
                        <motion.div
                            className="app-card col-span-1 md:col-span-4 lg:col-span-4 p-6"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={scaleVariants}
                            transition={{ delay: 0.3 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 mb-6">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-medium mb-2 text-[var(--text-primary)]">Smart Summaries</h3>
                            <p className="text-[var(--text-secondary)]">Get concise bullet points of hour-long lectures. Audio transcription included.</p>
                        </motion.div>

                        {/* Feature 5: Progress */}
                        <motion.div
                            className="app-card col-span-1 md:col-span-4 lg:col-span-4 flex flex-col justify-between p-6"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={scaleVariants}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="w-12 h-12 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 mb-6">
                                <Star className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-medium mb-2 text-[var(--text-primary)]">Track Progress</h3>
                            <p className="text-[var(--text-secondary)] mb-4">Visualize your knowledge retention over time.</p>
                            <div className="mt-auto">
                                <div className="flex gap-2 h-32 items-end justify-center px-4">
                                    <motion.div className="w-full bg-gray-100 dark:bg-white/10 rounded-t-lg" initial={{ height: "0%" }} whileInView={{ height: "40%" }} transition={{ duration: 1 }} viewport={{ once: true }}></motion.div>
                                    <motion.div className="w-full bg-gray-200 dark:bg-white/20 rounded-t-lg" initial={{ height: "0%" }} whileInView={{ height: "60%" }} transition={{ duration: 1, delay: 0.1 }} viewport={{ once: true }}></motion.div>
                                    <motion.div className="w-full bg-[var(--color-brand-blue)] rounded-t-lg relative shadow-md" initial={{ height: "0%" }} whileInView={{ height: "85%" }} transition={{ duration: 1, delay: 0.2 }} viewport={{ once: true }}>
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-[var(--color-brand-blue)] bg-white border border-blue-100 dark:border-none px-2 py-1 rounded-md shadow-sm">A+</div>
                                    </motion.div>
                                    <motion.div className="w-full bg-gray-100 dark:bg-white/10 rounded-t-lg" initial={{ height: "0%" }} whileInView={{ height: "50%" }} transition={{ duration: 1, delay: 0.3 }} viewport={{ once: true }}></motion.div>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </section>

                {/* --- Use Cases --- */}
                <section className="bg-[var(--bg-surface-highlight)] py-24 mb-24">
                    <div className="app-container">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-medium text-[var(--text-primary)] mb-4">Who uses StudyMate.io?</h2>
                        </motion.div>

                        <div className="grid md:grid-cols-4 gap-6">
                            {[
                                { title: 'College Students', icon: GraduationCap, desc: 'Ace finals with less stress.' },
                                { title: 'Medical Students', icon: Clock, desc: 'Memorize terms faster.' },
                                { title: 'Visual Learners', icon: Users, desc: 'Learn from Youtube summaries.' },
                                { title: 'Teachers', icon: Brain, desc: 'Create lesson quizzes instantly.' }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    className="bg-[var(--bg-page)] p-8 rounded-2xl border border-[var(--border-subtle)] hover:shadow-md transition-all text-center"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <item.icon className="w-10 h-10 mx-auto mb-4 text-[var(--text-secondary)]" />
                                    <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">{item.title}</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- Final CTA --- */}
                <section className="py-32 bg-[#202124] text-white relative overflow-hidden">
                    {/* Abstract Background - Enhanced Contrast for dark BG */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-brand-blue)] rounded-full blur-[120px] opacity-30 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-brand-red)] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

                    <motion.div
                        className="app-container text-center relative z-10"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUpVariants}
                    >
                        <h2 className="text-4xl md:text-5xl font-medium mb-8 leading-tight text-white">Stop drowning in notes. <br /> Start studying smarter.</h2>
                        <div className="max-w-xl mx-auto mb-10 text-gray-300 text-lg">
                            Join the AI revolution in education. Your grades are waiting.
                        </div>
                        <motion.div
                            className="flex flex-col sm:flex-row justify-center gap-4"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Link href="/register" className="btn-app bg-white text-[#202124] hover:bg-gray-100 h-14 px-10 text-lg font-bold shadow-xl">
                                Get Started for Free
                            </Link>
                        </motion.div>
                    </motion.div>
                </section>

            </main>

            <footer className="border-t border-[var(--border-subtle)] py-16 bg-[var(--bg-surface)]">
                <div className="app-container">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1">
                            <div className="flex items-center gap-3 mb-4">
                                <Image src="/logo.png" alt="StudyMate Logo" width={32} height={32} className="w-8 h-8" />
                                <span className="app-title text-xl text-[var(--text-primary)]">StudyMate.io</span>
                            </div>
                            <p className="text-[var(--text-secondary)] text-sm">Making learning intelligent, accessible, and efficient for everyone.</p>
                        </div>

                        <div>
                            <h4 className="font-bold text-[var(--text-primary)] mb-4">Product</h4>
                            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                                <li><a href="#" className="hover:text-[var(--color-brand-blue)]">Features</a></li>
                                <li><a href="#" className="hover:text-[var(--color-brand-blue)]">Pricing</a></li>
                                <li><a href="#" className="hover:text-[var(--color-brand-blue)]">For Schools</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-[var(--text-primary)] mb-4">Resources</h4>
                            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                                <li><a href="#" className="hover:text-[var(--color-brand-blue)]">Study Tips Blog</a></li>
                                <li><a href="#" className="hover:text-[var(--color-brand-blue)]">Help Center</a></li>
                                <li><a href="#" className="hover:text-[var(--color-brand-blue)]">Community</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-[var(--text-primary)] mb-4">Legal</h4>
                            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                                <li><a href="#" className="hover:text-[var(--color-brand-blue)]">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-[var(--color-brand-blue)]">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-[var(--border-subtle)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[var(--text-tertiary)]">
                        <p>© 2026 StudyMate.io Inc. All rights reserved.</p>
                        <div className="flex gap-4">
                            <span>Designed with ❤️ in San Francisco</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
