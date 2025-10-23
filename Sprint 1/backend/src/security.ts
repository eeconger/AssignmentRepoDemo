import crypto, { Hash, KeyObject, UUID } from "crypto";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

export default class Security {
    // hash: Hash;
    privKey: KeyObject;

    constructor() {
        dotenv.config();
        this.privKey = crypto.createPrivateKey(process.env.PRIVATE_KEY!);
    }

    public generateSalt() {
        return bcrypt.genSaltSync();
    }

    public hash(password: string, salt: string) {
        return bcrypt.hashSync(password, salt);
    }

    public decrypt(toDecrypt: string) {
        return crypto.privateDecrypt(this.privKey, toDecrypt)
    }

    public generateAccessToken(): UUID {
        return crypto.randomUUID();
    }
}