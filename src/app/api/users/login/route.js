// src/pages/api/users/register.js
import dbConnect from "@/lib/dbconnect";
import {ApiResponse} from "@/helper/Apiresponse"
import { Client } from "@/models/user.model";
import { NextResponse } from "next/server";


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await Client.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
    
        return {accessToken, refreshToken}

    } catch (error) {
        throw error
    }
}

export async function POST(req) {
  await dbConnect();

 try{ 
    const { email, password, username } = await req.json();
    const trimmedEmail = email?.trim();
    const trimmedUsername = username?.trim();
    
    if(!email&&!username){
        return NextResponse.json(
            new ApiResponse(
              400,
              {},
              "uername or emaill is required"
            )
          );
    }

    if(!password){
        return NextResponse.json(
            new ApiResponse(
                400,
                {},
                "password is required"
            ))
    }
    const existingUser = await Client.findOne({
      $or: [{ email: trimmedEmail }, { username: trimmedUsername }],
    });


    if (!existingUser) {
      return NextResponse.json(
        new ApiResponse(
          400,
          {},
          "User with email or username does not exists"
        )
      );
    }
    const iscorrect= await existingUser.isPasswordCorrect(password)
    if(!iscorrect){
        return NextResponse.json(
            new ApiResponse(
                400,
                {},
                "Incorrect password"
            ))
        }
      
        const {refreshToken , accessToken }=await generateAccessAndRefereshTokens(existingUser._id);
        const logedUser=await Client.findById(existingUser._id).select("-password -refreshToken");
       
      
        
         const response= NextResponse.json(
            new ApiResponse(200, {}, "Login successfully")
          );
      
          // Set cookies in the response header
        response.cookies.set("refreshToken",refreshToken,{
            httpOnly:true,
        })
      
        return response;

    }
    catch(error){
        console.log(error)
    }
}
