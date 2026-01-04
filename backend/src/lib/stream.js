import {StreamChat} from 'stream-chat';
import { ENV } from './env.js';

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if(!apiKey || !apiSecret){
    console.error("Missing Stream apikey or secret!")
}

export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async(userData) => {
    try{
        await chatClient.upsertUser(userData);
        console.log("Stream user upserted successfully:", userData);
    }catch(e){
        console.error("Error upserting stream user:", e)
    }
}

export const deleteStreamUser = async(userId) => {
    try{
        await chatClient.deactivateUser(userId);
        console.log("Stream user deleted successfully")
    }catch(e){
        console.error("Error deleting stream user:", e)
    }
}