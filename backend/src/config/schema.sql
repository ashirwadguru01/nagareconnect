-- Nagar e-Connect Database Schema
CREATE DATABASE IF NOT EXISTS nagareconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nagareconnect;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('citizen', 'worker', 'admin') DEFAULT 'citizen',
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  points INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  citizen_id INT NOT NULL,
  worker_id INT DEFAULT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(500),
  image_public_id VARCHAR(300),
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  address TEXT,
  ward VARCHAR(100),
  status ENUM('pending', 'in_progress', 'resolved', 'rejected') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Complaint status logs
CREATE TABLE IF NOT EXISTS complaint_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by INT NOT NULL,
  note TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Reward catalog
CREATE TABLE IF NOT EXISTS reward_catalog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  points_required INT NOT NULL,
  image_url VARCHAR(500),
  category VARCHAR(100),
  stock INT DEFAULT -1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reward transactions
CREATE TABLE IF NOT EXISTS reward_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('earned', 'redeemed') NOT NULL,
  points INT NOT NULL,
  description VARCHAR(300),
  complaint_id INT DEFAULT NULL,
  catalog_item_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE SET NULL,
  FOREIGN KEY (catalog_item_id) REFERENCES reward_catalog(id) ON DELETE SET NULL
);

-- Worker monthly stats
CREATE TABLE IF NOT EXISTS worker_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  worker_id INT NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  resolved_count INT DEFAULT 0,
  bonus_eligible BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_worker_month (worker_id, month, year),
  FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed default admin user (password: Admin@123)
INSERT IGNORE INTO users (name, email, password_hash, role) VALUES
('Admin', 'admin@nagareconnect.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Seed reward catalog items
INSERT IGNORE INTO reward_catalog (name, description, points_required, category) VALUES
('Amazon Gift Voucher ₹50', 'Redeem your points for an Amazon gift voucher', 100, 'Shopping'),
('Paytm Cashback ₹25', 'Get ₹25 cashback in your Paytm wallet', 60, 'Cashback'),
('Movie Ticket Voucher', 'Enjoy a free movie ticket at participating theaters', 150, 'Entertainment'),
('Municipal Tax Discount 5%', 'Get 5% discount on next property tax payment', 200, 'Civic'),
('Plant a Tree Certificate', 'We plant a tree in your name — get a certificate', 50, 'Environment'),
('Bus Pass (Monthly)', 'Free monthly local bus pass', 300, 'Transport');
