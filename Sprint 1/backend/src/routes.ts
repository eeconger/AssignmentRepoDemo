import { bsonToJson } from "./mongodb.ts";
import { app } from "./main.ts";

app.get("/", (req, res) => {
    res.send("Hello World!");
});