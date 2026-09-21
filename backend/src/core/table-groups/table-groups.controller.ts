import express from "express";
import type { CreateTableGroup } from "./table-groups.dba.ts";
import z from "zod";
import {
    createTableGroup,
    deleteTableGroup,
    getTableGroup,
    listTableGroups,
    updateTableGroup,
} from "./table-groups.service.ts";
import type { Assert, Equal } from "../../types-utils.ts";

export function listTableGroupsController(
    req: express.Request,
    res: express.Response,
) {
    const tableGroups = listTableGroups();
    res.status(200).json(tableGroups);
}

const getTableGroupParamsSchema = z
    .object({
        id: z.coerce.number(),
    })
    .strict();

export function getTableGroupController(
    req: express.Request,
    res: express.Response,
) {
    const { id } = getTableGroupParamsSchema.parse(req.params);

    const tableGroup = getTableGroup(id);
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

export function createTableGroupController(
    req: express.Request,
    res: express.Response,
) {
    const body = createTableGroupBodySchema.parse(req.body);

    const tableGroup = createTableGroup(body);

    res.status(201).json(tableGroup);
}

const updateTableGroupBodySchema = createTableGroupBodySchema.partial();
const updateTableGroupParamsSchema = z
    .object({
        id: z.coerce.number(),
    })
    .strict();

export function updateTableGroupController(
    req: express.Request,
    res: express.Response,
) {
    const body = updateTableGroupBodySchema.parse(req.body);
    const { id } = updateTableGroupParamsSchema.parse(req.params);
    const tableGroup = updateTableGroup(id, body);

    res.status(200).json(tableGroup);
}

const deleteTableGroupParamsSchema = z
    .object({
        id: z.coerce.number(),
    })
    .strict();

export function deleteTableGroupController(
    req: express.Request,
    res: express.Response,
) {
    const { id } = deleteTableGroupParamsSchema.parse(req.params);
    deleteTableGroup(id);
    res.status(204).end();
}
