import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import {ApiResponse} from "@/helper/Apiresponse"
import {getDataFromToken} from "@/helper/getdatafromtoken"
import mongoose from "mongoose";
import { Todo } from "@/models/todo.model";
import {Comment} from "@/models/comment.model"


export async function DELETE(req, context) {
    await dbConnect();
    try {
      const id = getDataFromToken(req);
      const { params } = context;
      const todoId = params.todoId;
      const commentId=params.commentId;
      if (!commentId && !todoId) {
        return NextResponse.json(
          new ApiResponse(400, {}, "both commentId  and todoId are required")
        );
      }
      await Todo.findByIdAndUpdate(
        todoId,
        {
          $pull: {
            comments: commentId,
          },
        },
        {
          new: true,
        }
      );
      const deleted = await Comment.findByIdAndDelete(commentId);
      return NextResponse.json(
        new ApiResponse(200, { id: deleted._id }, "comment is deleted  ")
      );
    } catch (error) {
      console.error(error);
    }
  }

  export async function PATCH(req, context) {
    await dbConnect();
    try {
      const id = getDataFromToken(req);
      const { params } = context;
      const todoId = params.todoId;
      const commentId=params.commentId;
      if (!commentId && !todoId) {
        return NextResponse.json(
          new ApiResponse(400, {}, "both commentId  and todoId are required")
        );
      }
      const {newcomment} = await req.json();
      const comment=await Comment.findByIdAndUpdate(commentId,
        {
            $set: {
                comment: newcomment
            }
        },
        {
            new: true
        }
      )
      if(!comment){
        return NextResponse.json(
            new ApiResponse(400, { }, "comment is not found  ")
          );
      }
     
      
      return NextResponse.json(
        new ApiResponse(200, { id:comment._id,comment:comment.comment}, "comment is updated successfully  ")
      );
    } catch (error) {
      console.error(error);
    }
  }  