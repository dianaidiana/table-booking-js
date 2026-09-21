import db from "better-sqlite3";
import fs from "fs";
import { getMinutesFrom00hs } from "./utils.ts";

let database: db.Database | null = null;

export function initDb(testing: boolean = false): db.Database {
    try {
        const dbExists = !testing && fs.existsSync("./database.db");
        database = new db(testing ? ":memory:" : "./database.db");

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
    if (database == null) {
        throw new Error("Database was not initialized");
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
    const openingTime = getMinutesFrom00hs(new Temporal.PlainTime(9, 0));
    const closingTime = getMinutesFrom00hs(new Temporal.PlainTime(22, 0));

    const stmt = db.prepare(
        `INSERT INTO opening_hours (weekday, opening_time, closing_time, is_closed) VALUES
      (0, @openingTime, @closingTime, 0),
      (1, @openingTime, @closingTime, 0),
      (2, @openingTime, @closingTime, 0),
      (3, @openingTime, @closingTime, 0),
      (4, @openingTime, @closingTime, 0),
      (5, @openingTime, @closingTime, 0),
      (6, @openingTime, @closingTime, 0);
    `,
    );
    stmt.run({ openingTime, closingTime });
}
