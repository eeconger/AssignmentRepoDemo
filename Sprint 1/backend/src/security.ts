import crypto, { KeyObject } from "crypto";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

export default class Security {
    privKey: KeyObject;

    /**
     * Creates a Security object
     */
    constructor() {
        dotenv.config();
        this.privKey = crypto.createPrivateKey(process.env.PRIVATE_KEY!);
    }

    /**
     * @returns A randomized string from bcrypt
     */
    public generateSalt(): string {
        return bcrypt.genSaltSync(); // TODO: use async
    }

    /**
     * 
     * @param password plaintext password
     * @param salt randomized string
     * @returns A hashed password + salt combo
     */
    public hash(password: string, salt: string) {
        return bcrypt.hashSync(password, salt); // TODO: use async
    }

    public decrypt(toDecrypt: string) {
        return crypto.privateDecrypt(this.privKey, toDecrypt)
    }

    public generateAccessToken(): string {
        return crypto.randomUUID().toString();
    }
}