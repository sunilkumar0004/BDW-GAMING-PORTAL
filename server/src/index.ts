import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import mongoSanitize from 'mongo-sanitize';
import mongoose from 'mongoose';
import gamesRouter from './routes/games';
import userRouter from './routes/user';
import reviewsRouter from './routes/reviews';

dotenv.config();

const app = express();
app.use(compression());
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bdw_gaming_portal';

// 🛡️ ULTRA SECURITY: Content Security Policy & Sanitization
app.use(helmet({
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
  req.body = mongoSanitize(req.body);
  req.query = mongoSanitize(req.query);
  req.params = mongoSanitize(req.params);
  next();
});

app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true 
}));
app.use(express.json({ limit: '10kb' })); // Body limit to prevent large payload attacks

// 🚦 Rate Limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes.'
});
app.use('/api/', limiter);

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('🍃 Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/games', gamesRouter);
app.use('/api/user', userRouter);
app.use('/api/reviews', reviewsRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📡 Games API: http://localhost:${PORT}/api/games`);
});
