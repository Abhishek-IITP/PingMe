import mongoose from "mongoose";
import "dotenv/config"

export const connectDB = async () =>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Db connected successfully from: ${conn.connection.host}`)
    } catch (error) {
        console.log("error while connecting MongoDB",error)
        process.exit(1);
        
    }
}