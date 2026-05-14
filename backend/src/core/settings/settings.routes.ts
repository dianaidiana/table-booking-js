import express from "express";
import {
    getSettingsController,
    updateSettingsController,
} from "./settings.controller.js";

export const settingsRoutes = express.Router();

settingsRoutes.get("/", getSettingsController);
settingsRoutes.patch("/", updateSettingsController);
