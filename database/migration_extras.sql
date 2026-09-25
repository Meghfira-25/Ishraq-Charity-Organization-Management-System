USE ishraq_charity;
CREATE TABLE IF NOT EXISTS contact_messages(
 id INT AUTO_INCREMENT PRIMARY KEY,
 full_name VARCHAR(100) NOT NULL,
 email VARCHAR(150) NOT NULL,
 phone_number VARCHAR(20),
 subject VARCHAR(200),
 message TEXT NOT NULL,
 status ENUM('New','Read','Resolved') DEFAULT 'New',
 handled_by INT NULL,
 handled_at DATETIME NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_contact_handled_by FOREIGN KEY(handled_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- =========================
-- ANNUAL PLANS FEATURE
-- Run this on an existing Ishraq database.
-- =========================

CREATE TABLE IF NOT EXISTS annual_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    year INT NOT NULL,
    short_description VARCHAR(500),
    description TEXT,
    status ENUM('Planned','Upcoming','Ongoing','Completed') NOT NULL DEFAULT 'Planned',
    start_date DATE NULL,
    end_date DATE NULL,
    target_value INT NOT NULL DEFAULT 0,
    current_value INT NOT NULL DEFAULT 0,
    target_unit VARCHAR(100),
    beneficiaries INT NOT NULL DEFAULT 0,
    cover_image TEXT,
    result_summary TEXT,
    is_published TINYINT(1) NOT NULL DEFAULT 0,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_annual_plan_created_by
      FOREIGN KEY (created_by) REFERENCES users(id)
      ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS annual_plan_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    image_url TEXT NOT NULL,
    caption VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_annual_plan_image_plan
      FOREIGN KEY (plan_id) REFERENCES annual_plans(id)
      ON DELETE CASCADE ON UPDATE CASCADE
);
