import type Database from "better-sqlite3";
import type {
    OptionalToUndefined,
    PartialWithUndefined,
} from "./types-utils.ts";
import { NotFoundError } from "./errors.ts";
import { sharedMessages } from "./error-messages.ts";
import { getDb } from "./db-setup.ts";

export function withTransaction<T>(fn: () => T): T {
    return getDb().transaction(fn).immediate();
}

export interface TableInfo<OutT> {
    primaryKey: string;
    tableName: string;
    outColumns?: (keyof OutT)[];
}

export function dbPatchHelper<UpdateT extends object, OutT>(
    db: Database.Database,
    id: unknown,
    obj: OptionalToUndefined<UpdateT>,
    tableInfo: TableInfo<OutT>,
): OutT {
    const { setExpr, values } = makeSqlArguments<UpdateT>(
        obj,
        tableInfo.primaryKey,
    );

    const stmt = db.prepare<unknown[], OutT>(
        `UPDATE ${tableInfo.tableName} 
            SET ${setExpr} 
            WHERE ${tableInfo.primaryKey} = ?
            RETURNING ${tableInfo.outColumns != undefined ? tableInfo.outColumns.join(", ") : "*"}`,
    );
    const out = stmt.get(...values, id);
    if (!out) {
        throw new NotFoundError(
            sharedMessages.updateTargetNotFound(tableInfo.tableName, id),
        );
    }

    return out;
}

function makeSqlArguments<T extends object>(
    obj: PartialWithUndefined<T>,
    primaryKey: string,
) {
    const setExprs = [`${primaryKey} = ${primaryKey}`];
    const values = [];
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
            setExprs.push(`${key} = ?`);
            values.push(value === true ? 1 : value === false ? 0 : value);
        }
    }

    return { setExpr: setExprs.join(", "), values };
}
