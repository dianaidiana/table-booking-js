import { Router } from "express";
import { settingsRoutes } from "../../core/settings/settings.routes.ts";
import { tableGroupsRoutes } from "../../core/table-groups/table-groups.routes.ts";
import { tablesRoutes } from "../../core/tables/tables.routes.ts";
import { openingHoursRoutes } from "../../core/opening-hours/opening-hours.routes.ts";

export const adminRoutes = Router();

adminRoutes.use("/settings", settingsRoutes);
adminRoutes.use("/table-groups", tableGroupsRoutes);
adminRoutes.use("/tables", tablesRoutes);
adminRoutes.use("/opening-hours", openingHoursRoutes);
