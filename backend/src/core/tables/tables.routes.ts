import { Router } from "express";
import {
    createTableController,
    deleteTableController,
    getTableController,
    listTablesController,
    updateTableController,
} from "./tables.controller.js";

export const tablesRoutes = Router();

tablesRoutes.get("/", listTablesController);
tablesRoutes.get("/:id", getTableController);
tablesRoutes.post("/", createTableController);
tablesRoutes.patch("/:id", updateTableController);
tablesRoutes.delete("/:id", deleteTableController);
