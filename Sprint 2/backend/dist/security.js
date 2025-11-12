"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
class Security {
    privKey;
    /**
     * Creates a Security object
     */
    constructor() {
        dotenv_1.default.config();
        this.privKey = crypto_1.default.createPrivateKey(process.env.PRIVATE_KEY);
    }
    /**
     * @returns A randomized string from bcrypt
     */
    generateSalt() {
        return bcrypt_1.default.genSaltSync(); // TODO: use async
    }
    /**
     *
     * @param password plaintext password
     * @param salt randomized string
     * @returns A hashed password + salt combo
     */
    hash(password, salt) {
        return bcrypt_1.default.hashSync(password, salt); // TODO: use async
    }
    decrypt(toDecrypt) {
        return crypto_1.default.privateDecrypt(this.privKey, toDecrypt);
    }
    generateAccessToken() {
        return crypto_1.default.randomUUID().toString();
    }
}
exports.default = Security;
//# sourceMappingURL=security.js.map