import { Router } from "express";
import {
    createTableController,
    getTableController,
    listTablesController,
} from "./tables.controller.js";

export const tablesRoutes = Router();

tablesRoutes.get("/", listTablesController);
tablesRoutes.get("/:id", getTableController);
tablesRoutes.post("/", createTableController);
