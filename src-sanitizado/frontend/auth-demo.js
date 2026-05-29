'use strict';

function createSupabaseClient() {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.ENV ?? {};

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Configure SUPABASE_URL e SUPABASE_ANON_KEY em config/env.js');
  }

  return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

async function loginWithGoogle(supabaseClient) {
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error('[Auth]', error.message);
    showAuthError('Não foi possível iniciar o login. Tente novamente.');
  }
}

async function handleOAuthCallback(supabaseClient) {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error || !data.session) {
    redirectToLogin();
    return;
  }

  const role = await fetchUserRole(supabaseClient, data.session.user.id);
  redirectByRole(role);
}

async function fetchUserRole(supabaseClient, userId) {
  const { data } = await supabaseClient
    .from('usuarios')
    .select('role')
    .eq('id', userId)
    .single();

  return data?.role ?? 'motorista';
}

function redirectByRole(role) {
  const routes = {
    admin:     '/dashboard',
    gestor:    '/dashboard',
    motorista: '/app',
  };

  window.location.href = routes[role] ?? '/login';
}

async function requireAuth(supabaseClient, allowedRoles = []) {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    redirectToLogin();
    return null;
  }

  if (allowedRoles.length > 0) {
    const role = await fetchUserRole(supabaseClient, session.user.id);
    if (!allowedRoles.includes(role)) {
      window.location.href = '/acesso-negado';
      return null;
    }
  }

  return session;
}

async function logout(supabaseClient) {
  await supabaseClient.auth.signOut();
  redirectToLogin();
}

function onAuthStateChange(supabaseClient, callback) {
  supabaseClient.auth.onAuthStateChange(callback);
}

function redirectToLogin() {
  window.location.href = '/login';
}

function showAuthError(message) {
  const el = document.getElementById('auth-error');
  if (el) {
    el.textContent = message;
    el.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('btn-login-google');
  if (!loginBtn) return;

  let client;
  try {
    client = createSupabaseClient();
  } catch (err) {
    showAuthError(err.message);
    return;
  }

  loginBtn.addEventListener('click', () => loginWithGoogle(client));

  client.auth.getSession().then(({ data: { session } }) => {
    if (session) fetchUserRole(client, session.user.id).then(redirectByRole);
  });
});

if (typeof module !== 'undefined') {
  module.exports = {
    createSupabaseClient,
    loginWithGoogle,
    handleOAuthCallback,
    requireAuth,
    logout,
    onAuthStateChange,
  };
}
