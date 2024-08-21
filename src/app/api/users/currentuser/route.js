
// src/pages/api/users/register.js
import dbConnect from "@/lib/dbconnect";
import {ApiResponse} from "@/helper/Apiresponse"
import { NextResponse } from "next/server";
import {getDataFromToken} from "@/helper/getdatafromtoken"
import { Client } from "@/models/user.model";
import mongoose from "mongoose";
export async function GET(req) {
  await dbConnect();

  try {
    const id = getDataFromToken(req);

 
    const user = await Client.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "clientprojects", // Ensure the correct collection name
          let: { projectIds: "$projects" },
          pipeline: [
            { 
              $match: {
                $expr: {
                  $in: ["$_id", "$$projectIds"]
                }
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
              }
            }
          ],
          as: "projects"
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          email: 1,
          projects: 1,
          inbox: 1,
          teams: 1,
        },
      },
    ]);
    
    
    if(!user){
      return NextResponse.json(new ApiResponse(400, {}, "User is not found"))
    }
    return NextResponse.json(new ApiResponse(200, {user:user[0]}, "User is found"), { status: 200 });
  } catch (error) {
    console.log(error)
    return NextResponse.json(new ApiResponse(500, {}, error.message||"Internal Server Error"), { status: 500 });
  }
}
