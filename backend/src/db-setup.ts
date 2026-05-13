import db from "better-sqlite3";
import fs from "fs";
import path from "path";

// TODO: what is the best way to pass this directory as a config?
const directory =
    "/Users/dianacarbajal/Projects/table-booking-js/backend/database";
let database: db.Database | null = null;

export function initDb(): db.Database {
    const dbPath = path.join(directory, "database.db");

    try {
        database = new db(dbPath);
        // TODO: what is this?
        database.pragma("journal_mode = WAL");
        database.pragma("synchronous = normal");

        const schemaPath = path.join(directory, "schema.sql");
        const schema = fs.readFileSync(schemaPath, "utf-8");
        database.exec(schema);

        // TODO: the number should be passed as a config? where?
        createSettings(120);

        console.log("Schema applied to fresh database.");
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

function createSettings(bookingDuration: number) {
    const db = getDb();
    const stmt = db.prepare(
        "INSERT INTO settings (booking_duration) VALUES (?)",
    );
    stmt.run(bookingDuration);
}
