"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Routes = void 0;
const mongodb_1 = __importDefault(require("./mongodb"));
const security_1 = __importDefault(require("./security"));
class Routes {
    mongo;
    security;
    constructor() {
        this.mongo = new mongodb_1.default();
        this.security = new security_1.default();
    }
    registerRoutes(app) {
        app.get("/", (req, res) => {
            res.send("Hello World!");
        });
        // Route to check a user's login status
        app.get("/auth", (req, res) => {
            this.mongo.clearExpiredSessions();
            if (!req.header("Authorization")) {
                res.status(400).send("Missing Authorization Header");
                return;
            }
            // If the request includes a Bearer token, check the session ID instead of username/password
            if (req.header("Authorization").includes("Bearer ")) {
                const accessToken = req
                    .header("Authorization")
                    .substring("Bearer ".length);
                this.mongo.checkSession(accessToken).then((result) => {
                    if (result) {
                        res.status(200).send("Valid Session");
                        return;
                    }
                    else {
                        res
                            .status(401)
                            .send("Invalid Session. Please log in again to get a new session ID.");
                        return;
                    }
                });
                return; // Skip all other operations
            }
            // If the request does not include a Bearer token, use username/password authentication
            const creds = atob(req.header("Authorization").substring("Basic ".length)).split(":");
            const uname = creds[0];
            const pword = creds[1];
            this.mongo.checkCredentials(uname, pword).then(async (result) => {
                if (result) {
                    res.status(200).send(await this.mongo.registerNewSession(uname));
                    return;
                }
                else {
                    res.status(401).send("Invalid Credentials");
                    return;
                }
            });
        });
        // Route to register a new user (UC01: Basic Path Step 2)
        app.post("/auth", (req, res) => {
            const { username, email, password, termsAccepted } = req.body;
            // TODO: These checks should happen on the frontend
            // Enforce BR01 - Password minimum (E01)
            if (!password || password.length < 12) {
                return res.status(400).send("Password must be at least 12 characters."); // [E01]
            }
            // TODO: These checks should happen on the frontend
            // Enforce BR03 - Terms & Conditions must be accepted
            if (termsAccepted !== true) {
                return res.status(400).send("Terms & Conditions must be accepted.");
            }
            this.mongo
                .registerNewUser(username, password)
                .then(async (result) => {
                if (result) {
                    res.status(200).send(await this.mongo.registerNewSession(username));
                }
                else {
                    // Could not create new user (e.g., username already exists)
                    res
                        .status(409)
                        .send("A user with that email/username already exists.");
                }
            })
                .catch(() => res.status(500).send("Server error during registration."));
        });
        // Route to get user profile data for dashboard
        app.get("/profile", (req, res) => {
            const authHeader = req.header("Authorization");
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).send("Unauthorized: Missing Bearer token.");
            }
            const accessToken = authHeader.substring("Bearer ".length);
            this.mongo
                .getUserBySession(accessToken)
                .then(async (userEmail) => {
                if (!userEmail) {
                    return res.status(401).send("Invalid or expired session.");
                }
                const userProfile = await this.mongo.getUserProfile(userEmail);
                if (userProfile) {
                    res.status(200).json(userProfile);
                }
                else {
                    res.status(404).send("User profile not found.");
                }
            })
                .catch(() => res.status(500).send("Server error retrieving profile."));
        });
        //Handle remaining onboarding steps (UC01: Basic Path Steps 4-10)
        app.put("/profile/onboarding", (req, res) => {
            const { displayName, positiveStates, negativeStates, positiveHabits, negativeHabits, } = req.body;
            const authHeader = req.header("Authorization");
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).send("Unauthorized: Missing Bearer token.");
            }
            const accessToken = authHeader.substring("Bearer ".length);
            // 1. Check authorization and get user email
            this.mongo
                .getUserBySession(accessToken)
                .then(async (userEmail) => {
                if (!userEmail) {
                    return res.status(401).send("Invalid or expired session.");
                }
                // 2. Enforce BR02: Positive states minimum (E02)
                if (positiveStates && positiveStates.length < 3) {
                    return res
                        .status(400)
                        .send("Positive states require at least 3 selections."); // [E02]
                }
                // 3. Get current user profile to check completeness
                const currentProfile = await this.mongo.getUserProfile(userEmail);
                // 4. Update User Profile with submitted data
                const updatePayload = {
                    displayName: displayName, // Step 4
                    preferredPositiveStates: positiveStates, // Step 5
                    preferredNegativeStates: negativeStates, // Step 6
                    preferredPositiveHabits: positiveHabits, // Step 7
                    preferredNegativeHabits: negativeHabits, // Step 8
                };
                // 5. Check if onboarding should be marked complete
                const finalDisplayName = displayName || currentProfile?.displayName;
                const finalPositiveStates = positiveStates || currentProfile?.positiveStates;
                const finalNegativeStates = negativeStates || currentProfile?.negativeStates;
                const finalPositiveHabits = positiveHabits || currentProfile?.positiveHabits;
                const finalNegativeHabits = negativeHabits || currentProfile?.negativeHabits;
                if (finalDisplayName &&
                    finalPositiveStates &&
                    finalPositiveStates.length >= 3 &&
                    finalNegativeStates &&
                    finalNegativeStates.length > 0 &&
                    finalPositiveHabits &&
                    finalPositiveHabits.length > 0 &&
                    finalNegativeHabits &&
                    finalNegativeHabits.length > 0) {
                    updatePayload.onboardingComplete = true;
                }
                const updateSuccessful = await this.mongo.updateUserProfile(userEmail, updatePayload);
                if (updateSuccessful) {
                    res.status(200).send("Onboarding profile updated successfully.");
                }
                else {
                    res.status(500).send("Failed to update user profile.");
                }
            })
                .catch(() => res.status(500).send("Server error during profile update."));
        });
    }
}
exports.Routes = Routes;
//# sourceMappingURL=routes.js.map