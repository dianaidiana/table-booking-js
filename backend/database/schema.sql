CREATE TABLE IF NOT EXISTS table_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL
);
CREATE TABLE IF NOT EXISTS tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_group_id INTEGER NOT NULL,
    table_number VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL,
    disabled BOOLEAN NOT NULL DEFAULT 0, -- 0 for false, 1 for true
    FOREIGN KEY (table_group_id) REFERENCES table_groups(id),
    UNIQUE(table_number)
);
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL
);
CREATE TABLE IF NOT EXISTS opening_hours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    weekday INTEGER NOT NULL, -- 0-6
    opening_time VARCHAR(5) NOT NULL,
    closing_time VARCHAR(5) NOT NULL,
    is_closed BOOLEAN NOT NULL,
    UNIQUE(weekday)
);
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id INTEGER NOT NULL,
    booking_date DATE NOT NULL,
    booking_start_time VARCHAR(5) NOT NULL,
    pax INTEGER NOT NULL,
    guest_first_name VARCHAR(255) NOT NULL,
    guest_last_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    special_requests TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    booking_secret VARCHAR(255) UNIQUE, -- Formerly confirmation_token
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, booking_end_time VARCHAR(5), duration_minutes INTEGER,
    FOREIGN KEY (table_id) REFERENCES tables(id)
);
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_duration INTEGER NOT NULL -- Global duration for all bookings
);
