"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
require("./server");
dotenv_1.default.config();
const user_1 = __importDefault(require("./routes/user"));
const job_1 = __importDefault(require("./routes/job"));
const proposal_1 = __importDefault(require("./routes/proposal"));
const contract_1 = __importDefault(require("./routes/contract"));
const review_1 = __importDefault(require("./routes/review"));
const message_1 = __importDefault(require("./routes/message"));
const notification_1 = __importDefault(require("./routes/notification"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/users', user_1.default);
app.use('/api/jobs', job_1.default);
app.use('/api/proposals', proposal_1.default);
app.use('/api/contracts', contract_1.default);
app.use('/api/reviews', review_1.default);
app.use('/api/messages', message_1.default);
app.use('/api/notifications', notification_1.default);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/freelance-marketplace';
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => {
    console.log('Connected to MongoDB');
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map