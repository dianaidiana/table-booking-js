import db from "better-sqlite3";
import fs from "fs";
import path from "path";

let database: db.Database | null = null;

export function initDb(): db.Database {
    try {
        database = new db("./database.db");
        database.pragma("journal_mode = WAL");
        database.pragma("synchronous = normal");

        const schema = fs.readFileSync("./database/schema.sql", "utf-8");
        database.exec(schema);

        createSettings(database);

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

function createSettings(db: db.Database): void {
    const stmt = db.prepare(
        "INSERT INTO settings (booking_duration) VALUES (?)",
    );
    stmt.run(120);
}
