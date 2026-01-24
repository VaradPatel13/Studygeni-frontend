import Link from 'next/link';
import { ArrowRight, FileText, Zap, Brain } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StudyGeni - AI-Powered Study Tools for Students',
  description: 'Turn your lecture nodes and PDFs into interactive flashcards, quizzes, and study guides instantly with AI. The ultimate study companion for university students.',
  keywords: ['AI study tool', 'flashcard generator', 'pdf to quiz', 'student productivity', 'spaced repetition', 'exam prep'],
  openGraph: {
    title: 'StudyGeni - AI-Powered Study Tools',
    description: 'Stop passively reading. Start actively recalling. We turn your boring PDFs into interactive study engines.',
    type: 'website',
    locale: 'en_US',
    url: 'https://studygeni.com',
    siteName: 'StudyGeni',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudyGeni - Study Smarter, Not Harder',
    description: 'Generate flashcards and quizzes from your notes instantly.',
    creator: '@studygeni',
  },
  alternates: {
    canonical: 'https://studygeni.com',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="margin-line" />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#fdfbf7]/90 backdrop-blur-sm border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black flex items-center justify-center text-white font-bold mono">SG</div>
            <span className="font-bold text-xl tracking-tight">StudyGeni_</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="font-bold underline decoration-2 underline-offset-4 hover:decoration-blue-500">Log in</Link>
            <Link href="/register" className="bg-black text-white px-4 py-2 font-bold hover:bg-blue-600 transition-colors">Start Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 md:pl-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block bg-yellow-300 border-2 border-black px-3 py-1 font-bold text-xs md:text-sm mb-4 md:mb-6 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              v2.0 // NOW LIVE
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black mb-6 leading-[0.9] tracking-tighter">
              LEARN<br />
              FASTER.<br />
              <span className="text-blue-600">RETAIN<br />MORE.</span>
            </h1>
            <p className="text-xl font-medium mb-8 max-w-md bg-white border-l-4 border-black p-4">
              Stop passively reading. Start actively recalling.
              We turn your boring PDFs into interactive study engines.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="brutal-border bg-black text-white px-8 py-4 font-bold text-lg flex items-center gap-2 hover:bg-neutral-800">
                Upload Document <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#demo" className="brutal-border bg-white text-black px-8 py-4 font-bold text-lg hover:bg-gray-50">
                See Demo
              </Link>
            </div>
          </div>

          {/* Graphic */}
          <div className="relative">
            <div className="brutal-card shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-white rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-center">
                <span className="font-bold mono">FLASHCARD_DECK_01</span>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full border border-black bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full border border-black bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full border border-black bg-green-400"></div>
                </div>
              </div>

              <div className="bg-gray-100 border-2 border-black p-8 text-center min-h-[300px] flex flex-col justify-center items-center relative overflow-hidden group">
                <span className="mono text-gray-500 mb-4 text-xs">QUESTION / FRONT</span>
                <h3 className="text-2xl font-bold mb-8">What is 'Spaced Repetition'?</h3>

                <div className="absolute inset-0 bg-blue-600 flex flex-col justify-center items-center text-white p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                  <span className="mono text-blue-200 mb-4 text-xs">ANSWER / BACK</span>
                  <p className="text-xl font-bold">A learning technique that incorporates increasing intervals of time between subsequent review of previously learned material.</p>
                </div>

                <div className="absolute bottom-4 text-xs font-bold bg-black text-white px-2 py-1">HOVER TO FLIP</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Ticker */}
      <div className="border-y-2 border-black bg-yellow-300 py-3 overflow-hidden">
        <div className="flex gap-8 whitespace-nowrap font-bold text-xl mono animate-marquee">
          <span>/// AI GENERATED QUIZZES /// INSTANT SUMMARIES /// CHAT WITH PDFS /// SPACED REPETITION /// EXPORT TO ANKI</span>
          <span>/// AI GENERATED QUIZZES /// INSTANT SUMMARIES /// CHAT WITH PDFS /// SPACED REPETITION /// EXPORT TO ANKI</span>
        </div>
      </div>

      {/* Grid Section */}
      <section className="py-24 px-6 md:pl-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-black mb-16 underline decoration-4 decoration-blue-600 underline-offset-4">TOOLS_</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="AUTO_FLASHCARDS"
              icon={<Zap className="w-8 h-8" />}
              desc="Don't waste time making cards. We extract key terms and definitions instantly."
            />
            <FeatureCard
              title="SMART_QUIZZES"
              icon={<Brain className="w-8 h-8" />}
              desc="Test your knowledge. Our AI generates multiple choice & open-ended questions."
            />
            <FeatureCard
              title="DOC_CHAT"
              icon={<FileText className="w-8 h-8" />}
              desc="Have a conversation with your textbook. Ask specific questions, get cited answers."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 md:pl-20 border-t-2 border-black bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/3">
              <h2 className="text-5xl font-black mb-6">WORK<br />FLOW_</h2>
              <p className="text-lg font-medium">Simple 3-step process to mastery.</p>
            </div>

            <div className="md:w-2/3 space-y-8">
              <div className="flex gap-6 items-start">
                <span className="text-6xl font-black text-gray-200">01</span>
                <div>
                  <h3 className="text-2xl font-bold bg-black text-white inline-block px-2 mb-2">UPLOAD</h3>
                  <p className="text-lg">Drag & drop your lecture slides (PDF/PPT) or paste your notes directly.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <span className="text-6xl font-black text-gray-200">02</span>
                <div>
                  <h3 className="text-2xl font-bold bg-blue-600 text-white inline-block px-2 mb-2">PROCESS</h3>
                  <p className="text-lg">Our system analyzes the text, identifying concepts, dates, and relationships.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <span className="text-6xl font-black text-gray-200">03</span>
                <div>
                  <h3 className="text-2xl font-bold bg-yellow-400 text-black border border-black inline-block px-2 mb-2">STUDY</h3>
                  <p className="text-lg">Review your generated deck. Swipe right if you know it, left if you don't.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:pl-20 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center border-2 border-white p-12 relative">
          <div className="absolute -top-3 -left-3 bg-blue-600 text-white px-2 font-bold mono">READY?</div>

          <h2 className="text-4xl md:text-6xl font-black mb-8">
            STOP FAILING.<br />START STUDYING.
          </h2>
          <Link href="/register" className="inline-block bg-white text-black text-xl font-bold px-12 py-4 hover:bg-blue-600 hover:text-white transition-colors brutal-border shadow-none border-0">
            CREATE FREE ACCOUNT
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:pl-20 border-t-2 border-black bg-gray-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="font-bold text-2xl mono mb-4">SG_</div>
            <p className="max-w-xs font-medium text-sm">
              built for students who hate studying.<br />
              (c) 2026 StudyGeni Inc.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12 font-bold mono text-sm">
            <div className="flex flex-col gap-2">
              <a href="#" className="hover:text-blue-600">GITHUB</a>
              <a href="#" className="hover:text-blue-600">TWITTER</a>
              <a href="#" className="hover:text-blue-600">DISCORD</a>
            </div>
            <div className="flex flex-col gap-2">
              <a href="#" className="hover:text-blue-600">TERMS</a>
              <a href="#" className="hover:text-blue-600">PRIVACY</a>
              <a href="#" className="hover:text-blue-600">CONTACT</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, icon, desc }: { title: string, icon: React.ReactNode, desc: string }) {
  return (
    <div className="brutal-card group hover:bg-black hover:text-white transition-colors cursor-default">
      <div className="mb-4 text-black group-hover:text-yellow-300 transition-colors">{icon}</div>
      <h3 className="font-bold text-xl mono mb-2">{title}</h3>
      <p className="font-medium opacity-80">{desc}</p>
    </div>
  );
}
