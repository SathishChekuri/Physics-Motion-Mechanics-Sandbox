import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { isSupabaseConfigured, isGeminiConfigured } from '@/lib/supabase/config';

export default function HomePage() {
  const supabaseOk = isSupabaseConfigured();
  const geminiOk = isGeminiConfigured();

  return (
    <DashboardOverview
      supabaseConfigured={supabaseOk}
      geminiConfigured={geminiOk}
    />
  );
}
