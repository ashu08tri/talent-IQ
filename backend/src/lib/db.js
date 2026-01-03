import mongoose from 'mongoose'
import { ENV } from './env.js';

export const connectionDB = async () => {
    try {
        if(!ENV.DB_URL){
            throw new error("DB_URL not defined in the env")
        }
        await mongoose.connect(ENV.DB_URL)
        console.log("Connected to DB")
    }
    catch (e) {
        console.log("Failed to connect to DB:", e)
        process.exit(1); // 0 means success, 1 means failure
    }
}