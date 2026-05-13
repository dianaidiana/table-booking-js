import express from "express";
import { initDb, closeDb } from "./db-setup.js";
import { adminRoutes } from "./routes/admin/admin-routes.js";

const app = express();
const port = 8080;

initDb();

app.use(express.json());
app.use("/admin", adminRoutes);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
