import { chatClient } from "../lib/stream.js";

export async function getStreamToken(req, res) {
    try{
        const token = chatClient.createToken(req.user.clerkId);
        res.status(200).json({
            token,
            userName: req.user.name,
            userId: req.user.clerkId,
            userImage: req.user.image
        })
    }catch(e){
        console.log("Error in getStreamController method:", e)
        res.status(500).json({msg: "Internal server error!"})
    }
}