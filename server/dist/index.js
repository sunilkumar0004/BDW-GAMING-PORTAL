"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const compression_1 = __importDefault(require("compression"));
const mongo_sanitize_1 = __importDefault(require("mongo-sanitize"));
const mongoose_1 = __importDefault(require("mongoose"));
const games_1 = __importDefault(require("./routes/games"));
const user_1 = __importDefault(require("./routes/user"));
const reviews_1 = __importDefault(require("./routes/reviews"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, compression_1.default)());
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bdw_gaming_portal';
// 🛡️ ULTRA SECURITY: Content Security Policy & Sanitization
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https://*.alphacoders.com", "https://*.gamedistribution.com", "https://*.dicebear.com", "https://api.dicebear.com"],
            connectSrc: ["'self'", "https://*.google-analytics.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'", "https://html5.gamedistribution.com", "https://*.gamepix.com", "https://*.gamemonetize.com"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
// Prevent NoSQL Injection attacks by stripping out $ and . from keys
app.use((req, _res, next) => {
    req.body = (0, mongo_sanitize_1.default)(req.body);
    req.query = (0, mongo_sanitize_1.default)(req.query);
    req.params = (0, mongo_sanitize_1.default)(req.params);
    next();
});
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json({ limit: '10kb' })); // Body limit to prevent large payload attacks
// 🚦 Rate Limiting: 100 requests per 15 minutes per IP
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
});
app.use('/api/', limiter);
// Connect to MongoDB
mongoose_1.default.connect(MONGO_URI)
    .then(() => console.log('🍃 Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
// Routes
app.use('/api/games', games_1.default);
app.use('/api/user', user_1.default);
app.use('/api/reviews', reviews_1.default);
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📡 Games API: http://localhost:${PORT}/api/games`);
});
