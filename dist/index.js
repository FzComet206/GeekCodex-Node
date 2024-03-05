"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const createApp_1 = require("./middlewares/createApp");
(0, dotenv_1.config)();
const drizzle_1 = __importDefault(require("./config/drizzle"));
const PORT = process.env.PORT;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield drizzle_1.default.connect();
            // const db = await drizzle(client);
            console.log("db connected successfully");
        }
        catch (err) {
            console.log(err);
            console.log('connect to database failed');
        }
        try {
            const app = (0, createApp_1.creatApp)();
            app.listen(PORT, () => console.log(`running on port ${PORT}`));
            console.log(`Running in ${process.env.PORT}`);
        }
        catch (err) {
            console.log(err);
        }
    });
}
main();