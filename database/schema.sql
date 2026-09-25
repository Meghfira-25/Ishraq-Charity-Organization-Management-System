
DROP DATABASE IF EXISTS ishraq_charity;

CREATE DATABASE ishraq_charity
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE ishraq_charity;

-- USERS


CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone_number VARCHAR(20),

    password VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255),

    role ENUM(
        'Admin',
        'Registration-Officer',
        'Distribution-Officer'
    ) NOT NULL,

    status ENUM(
        'Active',
        'Inactive'
    ) NOT NULL DEFAULT 'Active',

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- =========================
-- BENEFICIARIES
-- =========================

CREATE TABLE beneficiaries (
    id INT AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,
    age INT NULL,

    gender ENUM(
        'Female',
        'Male'
    ) NOT NULL,

    nationality VARCHAR(50),
    birth_date DATE,

    marriage_status ENUM(
        'Single',
        'Married',
        'Divorced',
        'Widowed'
    ),

    education_level ENUM(
        'Not_Educated',
        'Primary',
        'Secondary',
        'Degree',
        'Masters',
        'PHD',
        'Other'
    ),

    source_of_income VARCHAR(100),

    monthly_income DECIMAL(12,2)
        DEFAULT 0,

    phone_number VARCHAR(20),

    city VARCHAR(100),
    woreda VARCHAR(100),
    kebele VARCHAR(100),
    address VARCHAR(255),

    home_ownership ENUM(
        'Rental',
        'Own'
    ),

    house_rooms INT,

    has_external_support ENUM(
        'Yes',
        'No'
    ) DEFAULT 'No',

    external_support VARCHAR(200),

    support_type ENUM(
        'Food',
        'Children_Education',
        'Money',
        'Job_creation',
        'House_rent',
        'Medical',
        'Other'
    ),

    notes TEXT,
    uploaded_files JSON,

    registered_by INT NOT NULL,

    status ENUM(
        'Pending',
        'Approved',
        'Rejected'
    ) DEFAULT 'Pending',

    reviewed_by INT NULL,
    review_notes TEXT NULL,

    registration_date TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    reviewed_at DATETIME NULL,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_beneficiary_registered_by
        FOREIGN KEY (registered_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_beneficiary_reviewed_by
        FOREIGN KEY (reviewed_by)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CHECK (monthly_income >= 0),

    CHECK (
        house_rooms IS NULL
        OR house_rooms >= 0
    )
);


-- =========================
-- BENEFICIARY CHILDREN
-- =========================

CREATE TABLE beneficiary_children (
    id INT AUTO_INCREMENT PRIMARY KEY,

    beneficiary_id INT NOT NULL,

    full_name VARCHAR(150) NOT NULL,
    birth_date DATE,

    gender ENUM(
        'Female',
        'Male'
    ),

    education_level VARCHAR(100),
    school_name VARCHAR(150),
    health_status TEXT,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (beneficiary_id)
        REFERENCES beneficiaries(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- =========================
-- MEMBERS
-- =========================

CREATE TABLE members (
    id INT AUTO_INCREMENT PRIMARY KEY,

    photo VARCHAR(255),

    full_name VARCHAR(100) NOT NULL,
    age INT NULL,

    gender ENUM(
        'Female',
        'Male'
    ) NOT NULL,

    nationality VARCHAR(50),
    birth_date DATE,

    marriage_status ENUM(
        'Single',
        'Married',
        'Divorced',
        'Widowed'
    ),

    education_level ENUM(
        'Not_Educated',
        'Primary',
        'Secondary',
        'Degree',
        'Masters',
        'PHD',
        'Other'
    ),

    assigned_responsibility VARCHAR(200),

    city VARCHAR(100),
    subcity VARCHAR(255),
    woreda VARCHAR(100),
    kebele VARCHAR(100),

    email VARCHAR(150)
        NOT NULL
        UNIQUE,

    phone_number VARCHAR(20),

    membership_date DATE NULL,

    status ENUM(
        'Pending',
        'Approved',
        'Rejected',
        'More_Info'
    ) DEFAULT 'Pending',

    reviewed_by INT NULL,
    reviewed_at DATETIME NULL,
    review_notes TEXT NULL,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (reviewed_by)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);


-- =========================
-- MEMBER CHARITY EXPERIENCE
-- =========================

CREATE TABLE member_charity_experience (
    id INT AUTO_INCREMENT PRIMARY KEY,

    member_id INT NOT NULL,

    organization_name VARCHAR(150) NOT NULL,
    responsibility VARCHAR(200) NOT NULL,
    years_worked DECIMAL(4,1) NOT NULL,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (member_id)
        REFERENCES members(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CHECK (years_worked >= 0)
);


-- =========================
-- DONATIONS
-- =========================

CREATE TABLE donations (
    id INT AUTO_INCREMENT PRIMARY KEY,

    is_anonymous BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    full_name VARCHAR(100),
    phone_number VARCHAR(20),
    email VARCHAR(150),
    address VARCHAR(255),

    donation_type ENUM(
        'Money',
        'Food',
        'Clothing',
        'Textbooks',
        'Other'
    ) NOT NULL,

    amount DECIMAL(12,2) NULL,

    item_name VARCHAR(150) NULL,
    quantity DECIMAL(12,2) NULL,
    unit VARCHAR(50) NULL,

    purpose VARCHAR(255) NULL,
    donation_description TEXT,

    preferred_date DATE NULL,
    preferred_time TIME NULL,

    payment_screenshot VARCHAR(255) NULL,

    notes TEXT,

    status ENUM(
        'Pending',
        'Confirmed',
        'Received',
        'Rejected',
        'Cancelled'
    ) DEFAULT 'Pending',

    reviewed_by INT NULL,
    reviewed_at DATETIME NULL,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (reviewed_by)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CHECK (
        amount IS NULL
        OR amount > 0
    ),

    CHECK (
        quantity IS NULL
        OR quantity > 0
    )
);


-- =========================
-- RESOURCES
-- =========================

CREATE TABLE resources (
    id INT AUTO_INCREMENT PRIMARY KEY,

    donation_id INT NULL,

    resource_name VARCHAR(150) NOT NULL,

    resource_type ENUM(
        'Money',
        'Food',
        'Clothing',
        'Textbooks',
        'Other'
    ) NOT NULL,

    total_quantity DECIMAL(12,2)
        NOT NULL
        DEFAULT 0,

    available_quantity DECIMAL(12,2)
        NOT NULL
        DEFAULT 0,

    unit VARCHAR(50),

    description TEXT,

    received_date DATE,

    status ENUM(
        'Available',
        'Partially_Distributed',
        'Fully_Distributed',
        'Unavailable'
    ) DEFAULT 'Available',

    created_by INT NOT NULL,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (donation_id)
        REFERENCES donations(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CHECK (
        total_quantity >= 0
        AND available_quantity >= 0
        AND available_quantity <= total_quantity
    )
);


-- =========================
-- ASSISTANCE APPLICATIONS
-- =========================

CREATE TABLE assistance_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,

    beneficiary_id INT NOT NULL,

    support_type ENUM(
        'Food',
        'Children_Education',
        'Money',
        'Job_creation',
        'House_rent',
        'Medical',
        'Other'
    ) NOT NULL,

    requested_amount DECIMAL(12,2) NULL,

    description TEXT NOT NULL,

    urgency_level ENUM(
        'Urgent',
        'Very_Urgent'
    ) DEFAULT 'Urgent',

    uploaded_files JSON,

    status ENUM(
        'Pending',
        'Approved',
        'Rejected',
        'More_Info',
        'Completed'
    ) DEFAULT 'Pending',

    submitted_by INT NOT NULL,

    reviewed_by INT NULL,
    reviewed_at DATETIME NULL,

    review_notes TEXT,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (beneficiary_id)
        REFERENCES beneficiaries(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    FOREIGN KEY (submitted_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    FOREIGN KEY (reviewed_by)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CHECK (
        requested_amount IS NULL
        OR requested_amount > 0
    )
);


-- =========================
-- ACTIVITIES
-- =========================

CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(200) NOT NULL,

    activity_type ENUM(
        'Program',
        'Event',
        'Distribution'
    ) NOT NULL,

    description TEXT,

    target_beneficiaries VARCHAR(255),
    location VARCHAR(255),

    start_date DATE NOT NULL,
    end_date DATE NULL,

    status ENUM(
        'Planned',
        'Upcoming',
        'Ongoing',
        'Completed',
        'Cancelled'
    ) DEFAULT 'Planned',

    created_by INT NOT NULL,

    responsible_staff_id INT NULL,

    notes TEXT,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    FOREIGN KEY (responsible_staff_id)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CHECK (
        end_date IS NULL
        OR end_date >= start_date
    )
);


-- =========================
-- DISTRIBUTIONS
-- =========================

CREATE TABLE distributions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    beneficiary_id INT NOT NULL,

    assistance_application_id INT NULL,

    resource_id INT NOT NULL,

    activity_id INT NULL,

    quantity DECIMAL(12,2) NOT NULL,

    unit VARCHAR(50),

    priority ENUM(
        'Normal',
        'Urgent'
    ) DEFAULT 'Normal',

    distribution_date DATE NOT NULL,

    distribution_location VARCHAR(255),

    distributed_by INT NOT NULL,

    notes TEXT,

    status ENUM(
        'Planned',
        'Completed',
        'Cancelled'
    ) DEFAULT 'Completed',

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (beneficiary_id)
        REFERENCES beneficiaries(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    FOREIGN KEY (assistance_application_id)
        REFERENCES assistance_applications(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    FOREIGN KEY (resource_id)
        REFERENCES resources(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    FOREIGN KEY (activity_id)
        REFERENCES activities(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    FOREIGN KEY (distributed_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CHECK (quantity > 0)
);


-- =========================
-- CONTENT
-- =========================

CREATE TABLE content (
    id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(200) NOT NULL,

    content_type ENUM(
        'Program',
        'News',
        'Event',
        'Success_Story',
        'Gallery'
    ) NOT NULL,

    short_description VARCHAR(500),

    description TEXT,

    image VARCHAR(255),

    event_date DATE NULL,

    location VARCHAR(255) NULL,

    activity_id INT NULL,

    status ENUM(
        'Draft',
        'Published',
        'Archived'
    ) DEFAULT 'Draft',

    created_by INT NOT NULL,

    published_at DATETIME NULL,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (activity_id)
        REFERENCES activities(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);


-- =========================
-- CONTACT MESSAGES
-- =========================

CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL,

    phone_number VARCHAR(20),

    subject VARCHAR(200),

    message TEXT NOT NULL,

    status ENUM(
        'New',
        'Read',
        'Resolved'
    ) DEFAULT 'New',

    handled_by INT NULL,

    handled_at DATETIME NULL,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (handled_by)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);


-- =========================
-- INDEXES
-- =========================

CREATE INDEX idx_beneficiaries_name
ON beneficiaries(full_name);

CREATE INDEX idx_beneficiaries_status
ON beneficiaries(status);

CREATE INDEX idx_members_status
ON members(status);

CREATE INDEX idx_donations_status
ON donations(status);

CREATE INDEX idx_donations_type
ON donations(donation_type);

CREATE INDEX idx_resources_status
ON resources(status);

CREATE INDEX idx_assistance_status
ON assistance_applications(status);

CREATE INDEX idx_distributions_beneficiary
ON distributions(beneficiary_id);

CREATE INDEX idx_activities_status
ON activities(status);

CREATE INDEX idx_content_type_status
ON content(content_type, status);


-- =========================
-- ANNUAL PLANS
-- =========================

CREATE TABLE annual_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(200) NOT NULL,
    year INT NOT NULL,

    short_description VARCHAR(500),
    description TEXT,

    status ENUM(
        'Planned',
        'Upcoming',
        'Ongoing',
        'Completed'
    ) NOT NULL DEFAULT 'Planned',

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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_annual_plan_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CHECK (year >= 2000),
    CHECK (target_value >= 0),
    CHECK (current_value >= 0),
    CHECK (beneficiaries >= 0)
);

CREATE TABLE annual_plan_images (
    id INT AUTO_INCREMENT PRIMARY KEY,

    plan_id INT NOT NULL,
    image_url TEXT NOT NULL,
    caption VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_annual_plan_image_plan
        FOREIGN KEY (plan_id)
        REFERENCES annual_plans(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX idx_annual_plans_year_status
ON annual_plans(year, status, is_published);
