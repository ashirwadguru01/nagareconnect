// Register logic
document.addEventListener('DOMContentLoaded', () => {
  redirectIfLoggedIn();

  const form = document.getElementById('register-form');
  const submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;

    if (!name || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      const res = await authService.register({ name, email, phone, role, password });
      setSession(res.token, res.user);
      toast.success('Account created successfully! 🎉');

      setTimeout(() => {
        window.location.href = getDashboardUrl(res.user.role);
      }, 500);
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  });

  if (window.feather) {
    window.feather.replace();
  }
});
