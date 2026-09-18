import { Router } from "express";
import { customerRoutes as customerBookingRoutes } from "../../core/customer/customer.routes.ts";

export const customerRoutes = Router();

customerRoutes.use("/", customerBookingRoutes);
