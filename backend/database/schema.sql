CREATE TABLE IF NOT EXISTS table_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL
);
CREATE TABLE IF NOT EXISTS tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_group_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL,
    disabled BOOLEAN NOT NULL DEFAULT 0, -- 0 for false, 1 for true
    FOREIGN KEY (table_group_id) REFERENCES table_groups(id),
    UNIQUE(name)
);
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL
);
CREATE TABLE IF NOT EXISTS opening_hours (
    weekday INTEGER PRIMARY KEY, -- 0-6, Sunday-Saturday
    opening_time INTEGER NOT NULL,
    closing_time INTEGER NOT NULL,
    is_closed BOOLEAN NOT NULL
);
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id INTEGER NOT NULL,
    booking_date DATE NOT NULL,
    booking_start_time INTEGER NOT NULL,
    pax INTEGER NOT NULL,
    guest_first_name VARCHAR(255) NOT NULL,
    guest_last_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    special_requests TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    booking_secret VARCHAR(255) NOT NULL UNIQUE, 
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    duration_minutes INTEGER,
    FOREIGN KEY (table_id) REFERENCES tables(id)
);
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_duration INTEGER NOT NULL -- Global duration for all bookings
);
