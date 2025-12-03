import dotenv from "dotenv";
import {MongoClient, BSON, Decimal128, Collection, WithId, UpdateResult} from "mongodb";
import Security from "./security";

export default class MongoDB {
    private connectionURL: string;
    private client: MongoClient;
    private security: Security;

    /**
     * Creates a MongoDB object and connects to the MongoDB instance
     */
    constructor() {
        // Get environment variables from the .env file
        dotenv.config();

        // Connect to MongoDB
        this.connectionURL = process.env
            .CONNECTION_STRING!.replace("<db_username>", process.env.USERNAME!)
            .replace("<db_password>", process.env.PASSWORD!);
        this.client = new MongoClient(this.connectionURL);
        this.client.connect();

        // Instantiate a security object for hashing/encryption
        this.security = new Security();
    }

    /**
     * @returns The equanimity database
     */
    public getDb() {
        return this.client.db("equanimity");
    }

    /**
     * @returns The auth collection in the equanimity database
     */
    public getAuthCollection() {
        return this.getDb().collection("auth");
    }

    /**
     * @returns The userLogging collection in the equanimity database
     */
    public getUserLoggingCollection(): Collection {
        return this.getDb().collection("userLogging");
    }
    // ---------------------------------------------------

    /**
     * Checks if a plaintext username and password match a user in the database
     * @param username plaintext username
     * @param password plaintext password
     * @returns Promise that resolves to true if the username and password matched, false otherwise
     */
    public async checkCredentials(username: string, password: string): Promise<boolean> {
        const user: WithId<BSON.Document> | null = (
            await this.getAuthCollection()
                .findOne({type: "userdef"}, {projection: {[`list.${username}`]: 1, _id: 0}})
                .then((result) => result?.list ?? null)
        )[username];
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
    public async checkSession(accessToken: string): Promise<string> {
        // Clear expired sessions first, so if the accessToken is tied to an expired session it is marked as invalid
        await this.clearExpiredSessions();
        // Filter the activesessions document by the given accessToken
        return this.getAuthCollection()
            .findOne({type: "activesessions"}, {projection: {[`list.${accessToken}`]: 1, _id: 0}})
            .then((result) => {
                // If the session is returned, return true. False otherwise.
                return result!.list[accessToken] ? result!.list[accessToken].username : null;
            });
    }

    /**
     * Registers a new user in the database
     * @param username plaintext username
     * @param password plaintext password
     * @return Promise that resolves to true if the user was successfully registered, false otherwise
     */
    public async registerNewUser(username: string, password: string): Promise<boolean> {
        // Hash the password before storing it on the database for security.
        // Keep the salt so we can store it alongside the hash for logins.
        const salt = this.security.generateSalt();
        const hashedPassword = this.security.hash(password, salt);

        // Check if the user already exists, then exit the function with a failure if they do.
        // Criterion for user existing: a userLogging document exists with the given username.
        const userAlreadyExists = await this.getUserLoggingCollection()
            .findOne({username: username})
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
                data: []
            })
            .then((result) => result.insertedId);

        // Add the user to the auth collection in the userdef document. Userdef includes the following info:
        // Username, hashed password, salt for the hash, display name, email, ID of the user's logging document
        return this.getAuthCollection()
            .updateOne(
                {type: "userdef"},
                {
                    $set: {
                        [`list.${username}`]: {
                            password: hashedPassword,
                            salt: salt,
                            loggingId: loggingId
                        }
                    }
                }
            )
            .then((updateResult: UpdateResult) => {
                // If we successfully modified the document, return true. Otherwise there's an error.
                if (updateResult.modifiedCount === 1) {
                    return true;
                } else {
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
    public async updateUserProfile(username: string, data: any): Promise<boolean> {
        // Filter out undefined values to only $set what is provided
        const updatePayload = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));

        const updateResult = await this.getUserLoggingCollection().updateOne(
            {username: username},
            {$set: updatePayload},
            {upsert: false} // Profile should already exist
        );

        // Return true if the document was modified
        return updateResult.modifiedCount === 1;
    }

    /**
     * Adds a new activity log object to the 'data' array in the user's document
     * within the userLogging collection.
     * @param username The user's username identifier.
     * @param data The object to be pushed into the 'data' array (e.g., mood, habit, or food log).
     * @returns Promise that resolves to true if the document was successfully updated, false otherwise.
     */
    public async logUserActivity(username: string, data: any): Promise<boolean> {
        // Ensure the object we push includes a timestamp if it doesn't already,
        // to track when the activity was logged.
        const logEntry = {
            ...data,
            loggedAt: new Date()
        };

        const updateResult = await this.getUserLoggingCollection().updateOne(
            {username: username},
            // $push appends an item to an array field.
            {$push: {data: logEntry}},
            {upsert: false} // The user document should already exist from sign-up
        );

        // Return true if the document was modified (i.e., the item was pushed)
        return updateResult.modifiedCount === 1;
    }

    /**
     * Retrieves the user's profile data from the userLogging collection.
     * @param username The user's username identifier.
     * @returns Promise that resolves to the user profile object, or null if not found.
     */
    public async getUserProfile(username: string): Promise<any | null> {
        const userProfile = await this.getUserLoggingCollection().findOne(
            {username: username},
            {projection: {_id: 0}} // Exclude MongoDB's _id field
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
            negativeHabits: userProfile.preferredNegativeHabits || []
        };
    }

    /**
     * Retrieves the username associated with a given active access token.
     * @param accessToken the unique access token assigned to the user at login
     * @returns Promise that resolves to the username string, or null if the session is invalid/expired.
     */
    public async getUserBySession(accessToken: string): Promise<string | null> {
        await this.clearExpiredSessions();
        const session = await this.getAuthCollection().findOne(
            {type: "activesessions"},
            {projection: {[`list.${accessToken}`]: 1, _id: 0}}
        );
        if (session && session.list && session.list[accessToken] && session.list[accessToken].username) {
            return session.list[accessToken].username;
        }
        return null;
    }

    /**
     * Registers a new session for the given user
     * @param username plaintext username
     * @returns Promise that resolves to a session ID if the operation was successful, null otherwise
     */
    public async registerNewSession(username: string): Promise<string | null> {
        let issuedAt = new Date();
        const expiresAt = new Date(issuedAt.valueOf() + 1000 * 60 * 60 * 24 * 7); // 7 days in ms

        const accessToken = await this.getAuthCollection()
            .findOne({type: "activesessions"})
            .then((result) => {
                return (
                    (result && Object.keys(result.list).find((key) => result.list[key].username === username)) ||
                    this.security.generateAccessToken()
                );
            });

        // Add a session to the auth collection in the activesessions document. Activesessions includes the following info:
        // Username, issue date and time, expiration date and time.
        return await this.getAuthCollection()
            .updateOne(
                {type: "activesessions"},
                {
                    $set: {
                        [`list.${accessToken}`]: {
                            username: username,
                            issuedAt: issuedAt.toISOString(),
                            expiresAt: expiresAt.toISOString()
                        }
                    }
                }
            )
            .then((result) => {
                // If we successfully modified the document, return the new accessToken. Otherwise there's an error.
                if (result.modifiedCount === 1) {
                    return accessToken;
                } else {
                    return null;
                }
            });
    }

    /**
     * Clears sessions where expiresAt is before the current time
     */
    public async clearExpiredSessions() {
        let collection = this.getAuthCollection();
        collection.updateOne({type: "activesessions"}, [
            {
                $set: {
                    list: {
                        $arrayToObject: {
                            $filter: {
                                input: {
                                    $objectToArray: "$list"
                                },
                                as: "session",
                                // "condition: session expires at is greater than right now"
                                cond: {
                                    $gt: [{$toDate: "$$session.v.expiresAt"}, new Date()]
                                }
                            }
                        }
                    }
                }
            }
        ]);
    }

    /**
     * Retrieves aggregated log data for correlation analysis between habits/food and mood.
     * The result is an array of documents, each representing a single logged entry,
     * normalized for easy processing on the frontend.
     *
     * @param username The user's username identifier.
     * @returns Promise that resolves to an array of normalized log entries.
     */
    public async getCorrelationData(username: string): Promise<any[]> {
        const pipeline = [
            // 1. Find the specific user document
            {$match: {username: username}},
            // 2. Deconstruct the 'data' array into individual documents (one per log entry)
            {$unwind: "$data"},
            // 3. Project the necessary fields into a cleaner structure
            {$project: {
                _id: 0,
                // Mood: Extract the positiveStates and negativeStates objects
                // These will be used in the TypeScript mapping below to calculate the score accurately.
                positiveStates: "$data.positiveStates",
                negativeStates: "$data.negativeStates",

                // Habits: Keep the array of habit names
                positiveHabits: "$data.positiveHabits",
                negativeHabits: "$data.negativeHabits",

                // Food: Calculate the correct weighted total servings for each food group
                foodServings: {
                    vegetables: {$sum: [
                        "$data.meal.data.vegetables.fist",
                        {$multiply: [{$ifNull: ["$data.meal.data.vegetables.palm", 0]}, 0.5]},
                        {$multiply: [{$ifNull: ["$data.meal.data.vegetables.thumb", 0]}, 0.25]}
                    ]},
                    protein: {$sum: [
                        "$data.meal.data.protein.fist",
                        {$multiply: [{$ifNull: ["$data.meal.data.protein.palm", 0]}, 0.5]},
                        {$multiply: [{$ifNull: ["$data.meal.data.protein.thumb", 0]}, 0.25]}
                    ]},
                    grains: {$sum: [
                        "$data.meal.data.grains.fist",
                        {$multiply: [{$ifNull: ["$data.meal.data.grains.palm", 0]}, 0.5]},
                        {$multiply: [{$ifNull: ["$data.meal.data.grains.thumb", 0]}, 0.25]}
                    ]},
                    dairy: {$sum: [
                        "$data.meal.data.dairy.fist",
                        {$multiply: [{$ifNull: ["$data.meal.data.dairy.palm", 0]}, 0.5]},
                        {$multiply: [{$ifNull: ["$data.meal.data.dairy.thumb", 0]}, 0.25]}
                    ]},
                    fruits: {$sum: [
                        "$data.meal.data.fruits.fist",
                        {$multiply: [{$ifNull: ["$data.meal.data.fruits.palm", 0]}, 0.5]},
                        {$multiply: [{$ifNull: ["$data.meal.data.fruits.thumb", 0]}, 0.25]}
                    ]},
                },

                // Timestamp for sequencing
                loggedAt: "$data.loggedAt"
            }},
            // 4. Sort by timestamp (optional but good practice)
            {$sort: {loggedAt: 1}}
        ];

        // Execute the pipeline and return the results as an array
        const result = await this.getUserLoggingCollection().aggregate(pipeline).toArray();

        // Final processing in TypeScript to calculate the Net Mood Score
        return result.map(entry => {
            // Calculate total positive score (sum of all values in the object)
            const rawPositiveScore = Object.values(entry.positiveStates || {}).reduce((sum: number, score: any) => sum + (score || 0), 0);
            
            // Calculate total negative score (sum of all values in the object)
            const rawNegativeScore = Object.values(entry.negativeStates || {}).reduce((sum: number, score: any) => sum + (score || 0), 0);
            
            return {
                timestamp: entry.loggedAt,
                foodServings: entry.foodServings,
                positiveHabits: entry.positiveHabits || [],
                negativeHabits: entry.negativeHabits || [],
                // Net Mood Score is the primary value for correlation
                netMoodScore: rawPositiveScore - rawNegativeScore,
                rawPositiveScore: rawPositiveScore,
                rawNegativeScore: rawNegativeScore,
            };
        });
        
    }


    // Currently unused.
    public bsonToJson(bson: any[]): any[] {
        return bson.map((inputItem) => {
            let resultItem = {...inputItem};
            let keys = Object.keys(resultItem);
            for (let i = 0; i < Object.keys(resultItem).length; i++) {
                let currentKey = keys[i];
                if (resultItem[currentKey] instanceof BSON.BSONValue) {
                    if (resultItem[currentKey] instanceof Decimal128) {
                        resultItem[currentKey] = parseFloat(resultItem[currentKey].toString());
                    } else {
                        /* @ts-ignore */
                        resultItem[currentKey] = resultItem[currentKey].toJSON();
                    }
                }
            }
            return resultItem;
        });
    }
}
