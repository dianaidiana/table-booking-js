import { Router } from "express";
import { settingsRoutes } from "../../core/settings/settings.routes.js";
import { tableGroupsRoutes } from "../../core/table-groups/table-groups.routes.js";
import { tablesRoutes } from "../../core/tables/tables.routes.js";

export const adminRoutes = Router();

adminRoutes.use("/settings", settingsRoutes);
adminRoutes.use("/table-groups", tableGroupsRoutes);
adminRoutes.use("/tables", tablesRoutes);
