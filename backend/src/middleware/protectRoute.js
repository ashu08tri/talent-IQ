import { requireAuth } from '@clerk/express';
import User from '../models/User.js';

export const protectRoute = [
    requireAuth(),
    async (req, res, next) => {
        try {
            const clerkId = req.auth().userId;

            if (!clerkId) return res.status(401).json({ msg: "Unauthorized - Invalid token" })

            //find user in DB with clerkId
            const user = User.findOne({ clerkId })

            if (!user) return res.status(404).json({ msg: "USer not found!" })

            //attach user to req
            req.user = user;

            next();
        } catch (e) {
            console.error("Error in protectedRoute middleware:", e)
            res.status(500).json({ msg: "Internal server error!" })
        }
    }
]