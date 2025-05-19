import express from "express";
import "dotenv/config"
import cookieParser from "cookie-parser"
import cors from "cors"

import authRoutes from "./Routes/authRoute.js"
import userRoutes from "./Routes/userRoutes.js"
import chatRoutes from "./Routes/chatRoutes.js"


import { connectDB } from "./lib/dbConnect.js";

const app = express()
const Port =process.env.PORT

// const __dirname = path.resolve();
app.use(express.json());
app.use(cookieParser())
app.use(cors({    
    origin: "http://localhost:5173",
    credentials: true,
}))

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/chat", chatRoutes)

app.listen(Port,()=>{
    console.log(`server is running at PORT:${Port}`)
    connectDB()
})