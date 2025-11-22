-- NeuroCare AI Comprehensive Database Schema
-- Migration 001: Initial comprehensive schema with all tables for features
-- Created: 2025-11-22

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS neurocare;

-- Set search path
SET search_path TO neurocare, public;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table (authentication and profiles)
CREATE TABLE IF NOT EXISTS neurocare.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin', 'caregiver')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients table (patient-specific information)
CREATE TABLE IF NOT EXISTS neurocare.patients (
    id SERIAL PRIMARY KEY,
    patient_code INTEGER UNIQUE NOT NULL,
    user_id INTEGER REFERENCES neurocare.users(id) ON DELETE CASCADE,
    age INTEGER,
    sex VARCHAR(20),
    education_years INTEGER,
    diagnosis VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game scores table
CREATE TABLE IF NOT EXISTS neurocare.game_scores (
    id SERIAL PRIMARY KEY,
    patient_code INTEGER NOT NULL,
    session_id VARCHAR(255),
    game VARCHAR(100) NOT NULL,
    level INTEGER,
    attempt INTEGER DEFAULT 1,
    score FLOAT,
    metrics JSONB,
    timestamp_start VARCHAR(100),
    timestamp_end VARCHAR(100),
    device VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_game_scores_patient (patient_code),
    INDEX idx_game_scores_game (game),
    INDEX idx_game_scores_created (created_at)
);

-- Predictions table (ML model predictions)
CREATE TABLE IF NOT EXISTS neurocare.predictions (
    id SERIAL PRIMARY KEY,
    patient_code INTEGER NOT NULL,
    model_version VARCHAR(100),
    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    risk_probability FLOAT,
    risk_label VARCHAR(50),
    feature_importance JSONB,
    input_summary JSONB,
    INDEX idx_predictions_patient (patient_code)
);

-- Game assignments table
CREATE TABLE IF NOT EXISTS neurocare.game_assignments (
    id SERIAL PRIMARY KEY,
    patient_code INTEGER NOT NULL,
    doctor_id INTEGER REFERENCES neurocare.users(id) ON DELETE CASCADE,
    game_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed')),
    target_score FLOAT,
    notes TEXT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    INDEX idx_game_assignments_patient (patient_code),
    INDEX idx_game_assignments_status (status)
);

-- Medical documents table
CREATE TABLE IF NOT EXISTS neurocare.medical_documents (
    id SERIAL PRIMARY KEY,
    patient_code INTEGER NOT NULL,
    document_type VARCHAR(100),
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    uploaded_by INTEGER REFERENCES neurocare.users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_medical_docs_patient (patient_code)
);

-- Patient reports table
CREATE TABLE IF NOT EXISTS neurocare.patient_reports (
    id SERIAL PRIMARY KEY,
    patient_code INTEGER NOT NULL,
    doctor_id INTEGER REFERENCES neurocare.users(id) ON DELETE CASCADE,
    report_type VARCHAR(50) DEFAULT 'assessment',
    report_content TEXT,
    prediction_summary JSONB,
    pdf_path VARCHAR(500),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_patient_reports_patient (patient_code),
    INDEX idx_patient_reports_doctor (doctor_id)
);

-- ============================================================================
-- GAMIFICATION TABLES
-- ============================================================================

-- Achievements table (master list of all achievements)
CREATE TABLE IF NOT EXISTS neurocare.achievements (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) CHECK (category IN ('games', 'consistency', 'improvement', 'milestones')),
    icon VARCHAR(100),
    points INTEGER DEFAULT 0,
    requirement JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements table (tracks which users earned which achievements)
CREATE TABLE IF NOT EXISTS neurocare.user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES neurocare.users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES neurocare.achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 100,
    UNIQUE(user_id, achievement_id),
    INDEX idx_user_achievements_user (user_id)
);

-- Activity streaks table (tracks daily/weekly activity streaks)
CREATE TABLE IF NOT EXISTS neurocare.activity_streaks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES neurocare.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    total_games_played INTEGER DEFAULT 0,
    total_login_days INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PROGRESS TRACKING TABLES
-- ============================================================================

-- Progress snapshots table (periodic snapshots for trend analysis)
CREATE TABLE IF NOT EXISTS neurocare.progress_snapshots (
    id SERIAL PRIMARY KEY,
    patient_code INTEGER NOT NULL,
    snapshot_date DATE NOT NULL,
    average_score FLOAT,
    games_completed INTEGER DEFAULT 0,
    improvement_rate FLOAT,
    cognitive_domains JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patient_code, snapshot_date),
    INDEX idx_progress_snapshots_patient (patient_code),
    INDEX idx_progress_snapshots_date (snapshot_date)
);

-- ============================================================================
-- NOTIFICATION TABLES
-- ============================================================================

-- Notifications table
CREATE TABLE IF NOT EXISTS neurocare.notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES neurocare.users(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('email', 'in_app', 'sms')),
    category VARCHAR(50) CHECK (category IN ('reminder', 'alert', 'report', 'achievement', 'system')),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_read (is_read),
    INDEX idx_notifications_sent (sent_at)
);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS neurocare.notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES neurocare.users(id) ON DELETE CASCADE,
    email_reminders BOOLEAN DEFAULT TRUE,
    email_reports BOOLEAN DEFAULT TRUE,
    email_achievements BOOLEAN DEFAULT TRUE,
    email_alerts BOOLEAN DEFAULT TRUE,
    in_app_notifications BOOLEAN DEFAULT TRUE,
    reminder_frequency VARCHAR(20) DEFAULT 'daily' CHECK (reminder_frequency IN ('daily', 'weekly', 'never')),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ANALYTICS TABLES
-- ============================================================================

-- Doctor analytics table (aggregated stats for doctors)
CREATE TABLE IF NOT EXISTS neurocare.doctor_analytics (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES neurocare.users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_patients INTEGER DEFAULT 0,
    active_patients INTEGER DEFAULT 0,
    avg_patient_score FLOAT,
    total_assessments INTEGER DEFAULT 0,
    high_risk_patients INTEGER DEFAULT 0,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_doctor_analytics_doctor (doctor_id),
    INDEX idx_doctor_analytics_period (period_start, period_end)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_email ON neurocare.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON neurocare.users(role);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON neurocare.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_created_desc ON neurocare.game_scores(created_at DESC);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION neurocare.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON neurocare.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON neurocare.users
    FOR EACH ROW EXECUTE FUNCTION neurocare.update_updated_at_column();

DROP TRIGGER IF EXISTS update_patients_updated_at ON neurocare.patients;
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON neurocare.patients
    FOR EACH ROW EXECUTE FUNCTION neurocare.update_updated_at_column();

-- ============================================================================
-- INITIAL DATA - ACHIEVEMENTS
-- ============================================================================

INSERT INTO neurocare.achievements (code, name, description, category, icon, points, requirement) VALUES
('first_game', 'First Steps', 'Complete your first cognitive game', 'milestones', '🎮', 10, '{"games_played": 1}'),
('games_10', 'Dedicated Player', 'Complete 10 cognitive games', 'games', '🎯', 50, '{"games_played": 10}'),
('games_50', 'Game Master', 'Complete 50 cognitive games', 'games', '🏆', 200, '{"games_played": 50}'),
('games_100', 'Century Club', 'Complete 100 cognitive games', 'games', '💯', 500, '{"games_played": 100}'),
('streak_3', '3-Day Streak', 'Play games for 3 consecutive days', 'consistency', '🔥', 30, '{"streak_days": 3}'),
('streak_7', 'Week Warrior', 'Play games for 7 consecutive days', 'consistency', '⚡', 100, '{"streak_days": 7}'),
('streak_30', 'Monthly Marathon', 'Play games for 30 consecutive days', 'consistency', '🌟', 500, '{"streak_days": 30}'),
('improvement_10', 'Getting Better', 'Improve your score by 10%', 'improvement', '📈', 50, '{"improvement_percent": 10}'),
('improvement_25', 'Rapid Progress', 'Improve your score by 25%', 'improvement', '🚀', 150, '{"improvement_percent": 25}'),
('perfect_score', 'Perfect Performance', 'Achieve a perfect score in any game', 'milestones', '⭐', 200, '{"perfect_score": 1}')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- SAMPLE NOTIFICATION PREFERENCES
-- ============================================================================

-- Create default notification preferences for existing users
INSERT INTO neurocare.notification_preferences (user_id, email_reminders, email_reports, email_achievements, email_alerts)
SELECT id, TRUE, TRUE, TRUE, TRUE FROM neurocare.users
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- GRANT PERMISSIONS (adjust as needed)
-- ============================================================================

-- Grant permissions to the application user (replace 'neurocare_app' with your actual user)
-- GRANT ALL PRIVILEGES ON SCHEMA neurocare TO neurocare_app;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA neurocare TO neurocare_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA neurocare TO neurocare_app;
