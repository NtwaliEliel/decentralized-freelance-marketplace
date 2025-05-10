"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = exports.verifySignature = void 0;
const ethers_1 = require("ethers");
const User_1 = __importDefault(require("../models/User"));
const verifySignature = async (req, res, next) => {
    try {
        const { address, signature, message } = req.body;
        if (!address || !signature || !message) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        const recoveredAddress = ethers_1.ethers.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            res.status(401).json({ message: 'Invalid signature' });
            return;
        }
        let user = await User_1.default.findOne({ walletAddress: address.toLowerCase() });
        if (!user) {
            user = await User_1.default.create({
                walletAddress: address.toLowerCase(),
                username: `user_${address.slice(0, 6)}`,
                email: `${address.slice(0, 6)}@example.com`,
                role: 'client',
            });
        }
        const authenticatedUser = {
            _id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role
        };
        req.user = authenticatedUser;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.verifySignature = verifySignature;
const requireAuth = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    next();
};
exports.requireAuth = requireAuth;
//# sourceMappingURL=auth.js.map