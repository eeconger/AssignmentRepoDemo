import dotenv from "dotenv";
import { BSON, Collection, Db, Decimal128, Document, MongoClient, UpdateResult, WithId } from "mongodb";
import Security from "./security";
import { EmailAddress } from "./util";

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
        this.connectionURL = process.env.CONNECTION_STRING!
            .replace("<db_username>", process.env.USERNAME!)
            .replace("<db_password>", process.env.PASSWORD!);
        this.client = new MongoClient(this.connectionURL);
        this.client.connect();

        // Instantiate a security object for hashing/encryption
        this.security = new Security();
    }

    /**
     * @returns The equanimity database
     */
    public getDb(): Db {
        return this.client.db("equanimity");
    }

    /**
     * @returns The auth collection in the equanimity database
     */
    public getAuthCollection(): Collection<Document> {
        return this.getDb().collection("auth");
    }

    /**
     * @returns The userLogging collection in the equanimity database
     */
    public getUserLoggingCollection(): Collection<Document> {
        return this.getDb().collection("userLogging");
    }

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
     * @returns Promise that resolves to true if the access token is in the database
     *          and unexpired, false otherwise.
     */
    public async checkSession(accessToken: string): Promise<boolean> {
        // Clear expired sessions first, so if the accessToken is tied to an expired session it is marked as invalid
        await this.clearExpiredSessions();
        // Filter the activesessions document by the given accessToken
        return this.getAuthCollection().findOne({type: "activesessions"}, {projection: {[`list.${accessToken}`]: 1, _id: 0}}).then((result) => {
            // If the session is returned, return true. False otherwise.
            return result!.list[accessToken] ? true : false;
        })
    }

    /**
     * Registers a new user in the database
     * @param username plaintext username
     * @param password plaintext password
     * @return Promise that resolves to true if the user was successfully registered, false otherwise
     */
    public async registerNewUser(username: string, password: string, displayName: string, email: EmailAddress): Promise<boolean> {
        const salt = this.security.generateSalt();
        const hashedPassword = this.security.hash(password, salt);

        const userAlreadyExists = await this.getUserLoggingCollection().findOne({username: username}).then((result) => result !== null);
        if (userAlreadyExists) {
            return false;
        }

        const loggingId = await this.getUserLoggingCollection()
            .insertOne({
                // _id: new BSON.ObjectId(),
                username: username,
                preferredPositiveHabits: [],
                preferredNegativeHabits: [],
                preferredPositiveStates: [],
                preferredNegativeStates: [],
                data: []
            })
            .then((result) => result.insertedId);

        return this.getAuthCollection()
            .updateOne(
                {type: "userdef"},
                {
                    $set: {
                        [`list.${username}`]: {password: hashedPassword, salt: salt, displayName: displayName, email: email, loggingId: loggingId}
                    }
                }
            )
            .then((updateResult: UpdateResult) => {
                if (updateResult.modifiedCount === 1) {
                    return true;
                } else {
                    return false;
                }
            })
            .catch(() => false);
    }

    /**
     * Registers a new session for the given user
     * @param username plaintext username
     * @returns Promise that resolves to a session ID if the operation was successful, null otherwise
     */
    public async registerNewSession(username: string): Promise<string | null> {
        // 
        let issuedAt: Date = new Date();
        const expiresAt: Date = new Date(issuedAt.valueOf() + 1000 * 60 * 60 * 24 * 7); // (1000 * 60 * 60 * 24) * 7 === 7 days in ms

        // Check if the user has an existing session. If they do, accessToken becomes that session's ID.
        // Otherwise, generate a new access token for the user.
        const accessToken = await this.getAuthCollection()
            .findOne({type: "activesessions"})
            .then((result) => {
                return (
                    Object.keys(result!.list).find((key) => result!.list[key].username === username) || this.security.generateAccessToken()
                );
            });

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

    // Currently unused. Converts a BSON document to a JSON document.
    private bsonToJson(bson: WithId<Document>[]) {
        return bson.map((inputItem: WithId<Document>) => {
            let resultItem = {...inputItem};
            let keys = Object.keys(resultItem);
            for (let i = 0; i < Object.keys(resultItem).length; i++) {
                let currentKey = keys[i];
                if (resultItem[currentKey] instanceof BSON.BSONValue) {
                    // && resultItem[currentKey] !== null) {
                    console.log(resultItem[currentKey]);
                    if (resultItem[currentKey] instanceof Decimal128) {
                        console.log("passed");
                        resultItem[currentKey] = parseFloat(resultItem[currentKey].toString());
                    } else {
                        /* @ts-ignore: all relevant classes that implement BSONValue have .toJSON() */
                        resultItem[currentKey] = resultItem[currentKey].toJSON();
                    }
                }
            }
            console.log(resultItem);
            return resultItem;
            // return {...resultItem, _id: resultItem._id.toString()}
        });
    }
}