import { Router } from "express";
import {
    cancelBookingController,
    completeBookingController,
    confirmBookingController,
    getAvailableSlotsController,
    getBookingDetailsController,
} from "./customer.controller.ts";

export const customerRoutes = Router();

customerRoutes.get("/", getAvailableSlotsController);
customerRoutes.post("/", completeBookingController);
customerRoutes.get("/:bookingSecret", getBookingDetailsController);
customerRoutes.patch("/:bookingSecret/confirm", confirmBookingController);
customerRoutes.patch("/:bookingSecret/cancel", cancelBookingController);
