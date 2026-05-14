import express from "express";
import { initDb, closeDb } from "./db-setup.js";
import { adminRoutes } from "./routes/admin/admin-routes.js";
import z from "zod";

const app = express();
const port = 8080;

initDb();

app.use(express.json());
app.use("/admin", adminRoutes);

app.use(
    (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        if (res.headersSent) {
            return next(err);
        }

        if (err instanceof z.ZodError) {
            return res
                .status(400)
                .json({ error: "Invalid input", issues: err.issues });
        }

        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    },
);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
