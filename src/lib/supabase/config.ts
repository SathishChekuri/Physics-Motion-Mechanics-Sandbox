export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return false;
  // Guard against placeholder strings
  if (url.includes('placeholder') || anonKey.includes('placeholder')) return false;
  if (!url.startsWith('https://') || !url.includes('.supabase.co')) return false;

  return true;
}

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return false;
  if (key.includes('placeholder') || key.length < 10) return false;
  return true;
}
