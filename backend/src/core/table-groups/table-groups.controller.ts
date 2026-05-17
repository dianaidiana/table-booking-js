import express from "express";
import { type CreateTableGroup } from "./table-groups.dba.ts";
import z from "zod";
import {
    createTableGroup,
    deleteTableGroup,
    getTableGroup,
    listTableGroups,
    updateTableGroup,
} from "./table-groups.service.ts";
import type { Assert, Equal } from "../../utils.ts";

export async function listTableGroupsController(
    req: express.Request,
    res: express.Response,
) {
    const tableGroups = await listTableGroups();
    res.status(200).json(tableGroups);
}

const getTableGroupParamsSchema = z
    .object({
        id: z.coerce.number(),
    })
    .strict();

export async function getTableGroupController(
    req: express.Request,
    res: express.Response,
) {
    const { id } = getTableGroupParamsSchema.parse(req.params);

    const tableGroup = await getTableGroup(id);
    if (!tableGroup) {
        res.status(404).json({ error: "not found" });
    }

    res.status(200).json(tableGroup);
}

const createTableGroupBodySchema = z
    .object({
        name: z.string().nonempty(),
    })
    .strict();

type Check = Assert<
    Equal<z.infer<typeof createTableGroupBodySchema>, CreateTableGroup>
>;

export async function createTableGroupController(
    req: express.Request,
    res: express.Response,
) {
    const body = createTableGroupBodySchema.parse(req.body);

    const tableGroup = await createTableGroup(body);

    res.status(200).json(tableGroup);
}

const updateTableGroupBodySchema = createTableGroupBodySchema.partial();
const updateTableGroupParamsSchema = z
    .object({
        id: z.coerce.number(),
    })
    .strict();

export async function updateTableGroupController(
    req: express.Request,
    res: express.Response,
) {
    const body = updateTableGroupBodySchema.parse(req.body);
    const { id } = updateTableGroupParamsSchema.parse(req.params);
    const tableGroup = await updateTableGroup(id, body);

    res.status(200).json(tableGroup);
}

const deleteTableGroupParamsSchema = z
    .object({
        id: z.coerce.number(),
    })
    .strict();

export async function deleteTableGroupController(
    req: express.Request,
    res: express.Response,
) {
    const { id } = deleteTableGroupParamsSchema.parse(req.params);
    const isDeleted = await deleteTableGroup(id);

    if (isDeleted) {
        res.status(204).end();
    } else {
        res.status(404).json({ error: "not found" });
    }
}
