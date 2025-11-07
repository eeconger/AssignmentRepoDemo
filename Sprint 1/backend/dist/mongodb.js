"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_1 = require("mongodb");
const security_1 = __importDefault(require("./security"));
class MongoDB {
    connectionURL;
    client;
    security;
    /**
     * Creates a MongoDB object and connects to the MongoDB instance
     */
    constructor() {
        // Get environment variables from the .env file
        dotenv_1.default.config();
        // Connect to MongoDB
        this.connectionURL = process.env
            .CONNECTION_STRING.replace("<db_username>", process.env.USERNAME)
            .replace("<db_password>", process.env.PASSWORD);
        this.client = new mongodb_1.MongoClient(this.connectionURL);
        this.client.connect();
        // Instantiate a security object for hashing/encryption
        this.security = new security_1.default();
    }
    /**
     * @returns The equanimity database
     */
    getDb() {
        return this.client.db("equanimity");
    }
    /**
     * @returns The auth collection in the equanimity database
     */
    getAuthCollection() {
        return this.getDb().collection("auth");
    }
    /**
     * @returns The userLogging collection in the equanimity database
     */
    getUserLoggingCollection() {
        return this.getDb().collection("userLogging");
    }
    // ---------------------------------------------------
    /**
     * Checks if a plaintext username and password match a user in the database
     * @param username plaintext username
     * @param password plaintext password
     * @returns Promise that resolves to true if the username and password matched, false otherwise
     */
    async checkCredentials(username, password) {
        const user = (await this.getAuthCollection()
            .findOne({ type: "userdef" }, { projection: { [`list.${username}`]: 1, _id: 0 } })
            .then((result) => result?.list ?? null))[username];
        if (user) {
            return this.security.hash(password, user.salt) === user.password;
        }
        return false;
    }
    /**
     * Checks if a user's session is in the database
     * @param accessToken the unique access token assigned to the user at login
     * @returns Promise that resolves to the session username if the access token
     * is in the database and unexpired, empty string otherwise.
     */
    async checkSession(accessToken) {
        // Clear expired sessions first, so if the accessToken is tied to an expired session it is marked as invalid
        await this.clearExpiredSessions();
        // Filter the activesessions document by the given accessToken
        return this.getAuthCollection()
            .findOne({ type: "activesessions" }, { projection: { [`list.${accessToken}`]: 1, _id: 0 } })
            .then((result) => {
            // If the session is returned, return true. False otherwise.
            return result.list[accessToken]
                ? result.list[accessToken].username
                : null;
        });
    }
    /**
     * Registers a new user in the database
     * @param username plaintext username
     * @param password plaintext password
     * @return Promise that resolves to true if the user was successfully registered, false otherwise
     */
    async registerNewUser(username, password) {
        // Hash the password before storing it on the database for security.
        // Keep the salt so we can store it alongside the hash for logins.
        const salt = this.security.generateSalt();
        const hashedPassword = this.security.hash(password, salt);
        // Check if the user already exists, then exit the function with a failure if they do.
        // Criterion for user existing: a userLogging document exists with the given username.
        const userAlreadyExists = await this.getUserLoggingCollection()
            .findOne({ username: username })
            .then((result) => result !== null);
        if (userAlreadyExists || username.includes(".") || username.includes(" ")) {
            return false; // This will end the function early, and only runs if the user exists or the username is invalid
        }
        // Create a userLogging document for the user, and store the ID so we can reference it in their userdef
        const loggingId = await this.getUserLoggingCollection()
            .insertOne({
            username: username,
            preferredPositiveHabits: [],
            preferredNegativeHabits: [],
            preferredPositiveStates: [],
            preferredNegativeStates: [],
            data: [],
        })
            .then((result) => result.insertedId);
        // Add the user to the auth collection in the userdef document. Userdef includes the following info:
        // Username, hashed password, salt for the hash, display name, email, ID of the user's logging document
        return this.getAuthCollection()
            .updateOne({ type: "userdef" }, {
            $set: {
                [`list.${username}`]: {
                    password: hashedPassword,
                    salt: salt,
                    loggingId: loggingId,
                },
            },
        })
            .then((updateResult) => {
            // If we successfully modified the document, return true. Otherwise there's an error.
            if (updateResult.modifiedCount === 1) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    /**
     * Updates the user's profile data in the userLogging collection.
     * @param username The user's username identifier.
     * @param data An object containing fields to update (e.g., displayName, states, habits).
     * @returns Promise that resolves to true if the update was successful, false otherwise.
     */
    async updateUserProfile(username, data) {
        // Filter out undefined values to only $set what is provided
        const updatePayload = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
        const updateResult = await this.getUserLoggingCollection().updateOne({ username: username }, { $set: updatePayload }, { upsert: false } // Profile should already exist
        );
        // Return true if the document was modified
        return updateResult.modifiedCount === 1;
    }
    /**
     * Retrieves the user's profile data from the userLogging collection.
     * @param username The user's username identifier.
     * @returns Promise that resolves to the user profile object, or null if not found.
     */
    async getUserProfile(username) {
        const userProfile = await this.getUserLoggingCollection().findOne({ username: username }, { projection: { _id: 0 } } // Exclude MongoDB's _id field
        );
        if (!userProfile) {
            return null;
        }
        // Return profile with default values for missing fields
        return {
            email: userProfile.username,
            displayName: userProfile.displayName || "",
            onboardingComplete: userProfile.onboardingComplete || false,
            positiveStates: userProfile.preferredPositiveStates || [],
            negativeStates: userProfile.preferredNegativeStates || [],
            positiveHabits: userProfile.preferredPositiveHabits || [],
            negativeHabits: userProfile.preferredNegativeHabits || [],
        };
    }
    /**
     * Retrieves the username associated with a given active access token.
     * @param accessToken the unique access token assigned to the user at login
     * @returns Promise that resolves to the username string, or null if the session is invalid/expired.
     */
    async getUserBySession(accessToken) {
        await this.clearExpiredSessions();
        const session = await this.getAuthCollection().findOne({ type: "activesessions" }, { projection: { [`list.${accessToken}`]: 1, _id: 0 } });
        if (session &&
            session.list &&
            session.list[accessToken] &&
            session.list[accessToken].username) {
            return session.list[accessToken].username;
        }
        return null;
    }
    /**
     * Registers a new session for the given user
     * @param username plaintext username
     * @returns Promise that resolves to a session ID if the operation was successful, null otherwise
     */
    async registerNewSession(username) {
        let issuedAt = new Date();
        const expiresAt = new Date(issuedAt.valueOf() + 1000 * 60 * 60 * 24 * 7); // 7 days in ms
        const accessToken = await this.getAuthCollection()
            .findOne({ type: "activesessions" })
            .then((result) => {
            return ((result &&
                Object.keys(result.list).find((key) => result.list[key].username === username)) ||
                this.security.generateAccessToken());
        });
        // Add a session to the auth collection in the activesessions document. Activesessions includes the following info:
        // Username, issue date and time, expiration date and time.
        return await this.getAuthCollection()
            .updateOne({ type: "activesessions" }, {
            $set: {
                [`list.${accessToken}`]: {
                    username: username,
                    issuedAt: issuedAt.toISOString(),
                    expiresAt: expiresAt.toISOString(),
                },
            },
        })
            .then((result) => {
            // If we successfully modified the document, return the new accessToken. Otherwise there's an error.
            if (result.modifiedCount === 1) {
                return accessToken;
            }
            else {
                return null;
            }
        });
    }
    /**
     * Clears sessions where expiresAt is before the current time
     */
    async clearExpiredSessions() {
        let collection = this.getAuthCollection();
        collection.updateOne({ type: "activesessions" }, [
            {
                $set: {
                    list: {
                        $arrayToObject: {
                            $filter: {
                                input: {
                                    $objectToArray: "$list",
                                },
                                as: "session",
                                // "condition: session expires at is greater than right now"
                                cond: {
                                    $gt: [{ $toDate: "$$session.v.expiresAt" }, new Date()],
                                },
                            },
                        },
                    },
                },
            },
        ]);
    }
    // Currently unused.
    bsonToJson(bson) {
        return bson.map((inputItem) => {
            let resultItem = { ...inputItem };
            let keys = Object.keys(resultItem);
            for (let i = 0; i < Object.keys(resultItem).length; i++) {
                let currentKey = keys[i];
                if (resultItem[currentKey] instanceof mongodb_1.BSON.BSONValue) {
                    if (resultItem[currentKey] instanceof mongodb_1.Decimal128) {
                        resultItem[currentKey] = parseFloat(resultItem[currentKey].toString());
                    }
                    else {
                        /* @ts-ignore */
                        resultItem[currentKey] = resultItem[currentKey].toJSON();
                    }
                }
            }
            return resultItem;
        });
    }
}
exports.default = MongoDB;
//# sourceMappingURL=mongodb.js.map