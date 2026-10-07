// Nagar e-Connect - Authentication & Session Helper

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function getToken() {
  return localStorage.getItem('token');
}

function setSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function getDashboardUrl(role) {
  if (role === 'admin') return '/admin/dashboard.html';
  if (role === 'worker') return '/worker/dashboard.html';
  return '/citizen/dashboard.html';
}

function logout() {
  clearSession();
  window.location.href = '/login.html';
}

function requireAuth(allowedRoles = []) {
  const token = getToken();
  const user = getCurrentUser();

  if (!token || !user) {
    clearSession();
    window.location.href = '/login.html';
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    window.location.href = getDashboardUrl(user.role);
    return null;
  }

  return user;
}

function redirectIfLoggedIn() {
  const token = getToken();
  const user = getCurrentUser();
  if (token && user) {
    window.location.href = getDashboardUrl(user.role);
  }
}
