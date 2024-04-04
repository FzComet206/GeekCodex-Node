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
exports.db = void 0;
const dotenv_1 = require("dotenv");
const createApp_1 = require("./middlewares/createApp");
(0, dotenv_1.config)();
// drizzle configuration
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_1 = __importDefault(require("./config/drizzle"));
drizzle_1.default.connect();
exports.db = (0, node_postgres_1.drizzle)(drizzle_1.default);
const PORT = process.env.PORT;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const app = (0, createApp_1.creatApp)();
            app.listen(PORT, () => console.log(`Running on port ${PORT}`));
        }
        catch (err) {
            console.log(err);
        }
    });
}
main();
