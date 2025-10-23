// import { bsonToJson, deleteExpiredTokens } from "./mongodb";
import { app } from "./main";
import MongoDB from "./mongodb";

export class Routes {
    mongo: MongoDB;

    constructor() {
        this.mongo = new MongoDB();
        this.registerRoutes();
        // this.mongo.checkCredentials("hello", "world").then((result) => console.log(result));
    }

    private registerRoutes() {
        app.get("/", (req, res) => {
            res.send("Hello World!");
        });
        
        app.get("/auth", (req, res) => {
            // deleteExpiredTokens()
            const creds = atob(req.header("Authorization")!.substring("Basic ".length))
            const uname: string = creds.split(":")[0]
            const pword: string = creds.split(":")[1]
            console.log(uname, pword)
            this.mongo.checkCredentials(uname, pword).then((result) => {
                if(result) {
                    res.status(200).send(this.mongo.generateAccessToken());
                }
                else {
                    res.status(401).send("Invalid Credentials");
                }
            });
        });

        app.post("/auth", (req, res) => {
            console.log(req)
            this.mongo.registerNewUser(req.body.username, req.body.password).then((result) => {
                if(result) {
                    res.status(200).send(result);
                }
                else {
                    res.status(500).send("Could not create new user.");
                }
            });
        });

    }

}
