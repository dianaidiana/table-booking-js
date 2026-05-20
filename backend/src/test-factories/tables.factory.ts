import type Database from "better-sqlite3";
import type { CreateTable, Table } from "../core/tables/tables.dba.ts";
import type { ToDb } from "../utils.ts";

export const tableFactory = (db: Database.Database) => {
    return {
        create: async (obj: CreateTable) => {
            const stmt = db.prepare<ToDb<CreateTable>, Table>(
                `INSERT INTO tables (table_group_id, table_number, capacity, disabled) 
                VALUES (@table_group_id, @table_number, @capacity, @disabled) 
                RETURNING *`,
            );
            const disabled = obj.disabled;
            return stmt.get({
                ...obj,
                disabled: disabled === true ? 1 : 0,
            });
        },
    };
};
