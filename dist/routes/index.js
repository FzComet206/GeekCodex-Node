"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// main router
const router = (0, express_1.Router)();
const auth_1 = __importDefault(require("./auth"));
router.use('/auth', auth_1.default);
exports.default = router;