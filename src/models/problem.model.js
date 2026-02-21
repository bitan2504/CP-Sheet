const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        link: {
            type: String,
            required: true,
            trim: true,
        },
        tags: [
            {
                type: String,
                trim: true,
            }
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Problem", problemSchema);
