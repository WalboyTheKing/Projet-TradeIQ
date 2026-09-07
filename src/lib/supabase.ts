// ============================================================================
// SUPABASE CLIENT FOR BROWSER (TRADEIQ FRONTEND)
// Single source of truth for Supabase Auth and Client Data Access
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string) ||
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  '';

const supabaseAnonKey =
  (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  '';

export const isSupabaseConfigured: boolean =
  Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project'));

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
  }
);

/**
 * Traduit les erreurs brutes de Supabase Auth en messages clairs et professionnels pour l'utilisateur
 */
export function getFriendlyAuthErrorMessage(error: any): string {
  if (!error) return 'Une erreur inconnue est survenue.';

  const message = (error.message || error.error_description || String(error)).toLowerCase();

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
