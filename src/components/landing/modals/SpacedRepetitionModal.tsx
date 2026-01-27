'use client';

import { X, TrendingUp, Clock, Brain } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SpacedRepetitionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SpacedRepetitionModal({ isOpen, onClose }: SpacedRepetitionModalProps) {
    const [animateGraph, setAnimateGraph] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setAnimateGraph(true), 300);
        } else {
            setAnimateGraph(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            ></div>

            <div className="bg-white dark:bg-[#1a1b1e] w-full max-w-2xl rounded-3xl shadow-2xl relative animate-slide-up z-10 border border-[var(--border-subtle)] flex flex-col max-h-[85vh] overflow-hidden">

                {/* Header */}
                <div className="p-8 border-b border-[var(--border-subtle)] flex items-center justify-between flex-shrink-0 bg-white/50 dark:bg-[#1a1b1e]/50 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-[var(--color-brand-blue)]">
                            <Brain className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-[var(--text-primary)]">The Science of Forgetting</h3>
                            <p className="text-sm text-[var(--text-secondary)]">Why you need spaced repetition</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-[var(--text-secondary)]"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Body - Completely Hidden Scrollbar */}
                <div className="p-8 overflow-y-auto no-scrollbar">
                    <style jsx global>{`
              .no-scrollbar::-webkit-scrollbar {
                  display: none;
              }
              .no-scrollbar {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
              }
            `}</style>

                    <p className="text-[var(--text-secondary)] mb-10 text-lg leading-relaxed font-light">
                        Without review, humans forget <strong className="text-[var(--text-primary)] font-semibold">50%</strong> of new information within 1 hour and <strong className="text-[var(--text-primary)] font-semibold">70%</strong> within 24 hours. This is the "Forgetting Curve".
                    </p>

                    {/* The Graph Visual */}
                    <div className="relative h-80 bg-gray-50 dark:bg-[#141517] rounded-3xl mb-8 border border-[var(--border-subtle)] overflow-hidden shadow-inner">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 pointer-events-none opacity-30">
                            {/* Horizontal Lines */}
                            <div className="absolute w-full h-px bg-gray-300 dark:bg-gray-700 top-[10%] left-0"></div>
                            <div className="absolute w-full h-px bg-gray-300 dark:bg-gray-700 top-[50%] left-0 border-t border-dashed border-gray-400 dark:border-gray-600"></div>
                            <div className="absolute w-full h-px bg-gray-300 dark:bg-gray-700 top-[90%] left-0"></div>

                            {/* Vertical Lines */}
                            <div className="absolute h-full w-px bg-gray-300 dark:bg-gray-700 left-[10%]"></div>
                            <div className="absolute h-full w-px bg-gray-300 dark:bg-gray-700 left-[36%] border-r border-dashed border-gray-400 dark:border-gray-600 opacity-50"></div>
                            <div className="absolute h-full w-px bg-gray-300 dark:bg-gray-700 left-[62%] border-r border-dashed border-gray-400 dark:border-gray-600 opacity-50"></div>
                        </div>

                        <div className="absolute top-3 left-14 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest z-20 bg-gray-50 dark:bg-[#141517] px-2 rounded">Memory Retention</div>

                        {/* Y-Axis Labels */}
                        <div className="absolute left-4 top-[10%] bottom-[10%] flex flex-col justify-between text-xs text-[var(--text-tertiary)] font-bold font-mono z-20 h-[80%]">
                            <span className="-translate-y-1/2">100%</span>
                            <span className="-translate-y-1/2">50%</span>
                            <span className="-translate-y-1/2">0%</span>
                        </div>

                        {/* Graph Area Container */}
                        <div className="absolute top-[10%] bottom-[10%] left-[10%] right-0">

                            {/* Curve 1: Typical Forgetting (Red) */}
                            <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                                <path
                                    d="M0,0 Q30,150 600,180"
                                    fill="none"
                                    stroke="var(--color-brand-red)"
                                    strokeWidth="3"
                                    strokeDasharray="6,6"
                                    className="opacity-40"
                                />
                                {animateGraph && (
                                    <circle cx="0" cy="0" r="4" fill="var(--color-brand-red)" className="animate-ping" style={{ offsetPath: 'path("M0,0 Q30,150 600,180")', animation: 'move 4s linear infinite', animationFillMode: 'forwards' }} />
                                )}
                            </svg>

                            {/* Curve 2: With StudyMate.io (Blue - Sawtooth) */}
                            <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="gradientBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="var(--color-brand-blue)" stopOpacity="0.5" />
                                        <stop offset="90%" stopColor="var(--color-brand-blue)" stopOpacity="0" />
                                    </linearGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                <path
                                    d="M0,0
                                C20,40 50,80 160,120
                                L160,10
                                C200,30 250,50 320,80
                                L320,5
                                C380,15 450,25 600,35
                                L600,200 L0,200 Z"
                                    fill="url(#gradientBlue)"
                                    className={`transition-opacity duration-1000 delay-500 ${animateGraph ? 'opacity-100' : 'opacity-0'}`}
                                />

                                <path
                                    d="M0,0
                                C20,40 50,80 160,120
                                L160,10
                                C200,30 250,50 320,80
                                L320,5
                                C380,15 450,25 600,35"
                                    fill="none"
                                    stroke="var(--color-brand-blue)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    filter="url(#glow)"
                                    className={`transition-all duration-[2500ms] ease-out ${animateGraph ? 'opacity-100 stroke-dash-0' : 'opacity-0 stroke-dash-1000'}`}
                                    style={{ strokeDasharray: 1500, strokeDashoffset: animateGraph ? 0 : 1500 }}
                                />
                            </svg>

                            {/* Review Points Labels */}
                            <div className={`absolute bottom-[28%] left-[26.6%] -translate-x-1/2 transition-all delay-700 duration-700 ${animateGraph ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                                <div className="bg-[#1a1b1e] dark:bg-[#303134] text-white px-3 py-1.5 rounded-lg shadow-xl border border-blue-500/30 flex items-center gap-2 z-30">
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                    </span>
                                    <span className="text-[11px] font-bold tracking-wide">REVIEW 1</span>
                                </div>
                            </div>

                            <div className={`absolute bottom-[48%] left-[53.3%] -translate-x-1/2 transition-all delay-1000 duration-700 ${animateGraph ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                                <div className="bg-[#1a1b1e] dark:bg-[#303134] text-white px-3 py-1.5 rounded-lg shadow-xl border border-blue-500/30 flex items-center gap-2 z-30">
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                    </span>
                                    <span className="text-[11px] font-bold tracking-wide">REVIEW 2</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl p-6 flex gap-5 items-start border border-blue-100 dark:border-blue-500/10">
                        <div className="mt-1 bg-white dark:bg-blue-500/20 p-2 rounded-xl shadow-sm text-[var(--color-brand-blue)]">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-[var(--text-primary)] text-base mb-2">StudyMate.io solves this.</h4>
                            <p className="text-[var(--text-secondary)] leading-relaxed">We track every quiz answer. Just before you're about to forget a concept, our AI schedules a rapid review session. This flattens the curve into near-permanent memory.</p>
                        </div>
                    </div>
                </div>

                {/* Footer actions */}
                <div className="p-8 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] flex justify-end flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="btn-app btn-primary h-12 px-8 text-base font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto"
                    >
                        Start Learning Now
                    </button>
                </div>

            </div>
        </div>
    );
}
