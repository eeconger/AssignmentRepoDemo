// import { bsonToJson, deleteExpiredTokens } from "./mongodb";
import { Application } from "express";
import MongoDB from "./mongodb";
import Security from "./security";

export class Routes {
  private mongo: MongoDB;
  private security: Security;

  constructor() {
    this.mongo = new MongoDB();
    this.security = new Security();
  }

  public registerRoutes(app: Application) {
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
      if (req.header("Authorization")!.includes("Bearer ")) {
        const accessToken: string = req
          .header("Authorization")!
          .substring("Bearer ".length);
        this.mongo.checkSession(accessToken).then((result) => {
          if (result) {
            res.status(200).send("Valid Session");
            return;
          } else {
            res
              .status(401)
              .send(
                "Invalid Session. Please log in again to get a new session ID."
              );
            return;
          }
        });
        return; // Skip all other operations
      }

      // If the request does not include a Bearer token, use username/password authentication
      const creds: string[] = atob(
        req.header("Authorization")!.substring("Basic ".length)
      ).split(":");
      const uname: string = creds[0];
      const pword: string = creds[1];
      this.mongo.checkCredentials(uname, pword).then(async (result) => {
        if (result) {
          res.status(200).send(await this.mongo.registerNewSession(uname));
          return;
        } else {
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
        .registerNewUser(username, email, password)
        .then(async (result) => {
          if (result) {
            res.status(200).send(await this.mongo.registerNewSession(username));
          } else {
            // Could not create new user (e.g., username already exists)
            res
              .status(409)
              .send("A user with that username already exists.");
          }
        })
        .catch(() => res.status(500).send("Server error during registration."));
    });

    //Handle remaining onboarding steps (UC01: Basic Path Steps 4-10)
    app.put("/profile/onboarding", (req, res) => {
      const {
        displayName,
        positiveStates,
        negativeStates,
        positiveHabits,
        negativeHabits,
      } = req.body;

      const authHeader = req.header("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send("Unauthorized: Missing Bearer token.");
      }
      const accessToken: string = authHeader.substring("Bearer ".length);

      // 1. Check authorization and get user email
      this.mongo
        .checkSession(accessToken)
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

          // 3. Update User Profile with submitted data
          const updatePayload = {
            displayName: displayName, // Step 4
            preferredPositiveStates: positiveStates, // Step 5
            preferredNegativeStates: negativeStates, // Step 6
            preferredPositiveHabits: positiveHabits, // Step 7
            preferredNegativeHabits: negativeHabits, // Step 8
            // Mark onboarding complete if all fields are present (simplified check)
            onboardingComplete:
              displayName &&
              positiveStates &&
              positiveStates.length >= 3 &&
              negativeStates &&
              positiveHabits &&
              negativeHabits
                ? true
                : undefined, // Set to true only on the final step
          };

          const updateSuccessful = await this.mongo.updateUserProfile(
            userEmail,
            updatePayload
          );

          if (updateSuccessful) {
            res.status(200).send("Onboarding profile updated successfully.");
          } else {
            res.status(500).send("Failed to update user profile.");
          }
        })
        .catch(() =>
          res.status(500).send("Server error during profile update.")
        );
    });
  }
}
