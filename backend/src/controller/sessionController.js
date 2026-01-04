import { chatClient, streamClient } from '../lib/stream.js';
import Session from '../models/Session.js';

export async function createSession(req, res) {
    try {
        const { problem, difficulty } = req.body
        const userId = req.user._id;
        const clerkId = req.user.clerkId;

        if (!problem || !difficulty) {
            return res.status(400).json({ msg: "Problem and difficulty is required" });
        }

        const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        const session = await Session.create({
            problem,
            difficulty,
            host: userId,
            callId
        });

        // create Stream video call
        try {
            await streamClient.video.call("default", callId).getOrCreate({
                data: {
                    created_by_id: clerkId,
                    custom: { problem, difficulty, sessionId: session._id.toString() }
                }
            });
        } catch (err) {
            console.error("Stream call creation failed:", err.message);
            await Session.findByIdAndDelete(session._id);
            return res.status(502).json({ msg: "Failed to create video session" });
        }

        // chat messaging
        const channel = chatClient.channel("messaging", callId, {
            name: `${problem} Session`,
            created_by_id: clerkId,
            members: [clerkId]
        });

        try {
            await channel.create();
        } catch (err) {
            console.error("Chat channel creation failed:", err.message);

            try {
                await streamClient.video.call("default", callId).delete();
            } catch (cleanupErr) {
                console.error("Stream cleanup failed:", cleanupErr.message);
            }

            await Session.findByIdAndDelete(session._id);
            return res.status(502).json({ msg: "Failed to create chat session" });
        }

        res.status(201).json({ session });

    } catch (e) {
        console.error("Error in createSession Controller:", e.message);
        res.status(500).json({ msg: "Internal server error!" });
    }
}

export async function getActiveSessions(_, res) {
    try {
        const sessions = await Session.find({ status: "active" })
            .populate("host", "name profileImage email clerkId")
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({ sessions })
    } catch (e) {
        console.error("Error in getActiveSessions controller:", e.message)
        res.status(500).json({ msg: "Internal server error!" })
    }
}

export async function getRecentSessions(req, res) {
    try {
        const userId = req.user._id;

        const sessions = await Session.find({
            status: "completed",
            $or: [{ host: userId }, { participant: userId }]
        }).sort({ createdAt: -1 }).limit(20);

        res.status(200).json({ sessions });

    } catch (e) {
        console.error("Error in getRecentSessions controller:", e.message)
        res.status(500).json({ msg: "Internal server error!" })
    }
}

export async function getSessionById(req, res) {
    try {
        const { id } = req.params;

        const session = await Session.findById(id).populate("host", "name profileImage email clerkId")
            .populate("participant", "name profileImage email clerkId");

        if (!session) {
            return res.status(404).json({ msg: "Session not found!" });
        }

        res.status(200).json({ session });
    } catch (e) {
        console.error("Error in getSessionById controller:", e.message)
        res.status(500).json({ msg: "Internal server error!" })
    }
}

export async function joinSession(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const clerkId = req.user.clerkId;

        const session = await Session.findById(id)

        if (!session) return res.status(404).json({ msg: "Session not found!" });

        if (session.status === "active") {
            return res.status(400).json({ msg: "Cannot join a completed session!" })
        }

        if (session.host.toString() === userId.toString()) {
            return res.status(400).json({ msg: "Host cannot join their own session!" });
        }

        if (session.participant) return res.status(409).json({ msg: "Session full!" });

        session.participant = userId,
            await session.save();

        const channel = chatClient.channel("messaging", session.callId)
        await channel.addMembers([clerkId]);

        res.status(200).json({ session });

    } catch (e) {
        console.error("Error in joinSession controller:", e.message)
        res.status(500).json({ msg: "Internal server error!" })
    }
}

export async function endSession(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const session = await Session.findById(id);

        if (!session) return res.status(404).json({ msg: "Session not found!" });

        if (session.host.toString() !== userId.toString()) {
            return res.status(403).json({ msg: "Unathorized, Only host can end session!" })
        }

        if (session.status === "completed") return res.status(400).json({ msg: "Session is alreday completed!" })

        //Stream video call delete
        const call = streamClient.video.call("default", session.callId)
        await call.delete({ hard: true })

        //Chat session delete
        const channel = chatClient.channel("messaging", session.callId)
        await channel.delete();

        session.status = "completed"
        await session.save();

        res.status(200).json({ msg: "Session ended successfully!" })

    } catch (e) {
        console.error("Error in endSession controller:", e.message)
        res.status(500).json({ msg: "Internal server error!" })
    }
}