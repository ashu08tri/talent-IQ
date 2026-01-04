import mongoose, { Schema } from "mongoose";
import User from "./User.js"

const sessionSchema = new Schema({
    problem: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enums: ["easy", "medium", "hard"],
        required: true
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    participant: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    status:{
        type: String,
        enum: ["active", "completed"],
        default: "active"
    },
    //Stream video call Id
    callId: {
        type: String,
        default: ""
    }
},{timestamps: true})

const session = mongoose.model("Session", sessionSchema);

export default session;