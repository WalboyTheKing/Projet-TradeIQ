// ============================================================================
// SUPABASE CLIENT FOR BROWSER (TRADEIQ FRONTEND)
// Single source of truth for Supabase Auth and Client Data Access
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string) ||
  '';

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string) ||
  '';

/**
 * Détecte si la clé fournie au navigateur est par erreur une clé secrète/admin (service_role ou sb_secret_*)
 */
export function isSecretApiKey(key: string): boolean {
  if (!key) return false;
  if (key.startsWith('sb_secret_')) return true;
  if (key.toLowerCase().includes('service_role')) return true;
  try {
    const parts = key.split('.');
    if (parts.length === 3) {
      const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadStr);
      if (payload && payload.role === 'service_role') {
        return true;
      }
    }
  } catch {
    // Erreur de décodage ignorée
  }
  return false;
}

export const isSupabaseConfigured: boolean =
  Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project'));

// Custom fetch handler that gracefully routes through our backend proxy if a secret key is present in client-side config,
// preventing Supabase's "Forbidden use of secret API key in browser" 401 error.
const customFetch: typeof fetch = async (input, init) => {
  const urlString = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  if (isSecretApiKey(supabaseAnonKey) && typeof window !== 'undefined') {
    try {
      const urlObj = new URL(urlString);
      const configuredHost = supabaseUrl ? new URL(supabaseUrl).host : '';
      if (configuredHost && urlObj.host === configuredHost) {
        const proxyUrl = `/api/supabase-proxy${urlObj.pathname}${urlObj.search}`;
        return await fetch(proxyUrl, init);
      }
    } catch {
      // Fallback to standard fetch
    }
  }

  return fetch(input, init);
};

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
    global: {
      fetch: customFetch,
    },
  }
);

/**
 * Traduit les erreurs brutes de Supabase Auth en messages clairs et professionnels pour l'utilisateur
 */
export function getFriendlyAuthErrorMessage(error: any): string {
  if (!error) return 'Une erreur inconnue est survenue.';

  const message = (error.message || error.error_description || String(error)).toLowerCase();

  if (
    message.includes('forbidden use of secret api key in browser') ||
    message.includes('secret api key in browser') ||
    message.includes('secret api key')
  ) {
    return 'Configuration Vercel incorrecte : la clé secrète (service_role) a été configurée dans le frontend au lieu de la clé publique (anon). Dans votre tableau de bord Vercel > Settings > Environment Variables, remplacez la valeur de VITE_SUPABASE_ANON_KEY par votre clé publique "anon" (disponible dans Supabase > Settings > API > Project API keys > anon public).';
  }
  if (message.includes('invalid login credentials') || message.includes('invalid_grant')) {
    return 'Adresse email ou mot de passe incorrect.';
  }
  if (message.includes('user already registered') || message.includes('already exists')) {
    return 'Un compte existe déjà avec cette adresse email. Veuillez vous connecter.';
  }
  if (message.includes('email not confirmed')) {
    return 'Veuillez confirmer votre adresse email en cliquant sur le lien reçu dans votre boîte de réception.';
  }
  if (message.includes('password should be at least') || message.includes('weak_password')) {
    return 'Le mot de passe doit comporter au moins 6 caractères.';
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Trop de tentatives en peu de temps. Veuillez patienter un instant avant de réessayer.';
  }
  if (message.includes('network') || message.includes('failed to fetch')) {
    return 'Impossible de contacter le serveur d’authentification. Vérifiez votre connexion internet.';
  }
  if (message.includes('invalid email')) {
    return 'Le format de l’adresse email est invalide.';
  }

  return error.message || 'Une erreur est survenue lors de l’authentification.';
}
