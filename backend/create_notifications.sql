-- Run this SQL in your MySQL database to create the notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  title        VARCHAR(255) NOT NULL,
  message      TEXT NOT NULL,
  type         ENUM('info','complaint','resolved','warning') DEFAULT 'info',
  complaint_id INT DEFAULT NULL,
  is_read      TINYINT(1) DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
