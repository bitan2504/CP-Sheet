const mongoose = require("mongoose");

const emailUpdateSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        otp: {
            type: String,
            required: true,
        },
        expiry: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for auto-deletion of expired OTPs (TTL index)
emailUpdateSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 });

// Ensure only one pending email update per user
emailUpdateSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model("EmailUpdate", emailUpdateSchema);
