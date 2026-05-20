import type Database from "better-sqlite3";
import type {
    CreateTableGroup,
    TableGroup,
} from "../core/table-groups/table-groups.dba.ts";

export const tableGroupFactory = (db: Database.Database) => {
    return {
        create: async (obj: CreateTableGroup) => {
            const stmt = db.prepare<CreateTableGroup, TableGroup>(
                `INSERT INTO table_groups (name) VALUES (@name) RETURNING *`,
            );
            return stmt.get(obj);
        },
    };
};
