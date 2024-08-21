// src/pages/api/users/register.js
import dbConnect from "@/lib/dbconnect";
import {ApiResponse} from "@/helper/Apiresponse"
import { NextResponse } from "next/server";
import {getDataFromToken} from "@/helper/getdatafromtoken"
import { Todo } from "@/models/todo.model";
import mongoose from "mongoose";
export async function POST(req) {
  await dbConnect();

  try {
    const id = getDataFromToken(req);
    const {date} = await req.json();
    const startOfToday = new Date(date);
    startOfToday.setHours(0, 0, 0, 0); // Set time to 00:00:00.000
    const endOfToday = new Date(date);
    endOfToday.setHours(23, 59, 59, 999); // Set time to 23:59:59.999
   
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
    const iscompletedtodo = await Todo.aggregate([
        {
            $match: {
                deadline: {
                    $gte: startOfToday,
                    $lte: endOfToday
                },
                assignedto: new mongoose.Types.ObjectId(id),
                iscompleted: false
            }
        },
        {
            $count: "totalTodos" 
        }
    ]);
    const todoCount = iscompletedtodo.length > 0 ? iscompletedtodo[0].totalTodos : 0;

    return NextResponse.json(new ApiResponse(200, {todayTodos:todayTodos,count:todoCount}, "User is found"), { status: 200 });
  } catch (error) {
    
    return NextResponse.json(new ApiResponse(500, {}, error.message||"Internal Server Error"), { status: 500 });
  }
}
