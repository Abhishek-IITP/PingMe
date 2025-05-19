import User from "../models/userSchema.js";
import jwt from "jsonwebtoken";
import "dotenv/config"
import { upsertStreamUser } from "../lib/stream.js";

export async function signup(req,res) {
    const {fullName,email,password}= req.body;

    try {
        if(!fullName||!email || !password){
            return res.status(400).json({
                message: "All fields are required",
                success: false
            })
        }
        if(password.length<8){
            return res.status(400).json({
                message: "password must have at least 8 characters ",
                success: false
            })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({
                message: "Invalid email Format",
                success: false
            })
        }

        const existingUser=await User.findOne({email})
        if(existingUser){
            return res.status(400).json({
                message: "Email already exists, Please use a different One",
                success: false
            })
        }

        const idx= Math.floor(Math.random() * 100) + 1
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`

        const newUser = await User.create({
            email,
            fullName,
            password,
            profilePic: randomAvatar,
        })

            try {
                await upsertStreamUser({
                    id: newUser._id.toString(),
                    name: newUser.fullName,
                    Image: newUser.profilePic || "",
                })
                console.log(`Stream User created for ${newUser.fullName}`)
            } catch (error) {
                console.error("Error while creating Stream user: ",error)
                
            }

        const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        })

        res.cookie("jwt",token,{
            maxAge: 7*24*60*60*1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV==='production'
        })

        res.status(201).json({
            user: newUser,
            message: "User Created Successfully",
            success: true
        })

    } catch (error) {
        console.log("Error in singup controller", error)
        res.status(500).json({
            message:"Internal server Error",
            success: false
        })
        
    }
    
}
export async function login(req,res) {
    try {
        const { email , password}= req.body;
        if(!email || !password){
            res.status(400).json({
                message:"All fields are required",
                success: false
            })
        }
    
        const user = await User.findOne({email});
        if(!user){
            res.status(401).json({
                message:"Invalid email or password",
                success: false
            })
        }
        const isPasswordCorrect = await user.matchPassword(password)
        if(!isPasswordCorrect){
            res.status(400).json({
                message:"Incorrect password",
                success: false
            })
        }
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        })
    
        res.cookie("jwt",token,{
            maxAge: 7*24*60*60*1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV==='production'
        })
        res.status(200).json({
            user,
            message: "Logged in successfully",
            success: true
        })
        
    } 

    catch (error) {
        console.log("Error In login controller", error)
        res.status(500).json({
            message: "server error",
            success: false
        })
    }
}
export  function logout(req,res) {
        res.clearCookie("jwt");
        res.status(200).json({
            message: "User Logged out successfully",
            success: true
        })
        
}


export async function onboard(req,res) {
   try {
     const userId= req.user._id;
     const{fullName,bio,nativeLanguage, learningLanguage, location}= req.body
     if(!fullName || !bio || !nativeLanguage || !learningLanguage || !location){
        res.status(400).json({
            message: "All fields are required",
            missingFields:[
                !fullName && "fullName",
                !bio && "bio",
                !nativeLanguage && "nativeLanguage",
                !learningLanguage && "learningLanguage",
                !location && "location",
            ].filter(Boolean),
            success: false
        })  
     }
     const updatedUser = await User.findByIdAndUpdate(userId,{
        ...req.body ,isOnboarded: true,
     }, {new:true})

     try {
         await upsertStreamUser({
            id:updatedUser._id.toString(),
            name: updatedUser.fullName,
            image: updatedUser.profilePic || "",
    
         })
        console.log(`User Updated Successfully after onboarding from ${updatedUser.fullName}`)
     } catch (streamError) {
        console.log("Error while updating Stream user during onboarding :" , streamError.message)
        
     }


     if(!updatedUser){
        res.status(404).json({
            message: "User not found",
            success: false
        })  
     }
     res.status(200).json({
        message: "Info Updated successfully",
        success: true,
        user: updatedUser,
    })  
   } catch (error) {
    console.error("Onboarding error:", error)
    res.status(500).json({
        message: "Internal Server Error",
        success: false
    })  
    
   }
 
}