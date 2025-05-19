import express from "express";
import "dotenv/config"
import cookieParser from "cookie-parser"
import cors from "cors"
import path from "path"

import authRoutes from "./Routes/authRoute.js"
import userRoutes from "./Routes/userRoutes.js"
import chatRoutes from "./Routes/chatRoutes.js"


import { connectDB } from "./lib/dbConnect.js";

const app = express()
const Port =process.env.PORT

const __dirname = path.resolve();
app.use(express.json());
app.use(cookieParser())
app.use(cors({    
    origin: "http://localhost:5173",
    credentials: true,
}))

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
  });
}



app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/chat", chatRoutes)

app.listen(Port,()=>{
    console.log(`server is running at PORT:${Port}`)
    connectDB()
})