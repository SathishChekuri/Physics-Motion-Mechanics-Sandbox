import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { isSupabaseConfigured, isGeminiConfigured } from '@/lib/supabase/config';

export const metadata: Metadata = {
  title: 'Physics Motion Mechanics Sandbox | Interactive Laboratory',
  description:
    'Interactive educational physics laboratory where students experiment with motion mechanics, visualize trajectories, save experiments, and receive AI-powered explanations.',
  keywords: [
    'physics simulation',
    'projectile motion',
    'kinematics',
    'mechanics sandbox',
    'STEM education',
    'gemini physics tutor',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseOk = isSupabaseConfigured();
  const geminiOk = isGeminiConfigured();

  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar supabaseConfigured={supabaseOk} geminiConfigured={geminiOk} />
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
