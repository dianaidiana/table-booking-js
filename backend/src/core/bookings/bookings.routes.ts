import { Router } from "express";
import {
    createBookingController,
    getBookingController,
    listBookingsController,
    updateBookingController,
} from "./bookings.controller.ts";

export const bookingsRoutes = Router();

bookingsRoutes.get("/", listBookingsController);
bookingsRoutes.get("/:id", getBookingController);
bookingsRoutes.post("/", createBookingController);
bookingsRoutes.patch("/:id", updateBookingController);
