import { Router } from "express";
import {
    createTableGroupController,
    deleteTableGroupController,
    getTableGroupController,
    listTableGroupsController,
    updateTableGroupController,
} from "./table-groups.controller.js";

export const tableGroupsRoutes = Router();

tableGroupsRoutes.get("/", listTableGroupsController);
tableGroupsRoutes.get("/:id", getTableGroupController);
tableGroupsRoutes.post("/", createTableGroupController);
tableGroupsRoutes.patch("/", updateTableGroupController);
tableGroupsRoutes.delete("/:id", deleteTableGroupController);
