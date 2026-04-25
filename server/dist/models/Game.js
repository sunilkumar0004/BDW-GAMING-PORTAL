"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const GameSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true },
    url: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    playCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 }, // Average rating
    reviewCount: { type: Number, default: 0 }, // Number of reviews
}, { timestamps: true });
// Optimized Indexes for performance
GameSchema.index({ category: 1, rating: -1 });
GameSchema.index({ isFeatured: 1, createdAt: -1 });
GameSchema.index({ isPopular: 1, playCount: -1 });
GameSchema.index({ id: 1 }, { unique: true });
GameSchema.index({ slug: 1 }, { unique: true });
GameSchema.index({ title: 'text', category: 'text', description: 'text' }, { weights: { title: 10, category: 5, description: 1 }, name: "GameTextIndex" });
exports.default = mongoose_1.default.models.Game || mongoose_1.default.model('Game', GameSchema);
