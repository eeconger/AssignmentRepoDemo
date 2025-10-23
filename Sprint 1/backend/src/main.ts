import express from "express";
import { Routes } from "./routes";
// import { insertMany } from "./mongodb";

export const app = express();
app.use(express.json())
new Routes();

const port = 3000;

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

// Register routes