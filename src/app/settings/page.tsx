import { SettingsView } from '@/components/settings/SettingsView';
import { isSupabaseConfigured, isGeminiConfigured } from '@/lib/supabase/config';

export const metadata = {
  title: 'Settings & Profile | Physics Mechanics Sandbox',
  description: 'Manage Supabase connection, Gemini API key, authentication, and simulator defaults',
};

export default function SettingsPage() {
  const supabaseOk = isSupabaseConfigured();
  const geminiOk = isGeminiConfigured();

  return (
    <SettingsView
      supabaseConfigured={supabaseOk}
      geminiConfigured={geminiOk}
    />
  );
}
