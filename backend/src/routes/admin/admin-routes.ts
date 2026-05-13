import express from "express";
import { settingsRoutes } from "./settings-routes.js";

export const adminRoutes = express.Router();

adminRoutes.get("/", (req, res) => {
    res.send("Admin dashboard");
});

adminRoutes.use("/settings", settingsRoutes);
