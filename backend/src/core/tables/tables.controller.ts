import express from "express";
import { createTable, getTable, listTables } from "./tables.service.js";
import z, { maxLength } from "zod";
import type { CreateTable } from "./tables.dba.js";
import type { Assert, Equal } from "../../utils.js";

export async function listTablesController(
    req: express.Request,
    res: express.Response,
) {
    const tables = await listTables();
    res.status(200).json(tables);
}

const getTableParamsSchema = z
    .object({
        id: z.coerce.number(),
    })
    .strict();

export async function getTableController(
    req: express.Request,
    res: express.Response,
) {
    const { id } = getTableParamsSchema.parse(req.params);

    const table = await getTable(id);
    if (!table) {
        res.status(404).json({ error: "not found" });
    }

    res.status(200).json(table);
}

const createTableBodySchema = z
    .object({
        table_group_id: z.number().positive(),
        table_number: z.string().nonempty(),
        capacity: z.number().positive(),
        disabled: z.boolean(),
    })
    .strict();

type Check = Assert<Equal<z.infer<typeof createTableBodySchema>, CreateTable>>;

export async function createTableController(
    req: express.Request,
    res: express.Response,
) {
    const body = createTableBodySchema.parse(req.body);

    const table = await createTable(body);

    res.status(200).json(table);
}
