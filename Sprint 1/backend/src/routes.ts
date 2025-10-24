// import { bsonToJson, deleteExpiredTokens } from "./mongodb";
import { app } from "./main";
import MongoDB from "./mongodb";
import Security from "./security";

export class Routes {
    private mongo: MongoDB;
    private security: Security;

    constructor() {
        this.mongo = new MongoDB();
        this.security = new Security();
    }

    public registerRoutes() {
        app.get("/", (req, res) => {
            res.send("Hello World!");
        });
        
        // Route to check a user's login status
        app.get("/auth", (req, res) => {
            this.mongo.clearExpiredSessions();
            if(!req.header("Authorization")) {
                res.status(400).send("Missing Authorization Header");
                return;
            }
            // If the request includes a Bearer token, check the session ID instead of username/password
            if(req.header("Authorization")!.includes("Bearer ")) {
                const accessToken: string = req.header("Authorization")!.substring("Bearer ".length);
                this.mongo.checkSession(accessToken).then((result) => {
                    if(result) {
                        res.status(200).send("Valid Session");
                        return;
                    }
                    else {
                        res.status(401).send("Invalid Session. Please log in again to get a new session ID.");
                        return;
                    }
                })
                return; // Skip all other operations
            }

            // If the request does not include a Bearer token, use username/password authentication
            const creds: string[] = atob(req.header("Authorization")!.substring("Basic ".length)).split(":")
            const uname: string = creds[0]
            const pword: string = creds[1]
            this.mongo.checkCredentials(uname, pword).then(async (result) => {
                if(result) {
                    res.status(200).send((await this.mongo.registerNewSession(uname)));
                    return;
                }
                else {
                    res.status(401).send("Invalid Credentials");
                    return;
                }
            });
        });

        // Route to register a new user
        app.post("/auth", (req, res) => {
            console.log(req)
            this.mongo.registerNewUser(req.body.username, req.body.password).then(async (result) => {
                if(result) {
                    res.status(200).send((await this.mongo.registerNewSession(req.body.username)));
                }
                else {
                    res.status(500).send("Could not create new user");
                }
            });
        });
    }
}
