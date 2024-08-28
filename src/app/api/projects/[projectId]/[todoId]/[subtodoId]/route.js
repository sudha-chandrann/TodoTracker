import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import {ApiResponse} from "@/helper/Apiresponse"
import {getDataFromToken} from "@/helper/getdatafromtoken"
import mongoose from "mongoose";
import { Todo } from "@/models/todo.model";
import { Subtodo } from "@/models/subtodo.model";
import { Comment } from "@/models/comment.model";
import { ClientProject } from "@/models/project.model";
import { FaUserInjured } from "react-icons/fa6";




// toggle the subtodo
export async function PUT(req,context) {
    await dbConnect();
  
    try {
  
      const id = getDataFromToken(req);
      const {params}=context;
      const projectId=params.projectId;
      const todoId=params.todoId;
      const subtodoId=params.subtodoId;
      const {iscompleted } = await req.json();
      if(!projectId && !todoId && !subtodoId){
          return NextResponse.json(
              new ApiResponse(
                  
                 400,{}," projectId , todoId and subtodoid are required"
                )
          );
      }

    const subtodo = await Subtodo.findById(subtodoId)

    if (!subtodo) {
        return NextResponse.json(
            new ApiResponse(
                
               400,{},"subtodo is not found"
              )
        );
    }
  
    subtodo.iscompleted = iscompleted;
    await subtodo.save();


      return NextResponse.json(
          new ApiResponse(
              200,
              {
                id:subtodo._id,
                iscompleted:subtodo.iscompleted
             },
              "subtodo is  updated successfully"
            )
      );
    } catch (error) {
      console.error(error);
    }
}

// delete the subtodo
export async function DELETE(req,context) {
  await dbConnect();

  try {

    const id = getDataFromToken(req);
    const {params}=context;
    const projectId=params.projectId;
    const todoId=params.todoId;
    const subtodoId=params.subtodoId;
    if(!projectId && !todoId && subtodoId){
        return NextResponse.json(
            new ApiResponse(
                
               400,{}," projectId ,todoId and subtodoid are required"
              )
        );
    }
   await Todo.findByIdAndUpdate(todoId,
      {
          $pull:{
            subtodos:subtodoId
          }
      },
      {
          new:true
      }
    )
    const subtodo = await Subtodo.findById(subtodoId)
    .populate('comments');

  if (!subtodo) {
      return NextResponse.json(
          new ApiResponse(
              400,
              {},
              "subtodo is not found "
            )
      );
  }

  // Delete comments associated with the subtodo
  await Comment.deleteMany({ _id: { $in: subtodo.comments } });

  // Delete the subtodo
  const deleted= await Subtodo.findByIdAndDelete(subtodoId);
    return NextResponse.json(
        new ApiResponse(
            200,
            {id:deleted._id},
            "todo is deleted  "
          )
    );
  } catch (error) {
    console.error(error);
  }
}
// get the subtodo
export async function GET(req,context) {
  await dbConnect();

  try {

    const id = getDataFromToken(req);
    const {params}=context;
    const projectId=params.projectId;
    const todoId=params.todoId;
    const subtodoId=params.subtodoId;
    if(!projectId && !todoId && !subtodoId){
        return NextResponse.json(
            new ApiResponse(
                
               400,{}," projectId , todoId and subtodoid are required"
              )
        );
    }
    const subtodo=await Subtodo.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(subtodoId),
          },
        },
        {
          $lookup: {
            from: "comments",
            localField: "comments",
            foreignField: "_id",
            as: "comments",
            pipeline: [
              {
                $lookup: {
                  from: "clients",
                  localField: "user",
                  foreignField: "_id",
                  as: "commentedby",
                  pipeline: [
                    {
                      $project: {
                        username: 1,
                        _id:1,
                      },
                    },
                  ],
                },
              },
              {
                $addFields:{
                    user: {
                      $arrayElemAt: ["$commentedby.username", 0],
                    },  
                    userid: {
                      $arrayElemAt: ["$commentedby._id", 0],
                    },  
                }
              },
              {
                $project: {
                  _id: 1,
                  comment: 1,
                  user: 1,
                  userid:1
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "todos",
            localField: "todo",
            foreignField: "_id",
            as: "todo",
          },
        },
        {
          $lookup:{
            from: "clients",
            localField: "assignedto",
            foreignField: "_id",
            as:'assignedto',
            pipeline:[
              {
                $project:{
                  username:1,
                  email:1,
                  _id:1,
                }
              }
            ]
          }
  
        },
        {
          $addFields: {
            todo: {
              $arrayElemAt: ["$todo.task", 0],
            },
  
          },
        },
        {
          $project:{
            task:1,
            description:1,
            comments:1,
            deadline:1,
            priority:1,
            todo:1,
            iscompleted:1,
            assignedto:1,
          }
        }
    
    ])
    if(!subtodo){
      return NextResponse.json(
        new ApiResponse(
            
           400,{}," subtodo is not found"
          )
    );
    }
    return NextResponse.json(
        new ApiResponse(
            200,
            {
             subtodo:subtodo[0]
           },
            "subtodo is  found successfully"
          )
    );
  } catch (error) {
    console.error(error);
  }
}
// update the subtodo
export async function PATCH(req, context) {
  await dbConnect();

  try {
    const id = getDataFromToken(req);
    const { params } = context;
    const projectId = params.projectId;
    const todoId = params.todoId;
     const subtodoId=params.subtodoId;
     if(!projectId && !todoId && !subtodoId){
          return NextResponse.json(
              new ApiResponse(
                  
                 400,{}," projectId , todoId and subtodoid are required"
                )
          );
      }
    const { newdescription,newpriority,newdeadline } = await req.json();
    if (!newdescription && !newpriority && !newdeadline) {
      return NextResponse.json(
        new ApiResponse(400, {}, "all fields are required")
      );
    }
    if(newdescription){
      const subtodo = await Subtodo.findByIdAndUpdate(
        subtodoId,
        {
          $set: {
            description: newdescription,
          },
        },
        {
          new: true,
        }
      );
      if (!subtodo) {
        return NextResponse.json(new ApiResponse(404, {}, "todo is not found"));
      }
  
      return NextResponse.json(
        new ApiResponse(
          200,
          { description: subtodo.description },
          "description is  updated successfully"
        )
      );
    }
    if(newpriority){
      const subtodo = await Subtodo.findByIdAndUpdate(
        subtodoId,
        {
          $set: {
            priority: newpriority,
          },
        },
        {
          new: true,
        }
      );
      if (!subtodo) {
        return NextResponse.json(new ApiResponse(404, {}, "todo is not found"));
      }
  
      return NextResponse.json(
        new ApiResponse(
          200,
          { priority: subtodo.priority },
          "priority is  updated successfully"
        )
      );
    }
    if(newdeadline){
      const todo=await Todo.findById(todoId);
      let tododeadline=new Date(todo.deadline);
      let deadlineDate=new Date(newdeadline);
      tododeadline.setHours(23, 59, 59, 999);
      deadlineDate.setHours(23, 59, 59, 999);
      if(tododeadline<deadlineDate){
        return NextResponse.json(
          new ApiResponse(400, {}, "deadline should be less than or equal to todo deadline")
          );
      }
    
      const subtodo = await Subtodo.findByIdAndUpdate(
        subtodoId,
        {
          $set: {
            deadline: newdeadline,
          },
        },
        {
          new: true,
        }
      );
      if (!subtodo) {
        return NextResponse.json(new ApiResponse(404, {}, "todo is not found"));
      }
  
      return NextResponse.json(
        new ApiResponse(
          200,
          { deadline: subtodo.deadline },
          "deadline is  updated successfully"
        )
      );
    }

  } catch (error) {
    console.error(error);
  }
}

