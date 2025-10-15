import express from "express";
import { insertMany } from "./mongodb.ts";

export const app = express();

const port = 8080;

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

