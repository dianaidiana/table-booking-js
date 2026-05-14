import { Router } from "express";
import {
    getSettingsController,
    updateSettingsController,
} from "./settings.controller.js";

export const settingsRoutes = Router();

settingsRoutes.get("/", getSettingsController);
settingsRoutes.patch("/", updateSettingsController);
