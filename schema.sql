-- Mobility / Incident Management schema for MySQL 8+
-- Run with: mysql -u your_user -p your_database < schema.sql

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS moderation_logs;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS alert_subscriptions;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS report_votes;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS incidents;
DROP TABLE IF EXISTS checkpoint_status_history;
DROP TABLE IF EXISTS checkpoints;
DROP TABLE IF EXISTS incident_categories;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'citizen',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE refresh_tokens (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at DATETIME NULL,
    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    UNIQUE KEY uq_refresh_tokens_token_hash (token_hash),
    KEY idx_refresh_tokens_user_id (user_id),
    KEY idx_refresh_tokens_expires_at (expires_at),
    KEY idx_refresh_tokens_revoked_at (revoked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE incident_categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE checkpoints (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    region VARCHAR(100),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE checkpoint_status_history (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    checkpoint_id INT UNSIGNED NOT NULL,
    status VARCHAR(50),
    updated_by INT UNSIGNED,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_checkpoint_status_history_checkpoint
        FOREIGN KEY (checkpoint_id)
        REFERENCES checkpoints(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_checkpoint_status_history_user
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON DELETE SET NULL,
    KEY idx_checkpoint_status_history_checkpoint_id (checkpoint_id),
    KEY idx_checkpoint_status_history_updated_by (updated_by),
    KEY idx_checkpoint_status_history_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE incidents (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    incident_type INT UNSIGNED,
    severity VARCHAR(20),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    created_by INT UNSIGNED,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_incidents_category
        FOREIGN KEY (incident_type)
        REFERENCES incident_categories(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_incidents_user
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,
    KEY idx_incidents_incident_type (incident_type),
    KEY idx_incidents_created_by (created_by),
    KEY idx_incidents_status (status),
    KEY idx_incidents_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reports (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED,
    category_id INT UNSIGNED,
    description TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    duplicate_of INT UNSIGNED,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reports_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_reports_category
        FOREIGN KEY (category_id)
        REFERENCES incident_categories(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_reports_duplicate_of
        FOREIGN KEY (duplicate_of)
        REFERENCES reports(id)
        ON DELETE SET NULL,
    KEY idx_reports_user_id (user_id),
    KEY idx_reports_category_id (category_id),
    KEY idx_reports_duplicate_of (duplicate_of),
    KEY idx_reports_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE report_votes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    report_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    vote_type VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_report_votes_report
        FOREIGN KEY (report_id)
        REFERENCES reports(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_report_votes_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    UNIQUE KEY uq_report_votes_report_user (report_id, user_id),
    KEY idx_report_votes_user_id (user_id),
    KEY idx_report_votes_vote_type (vote_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE alert_subscriptions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED,
    region VARCHAR(100),
    incident_category_id INT UNSIGNED,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alert_subscriptions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_alert_subscriptions_category
        FOREIGN KEY (incident_category_id)
        REFERENCES incident_categories(id)
        ON DELETE SET NULL,
    KEY idx_alert_subscriptions_user_id (user_id),
    KEY idx_alert_subscriptions_category_id (incident_category_id),
    KEY idx_alert_subscriptions_region (region)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE alerts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    incident_id INT UNSIGNED,
    region VARCHAR(100),
    message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alerts_incident
        FOREIGN KEY (incident_id)
        REFERENCES incidents(id)
        ON DELETE SET NULL,
    KEY idx_alerts_incident_id (incident_id),
    KEY idx_alerts_region (region)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE moderation_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED,
    action VARCHAR(100),
    target_type VARCHAR(50),
    target_id INT UNSIGNED,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_moderation_logs_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,
    KEY idx_moderation_logs_user_id (user_id),
    KEY idx_moderation_logs_target (target_type, target_id),
    KEY idx_moderation_logs_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
