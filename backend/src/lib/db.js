import mongoose from 'mongoose'
import { ENV } from './env.js';

export const connectionDB = async () => {
    try {
        await mongoose.connect(ENV.DB_URL)
        console.log("Connected to DB")
    }
    catch (e) {
        console.log("Failed to connect to DB:", e)
        process.exit(1); // 0 means success, 1 means failure
    }
}