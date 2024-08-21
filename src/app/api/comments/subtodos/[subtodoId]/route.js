import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import {ApiResponse} from "@/helper/Apiresponse"
import {getDataFromToken} from "@/helper/getdatafromtoken"
import mongoose from "mongoose";
import { Todo } from "@/models/todo.model";
import { Subtodo } from "@/models/subtodo.model";
import {Comment} from "@/models/comment.model"
import { Client } from "@/models/user.model";

export async function POST(req,context) {
    await dbConnect();
  
    try {
  
      const id = getDataFromToken(req);
      const {params}=context;
      const subtodoId=params.subtodoId;
      if( !subtodoId){
          return NextResponse.json(
              new ApiResponse(
                  
                 400,{}," subtodoId  is  required"
                )
          );
      }
      const {comment} = await req.json();
      if (
       !comment
      ) {
        return NextResponse.json(
          new ApiResponse(400, {}, "Comment is required")
        );
      }
      const newcomment=await Comment.create({
        comment:comment,
        user:id,
        subtodo:subtodoId
      })
      if(!newcomment){
        return NextResponse.json(
            new ApiResponse(400, {}, "failed to create comment")
          );
      }
      await Subtodo.findByIdAndUpdate(subtodoId,
        {
        $push:{
        comments:newcomment._id
         }
        },
        {
            new: true,
        }
      )
      const user=await Client.findById(id);
      const result={
        _id:newcomment._id,
        comment:newcomment.comment,
        user:user.username
      }
      
      return NextResponse.json(
          new ApiResponse(
              200,
              {result},
              "comment  is created successfully"
            )
      );
    } catch (error) {
      console.error(error);
    }
}

