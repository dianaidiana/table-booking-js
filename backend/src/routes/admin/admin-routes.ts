import express from "express";
import { settingsRoutes } from "./settings-routes.js";

export const adminRoutes = express.Router();

adminRoutes.use("/settings", settingsRoutes);
