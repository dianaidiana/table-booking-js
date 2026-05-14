import express from "express";
import { settingsRoutes } from "../../core/settings/settings.routes.js";

export const adminRoutes = express.Router();

adminRoutes.use("/settings", settingsRoutes);
