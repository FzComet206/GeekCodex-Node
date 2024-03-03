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
// copilot keys: alt + ], ctrl + enter, ctrl + -> <-  and generating code using comments
const express_1 = require("express");
const argon2_1 = __importDefault(require("argon2"));
const router = (0, express_1.Router)();
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const hashed = yield argon2_1.default.hash(password, {
        type: argon2_1.default.argon2id
    });
    return hashed;
});
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({
        text: "server register action"
    });
    const p = yield hashPassword(req.body.password);
    console.log(req.body);
    console.log(req.session.cookie);
    req.session.userId = 20;
    req.session.name = "Antares";
    // set up register session
}));
exports.default = router;
