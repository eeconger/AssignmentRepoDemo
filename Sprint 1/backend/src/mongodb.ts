import { BSON, BSONSymbol, BSONType, Decimal128, Document, FindCursor, MongoClient, WithId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const connectionURL = process.env.CONNECTION_STRING!.replace("<db_username>", process.env.USERNAME!).replace("<db_password>", process.env.PASSWORD!);
const client = new MongoClient(connectionURL);

function getAuthCollection() {
    return client.db("assignments").collection("assignments");
}

export async function getAllUsers(): Promise<WithId<Document>[]> {
    let collection = getAuthCollection();
    try {
        return collection.find({}).toArray();
    }
    catch(exception) {
        return [];
    }
}

export async function insertMany(toInsert: Document[]) {
    let collection = getAuthCollection();
    try {
        collection.insertMany(toInsert);
    }
    catch(exception) {
        console.error(exception);
    }
}

export function bsonToJson(bson: WithId<Document>[]) {
    return bson.map((inputItem) => {
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