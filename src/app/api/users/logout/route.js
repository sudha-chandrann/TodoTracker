// src/pages/api/users/register.js
import dbConnect from "@/lib/dbconnect";
import {ApiResponse} from "@/helper/Apiresponse"
import { NextResponse } from "next/server";
export async function GET(req) {
  await dbConnect();

  try {
    
    const response= NextResponse.json(new ApiResponse(200, {}, "logout successfully"), { status: 200 });
    response.cookies.set("refreshToken","",{
        httpOnly:true,
    })
    return response;
  } catch (error) {
    
    return NextResponse.json(new ApiResponse(500, {}, error.message||"Internal Server Error"), { status: 500 });
  }
}
