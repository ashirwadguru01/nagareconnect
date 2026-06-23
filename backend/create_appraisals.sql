CREATE TABLE IF NOT EXISTS appraisal_requests (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  worker_id     INT NOT NULL,
  month         INT NOT NULL,
  year          INT NOT NULL,
  tasks_completed INT NOT NULL DEFAULT 0,
  request_type  ENUM('bonus','appraisal','recognition') DEFAULT 'bonus',
  message       TEXT,
  status        ENUM('pending','approved','rejected') DEFAULT 'pending',
  admin_note    TEXT,
  bonus_amount  DECIMAL(10,2) DEFAULT NULL,
  approved_at   DATETIME DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_request (worker_id, month, year, request_type)
);
SELECT 'Appraisal table created!' AS result;
