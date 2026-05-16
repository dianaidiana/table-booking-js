import db from "better-sqlite3";
import fs from "fs";
import path from "path";

let database: db.Database | null = null;

export function initDb(): db.Database {
    try {
        const dbExists = fs.existsSync("./database.db");
        database = new db("./database.db");
        database.pragma("journal_mode = WAL");
        database.pragma("synchronous = normal");

        // Only apply schema and create settings and opening hours on first creation
        if (!dbExists) {
            const schema = fs.readFileSync("./database/schema.sql", "utf-8");
            database.exec(schema);

            createSettings(database);
            createOpeningHours(database);
            console.log("Schema applied to fresh database.");
        }

        return database;
    } catch (error) {
        closeDb();
        console.error("Error applying schema to database:", error);
        throw error;
    }
}

export function getDb(): db.Database {
    if (!database) {
        return initDb();
    }

    return database;
}

export function closeDb(): void {
    if (database) {
        database.close();
        database = null;
        console.log("Database connection closed.");
    }
}

function createSettings(db: db.Database): void {
    const stmt = db.prepare(
        "INSERT INTO settings (booking_duration) VALUES (?)",
    );
    stmt.run(120);
}

function createOpeningHours(db: db.Database): void {
    const stmt = db.prepare(
        `INSERT INTO opening_hours (weekday, opening_time, closing_time, is_closed) VALUES
      (0, '09:00', '22:00', 0), 
      (1, '09:00', '22:00', 0),
      (2, '09:00', '22:00', 0),
      (3, '09:00', '22:00', 0),
      (4, '09:00', '22:00', 0),
      (5, '09:00', '22:00', 0),
      (6, '09:00', '22:00', 0);
    `,
    );
    stmt.run();
}
