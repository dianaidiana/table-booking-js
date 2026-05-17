import { Router } from "express";
import {
    getSettingsController,
    updateSettingsController,
} from "./settings.controller.ts";

export const settingsRoutes = Router();

settingsRoutes.get("/", getSettingsController);
settingsRoutes.patch("/", updateSettingsController);
