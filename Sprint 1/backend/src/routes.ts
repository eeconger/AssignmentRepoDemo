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
        // Route to check a user's login status
        app.get("/auth", (req, res) => {
            // If no Authorization header was provided, we can't authenticate!
            // Send back an error in that case.
            if(!req.header("Authorization")) {
                res.status(400).send("Malformed request: missing authorization header.");
                return;
            }

            // If the request includes a Bearer token, check the session ID instead of username/password
            if(req.header("Authorization")!.includes("Bearer ")) {
                const accessToken: string = req.header("Authorization")!.substring("Bearer ".length);
                this.mongo.checkSession(accessToken).then((result) => {
                    if(result) {
                        res.status(200).send();
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

            // Check if the username and password match.
            // If successful, generate an accessToken for future requests and send it back to the user.
            this.mongo.checkCredentials(uname, pword).then(async (result) => {
                if(result) {
                    res.status(200).send((await this.mongo.registerNewSession(uname)));
                    return;
                }
                else {
                    res.status(401).send("Invalid credentials.");
                    return;
                }
            });
        });

        // Route to register a new user
        app.post("/auth", (req, res) => {
            // Verify that the request contained all of the required fields. If not, send back an error.
            if(!req.body.username || !req.body.password || !req.body.displayName || !req.body.email) {
                res.status(400).send("Malformed request: missing required fields. Ensure you include username, password, displayName, and email.");
                return; // Skip the rest of the function to avoid duplicate .send() clauses
            }

            // Register a new user with the information given in the request.
            // If successful, generate an accessToken for future requests and send it back to the user.
            this.mongo.registerNewUser(req.body.username, req.body.password, req.body.displayName, req.body.email).then(async (result) => {
                if(result) {
                    res.status(200).send((await this.mongo.registerNewSession(req.body.username)));
                }
                else {
                    res.status(500).send("Could not create a new user. Either that username is taken, or one of the fields is invalid (example: spaces or periods in the username).");
                }
            });
        });
    }
}
