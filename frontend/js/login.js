// Login logic
document.addEventListener('DOMContentLoaded', () => {
  redirectIfLoggedIn();

  const form = document.getElementById('login-form');
  const submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    try {
      const res = await authService.login({ email, password });
      setSession(res.token, res.user);
      toast.success(`Welcome back, ${res.user.name}!`);

      setTimeout(() => {
        window.location.href = getDashboardUrl(res.user.role);
      }, 500);
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  });

  if (window.feather) {
    window.feather.replace();
  }
});
