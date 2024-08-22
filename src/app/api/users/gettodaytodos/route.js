// src/pages/api/users/register.js
import dbConnect from "@/lib/dbconnect";
import {ApiResponse} from "@/helper/Apiresponse"
import { NextResponse } from "next/server";
import {getDataFromToken} from "@/helper/getdatafromtoken"
import { Todo } from "@/models/todo.model";
import mongoose from "mongoose";
export async function GET(req) {
  await dbConnect();

  try {
    const id = getDataFromToken(req);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999); 
   
    const todayTodos=await Todo.aggregate([
        {
            $match:{
                deadline: {
                    $gte: startOfToday, 
                    $lte: endOfToday    
                 },
                 assignedto:new mongoose.Types.ObjectId(id),  
            }
        },
        {
            $lookup:{
                from:"clientprojects",
                localField:"project",
                foreignField:"_id",
                as:'projects'
            }
        },{
            $addFields:{
                projectname:{
                    $arrayElemAt: ["$projects.name", 0],
                },
            }

        },
        {
            $project:{
                _id:1,
                task:1,
                iscompleted:1,
                priority:1,
                projectname:1,
                project:1,
            }
        }
    ])
    if(!todayTodos){
      return NextResponse.json(new ApiResponse(200, {}, "User is found"), { status: 200 });
    }
    return NextResponse.json(new ApiResponse(200, {todayTodos}, "User is found"), { status: 200 });
  } catch (error) {
    
    return NextResponse.json(new ApiResponse(500, {}, error.message||"Internal Server Error"), { status: 500 });
  }
}
