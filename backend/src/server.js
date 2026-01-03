import express from 'express';
import path from "path";
import { ENV } from './lib/env.js';
import { connectionDB } from './lib/db.js';

const app = express();

const __dirname = path.resolve();

app.get('/health', (req, res) => {
    res.status(200).json({ msg: "Hello from server side!" })
})

//For deployment
if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")))

    app.get('/{*any}', (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
    })
};

const startServer = async () => {
    try {
        await connectionDB()
        app.listen(ENV.PORT, () => {
            console.log(`server is running on port ${ENV.PORT}`)
        })
    } catch (e) {
        console.log("Failed to start the server:", e)
    }
};

startServer();