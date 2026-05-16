import { Router } from "express";
import {
    getOpeningHoursPerDayController,
    listOpeningHoursController,
    updateOpeningHoursController,
} from "./opening-hours.controller.js";

export const openingHoursRoutes = Router();

openingHoursRoutes.get("/", listOpeningHoursController);
openingHoursRoutes.get("/:weekday", getOpeningHoursPerDayController);
openingHoursRoutes.patch("/:weekday", updateOpeningHoursController);
