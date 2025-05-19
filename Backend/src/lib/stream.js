import {StreamChat} from "stream-chat"
import "dotenv/config"

const apikey = process.env.STREAM_API_KEY
const apisecret = process.env.STREAM_API_SECRET

if(!apikey || !apisecret){
    console.error("Stream API key or Secret is missing")
}

const streamClient = StreamChat.getInstance(apikey,apisecret);

export const upsertStreamUser = async (userData) =>{
    try {
        await streamClient.upsertUser(userData);
        return userData;
    } catch (error) {
        console.error("Error while upserting Stream User:", error)
    }
}

export const generateStreamToken = async (userId)=>{
    try {
        const userIdStr = userId.toString();
        return streamClient.createToken(userIdStr);
    } catch (error) {
        console.error("Error generating Stream token:", error)
    }
};