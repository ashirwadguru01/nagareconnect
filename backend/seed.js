require('dotenv').config();
const db = require('./src/config/db');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const hash = await bcrypt.hash('Admin@123', 10);
    await db.query('UPDATE users SET password_hash = ? WHERE email = ?', [hash, 'admin@nagareconnect.in']);
    console.log('✅ Admin password updated successfully!');

    // Also seed reward catalog if empty
    const [rows] = await db.query('SELECT COUNT(*) as c FROM reward_catalog');
    if (rows[0].c === 0) {
      await db.query(`INSERT INTO reward_catalog (name, description, points_required, category) VALUES
        ('Amazon Gift Voucher ₹50', 'Redeem for Amazon voucher', 100, 'Shopping'),
        ('Paytm Cashback ₹25', 'Get cashback in Paytm wallet', 60, 'Cashback'),
        ('Movie Ticket Voucher', 'Free movie ticket at theatres', 150, 'Entertainment'),
        ('Municipal Tax Discount 5%', '5% off on property tax', 200, 'Civic'),
        ('Plant a Tree Certificate', 'We plant a tree in your name', 50, 'Environment'),
        ('Bus Pass (Monthly)', 'Free monthly local bus pass', 300, 'Transport')`);
      console.log('✅ Reward catalog seeded!');
    }

    const [admin] = await db.query('SELECT id, name, email, role FROM users WHERE email = ?', ['admin@nagareconnect.in']);
    console.log('Admin user:', admin[0]);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
