import dotenv from "dotenv";
import { MongoClient, BSON, Decimal128, Collection } from "mongodb";
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

  // --- Dedicated collection for user profiles ---
  /**
   * @returns The users collection in the equanimity database
   */
  public getUsersCollection(): Collection {
    return this.getDb().collection("users");
  }
  // ---------------------------------------------------

  /**
   * Checks if a plaintext username and password match a user in the database
   * @param username plaintext username
   * @param password plaintext password
   * @returns Promise that resolves to true if the username and password matched, false otherwise
   */
  public async checkCredentials(
    username: string,
    password: string
  ): Promise<boolean> {
    const user = (
      await this.getAuthCollection()
        .findOne(
          { type: "userdef" },
          { projection: { [`list.${username}`]: 1, _id: 0 } }
        )
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
   * and unexpired, false otherwise.
   */
  public async checkSession(accessToken: string): Promise<boolean> {
    // Clear expired sessions first
    await this.clearExpiredSessions();

    // Filter the activesessions document by the given accessToken
    return this.getAuthCollection()
      .findOne(
        { type: "activesessions" },
        { projection: { [`list.${accessToken}`]: 1, _id: 0 } }
      )
      .then((result) => {
        // If the session is returned, return true. False otherwise.
        return result && result.list[accessToken] ? true : false;
      });
  }

  // --- Function to get the username from an active session ---
  /**
   * Retrieves the username associated with a given active access token.
   * @param accessToken the unique access token assigned to the user at login
   * @returns Promise that resolves to the username string, or null if the session is invalid/expired.
   */
  public async getUserBySession(accessToken: string): Promise<string | null> {
    await this.clearExpiredSessions();
    const session = await this.getAuthCollection().findOne(
      { type: "activesessions" },
      { projection: { [`list.${accessToken}`]: 1, _id: 0 } }
    );
    if (
      session &&
      session.list &&
      session.list[accessToken] &&
      session.list[accessToken].username
    ) {
      return session.list[accessToken].username;
    }
    return null;
  }
  // -------------------------------------------------------------

  /**
   * Registers a new user in the database
   * @param username plaintext username (used as email in UC01 context)
   * @param password plaintext password
   * @return Promise that resolves to true if the user was successfully registered, false otherwise
   */
  public async registerNewUser(
    username: string,
    password: string
  ): Promise<boolean> {
    // We check the 'users' collection since 'email' is the unique identifier there.
    try {
      const existingUser = await this.getUsersCollection().findOne({
        email: username,
      });

      // If a user with this email already exists, reject the registration.
      if (existingUser) {
        console.warn(
          `Registration rejected: Email ${username} already exists.`
        );
        return false;
      }
    } catch (error) {
      console.error("Error checking for existing user:", error);
      return false;
    }

    // 2. IF USER DOES NOT EXIST, PROCEED WITH REGISTRATION
    const salt = this.security.generateSalt();
    const hashedPassword = this.security.hash(password, salt);

    try {
      // A. Insert authentication data into the 'auth' collection
      const authUpdateResult = await this.getAuthCollection().updateOne(
        { type: "userdef" },
        {
          $set: {
            [`list.${username}`]: { password: hashedPassword, salt: salt },
          },
        }
      );

      // B. Initialize a user profile document in the 'users' collection
      if (authUpdateResult.modifiedCount === 1) {
        const userProfileInsertResult =
          await this.getUsersCollection().insertOne({
            email: username, // Use username as the primary key/identifier
            onboardingComplete: false,
          });
        return userProfileInsertResult.acknowledged; // True if both operations succeeded
      }
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  }

  // --- Function to update the user profile data during onboarding ---
  /**
   * Updates the user's profile data in the dedicated 'users' collection.
   * @param email The user's email/username identifier.
   * @param data An object containing fields to update (e.g., displayName, states, habits).
   * @returns Promise that resolves to true if the update was successful, false otherwise.
   */
  public async updateUserProfile(email: string, data: any): Promise<boolean> {
    // Filter out undefined values to only $set what is provided
    const updatePayload = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    const updateResult = await this.getUsersCollection().updateOne(
      { email: email },
      { $set: updatePayload },
      { upsert: false } // Profile should already exist
    );

    // Return true if the document was modified
    return updateResult.modifiedCount === 1;
  }
  // ---------------------------------------------------------------------

  /**
   * Registers a new session for the given user
   * @param username plaintext username
   * @returns Promise that resolves to a session ID if the operation was successful, null otherwise
   */
  public async registerNewSession(username: string): Promise<string | null> {
    let issuedAt = new Date();
    const expiresAt = new Date(issuedAt.valueOf() + 1000 * 60 * 60 * 24 * 7); // 7 days in ms

    const accessToken = await this.getAuthCollection()
      .findOne({ type: "activesessions" })
      .then((result) => {
        return (
          (result &&
            Object.keys(result.list).find(
              (key) => result.list[key].username === username
            )) ||
          this.security.generateAccessToken()
        );
      });

    return await this.getAuthCollection()
      .updateOne(
        { type: "activesessions" },
        {
          $set: {
            [`list.${accessToken}`]: {
              username: username,
              issuedAt: issuedAt.toISOString(),
              expiresAt: expiresAt.toISOString(),
            },
          },
        }
      )
      .then((result) => {
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
  public bsonToJson(bson: any[]): any[] {
    return bson.map((inputItem) => {
      let resultItem = { ...inputItem };
      let keys = Object.keys(resultItem);
      for (let i = 0; i < Object.keys(resultItem).length; i++) {
        let currentKey = keys[i];
        if (resultItem[currentKey] instanceof BSON.BSONValue) {
          if (resultItem[currentKey] instanceof Decimal128) {
            resultItem[currentKey] = parseFloat(
              resultItem[currentKey].toString()
            );
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
