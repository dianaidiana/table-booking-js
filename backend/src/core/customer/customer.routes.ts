import { Router } from "express";
import {
    completeBookingController,
    getAvailableSlotsController,
} from "./customer.controller.ts";

export const customerRoutes = Router();

customerRoutes.get("/", getAvailableSlotsController);
customerRoutes.post("/", completeBookingController);
