import { BSON, BSONSymbol, BSONType, Collection, Db, Decimal128, Document, FindCursor, MongoClient, UpdateResult, WithId } from "mongodb";
import dotenv from "dotenv";
import Security from "./security";
import { genSalt } from "bcrypt";

export default class MongoDB {
    connectionURL: string;
    client: MongoClient;
    security: Security;

    constructor() {
        dotenv.config();

        this.connectionURL = process.env.CONNECTION_STRING!.replace("<db_username>", process.env.USERNAME!).replace("<db_password>", process.env.PASSWORD!);
        this.client = new MongoClient(this.connectionURL);
        this.client.connect();

        this.security = new Security();
    }

    public getDb(): Db {
        return this.client.db("equanimity");
    }

    public getAuthCollection(): Collection<Document> {
        return this.getDb().collection("auth");
    }

    public async checkCredentials(username: string, password: string): Promise<boolean> {
        const user: WithId<BSON.Document> | null = (await this.getAuthCollection().findOne({"type": "userdef"}, {"projection": {[`list.${username}`]: 1, _id: 0}}).then((result) => result?.list ?? null))[username];
        console.log(user)
        if(user) {
            return this.security.hash(password, user.salt) === user.password
        }
        return false
    }

    /**
     * Registers a new user in the database
     * @param username
     * @param password
     * @return Promise that resolves to an access token for the new user's session, or rejects on error.
     */
    public async registerNewUser(username: string, password: string): Promise<string | null> {
        // TODO: Must disallow register if username already exists
        const salt = this.security.generateSalt();
        const hashedPassword = this.security.hash(password, salt);
        
        return this.getAuthCollection().updateOne(
                {"type": "userdef"},
                {"$set": {
                    [`list.${username}`]: {"password": hashedPassword, "salt": salt}
                }}
        ).then((updateResult: UpdateResult) => {
            if(updateResult.modifiedCount === 1) {
                return this.security.generateAccessToken();
            }
            else {
                return Promise.reject("Invalid DB Update Result");
            }
        }).catch(() => Promise.reject("Invalid DB Update Result"));
    }

    public generateAccessToken(): string {
        return this.security.generateAccessToken().toString();
    }

    public async getAllUsers(): Promise<WithId<Document>[]> {
        let collection = this.getAuthCollection();
        try {
            return collection.find({}).toArray();
        }
        catch(exception) {
            return [];
        }
    }

    public async insertMany(toInsert: Document[]) {
        let collection = this.getAuthCollection();
        try {
            collection.insertMany(toInsert);
        }
        catch(exception) {
            console.error(exception);
        }
    }

    public async deleteExpiredTokens() {

    }

    private bsonToJson(bson: WithId<Document>[]) {
        return bson.map((inputItem: WithId<Document>) => {
            let resultItem = {...inputItem};
            let keys = Object.keys(resultItem);
            for(let i = 0; i < Object.keys(resultItem).length; i++) {
                let currentKey = keys[i]
                if(resultItem[currentKey] instanceof BSON.BSONValue){// && resultItem[currentKey] !== null) {
                    console.log(resultItem[currentKey]);
                    if(resultItem[currentKey] instanceof Decimal128) {
                        console.log("passed")
                        resultItem[currentKey] = parseFloat(resultItem[currentKey].toString());
                    }
                    else {
                        /* @ts-ignore: all relevant classes that implement BSONValue have .toJSON() */
                        resultItem[currentKey] = resultItem[currentKey].toJSON();
                    }
                }
            }
            console.log(resultItem)
            return resultItem;
            // return {...resultItem, _id: resultItem._id.toString()}
        });
    }
}