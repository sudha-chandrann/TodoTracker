// src/pages/api/users/register.js


import dbConnect from "@/lib/dbconnect";
import {ApiResponse} from "@/helper/Apiresponse"
import { NextResponse } from "next/server";
import {getDataFromToken} from "@/helper/getdatafromtoken"
import { ClientProject } from "@/models/project.model";
import { Todo } from "@/models/todo.model";
import { Subtodo } from "@/models/subtodo.model";
import { Comment } from "@/models/comment.model";
import { Client } from "@/models/user.model";
export async function GET(req,context) {
  await dbConnect();

  try {

    const id = getDataFromToken(req);
    const {params}=context;
    const projectId=params.projectId;
    if(!projectId){
        return NextResponse.json(
            new ApiResponse(
                
               400,{},"projectId is required"
              )
        );
    }
    // const project = await ClientProject.aggregate([
    //     {
    //         $match:{
    //             _id: new mongoose.Types.ObjectId(projectId)
    //         }
    //     },
    //     {
    //         $lookup:{
    //             from:"todos",
    //             localField:"todos",
    //             foreignField:"_id",
    //             as:"todos",
    //             pipeline:[
    //               {
    //                   $lookup:{
    //                     from:"Projects",
    //                     localField:"project",
    //                     foreignField:"_id",
    //                     as:"projectinfo",
    //                   }  
    //               },
    //               {
    //                    $addFields:{
    //                     projectname:{
    //                       $arrayElemAt: ["$projectinfo.name", 0],
    //                     }
    //                    }
    //               },
    //               {
    //                 $project:{
    //                   _id:1,
    //                   task:1,
    //                   priority:1,
    //                   deadline:1,
    //                   project:1,
    //                   projectname:1,
    //                   iscomepleted:1,
    //                 }
    //               }
    //             ]
    //         }
    //     },
    //     {
    //         $project:{
    //             _id:1,
    //             name:1,
    //             description:1,
    //             todos:1
    //         }
    //     }
    // ])
    const project=await ClientProject.findById(projectId).populate("todos");
    if(!project){
        return NextResponse.json(
            new ApiResponse(
                500,{},"project is not found"
            ))
    }
    return NextResponse.json(
        new ApiResponse(
            200,
            {project},
            "project is  found successfully"
          )
    );
  } catch (error) {
    console.error(error);
  }
}
export async function POST(req,context) {
    await dbConnect();
  
    try {
  
      const id = getDataFromToken(req);
      const {params}=context;
      const projectId=params.projectId;
      if(!projectId){
          return NextResponse.json(
              new ApiResponse(
                  
                 400,{},"projectId is required"
                )
          );
      }
      const {task,description,priority,deadline } = await req.json();
      if (
        [task,description,priority,deadline].some((field) => !field)
      ) {
        return NextResponse.json(
          new ApiResponse(400, {}, "all fields are required")
        );
      }
      const todo=await Todo.create({
        task:task,
        description:description,
        project:projectId,
        assignedto:id,
        priority:priority,
        deadline:deadline
      })
      if(!todo){
        return NextResponse.json(
            new ApiResponse(
                500,{},"failed to create todo"))
      }
      const project= await ClientProject.findByIdAndUpdate(projectId,{
        $push: { todos:todo._id }
      },{
        new:true
      })

      const result={
        _id:todo._id,
        task:todo.task,
        iscompleted:todo.iscompleted,
        description:todo.description,
        priority:todo.priority,
        deadline:todo.deadline,
        project:todo.project,
        projectname:project.name

      }
      return NextResponse.json(
          new ApiResponse(
              200,
              {todo:result},
              "todo is successfully added to the project"
            )
      );
    } catch (error) {
      console.error(error);
    }
}
export async function PATCH(req,context) {
  await dbConnect();

  try {

    const id = getDataFromToken(req);
    const {params}=context;
    const projectId=params.projectId;
    if(!projectId){
        return NextResponse.json(
            new ApiResponse(
                
               400,{},"projectId is required"
              )
        );
    }
    const {newdescription } = await req.json();
    if (
      !newdescription
    ) {
      return NextResponse.json(
        new ApiResponse(400, {}, "all fields are required")
      );
    }
   const project = await ClientProject.findByIdAndUpdate(projectId,
    {
      $set: {
        description: newdescription
      }
    },
    {
      new: true
    }
   );
   if(!project){
    return NextResponse.json(
      new ApiResponse(
        404,
        {}
        ,
        "project is not found"
        )
        );
   }
  
    return NextResponse.json(
        new ApiResponse(
            200,
            {description:project.description},
            "project description is updated successfully"
          )
    );
  } catch (error) {
    console.error(error);
  }
}
export async function DELETE(req,context) {
  await dbConnect();

  try {

    const id = getDataFromToken(req);
    const {params}=context;
    const projectId=params.projectId;
    if(!projectId){
        return NextResponse.json(
            new ApiResponse(
                
               400,{},"projectId is required"
              )
        );
    }
    const project = await ClientProject.findById(projectId).populate({
      path: 'todos',
      populate: {
        path: 'subtodos',
        populate: {
          path: 'comments'
        }
      }
    }).populate({
      path: 'todos',
      populate: {
        path: 'comments'
      }
    });

    if (!project) {
           return NextResponse.json(
            new ApiResponse(
                500,{},"project is not found"
            ))
    }

    // Delete comments of subtodos
    for (const todo of project.todos) {
      for (const subTodo of todo.subtodos) {
        await Comment.deleteMany({ _id: { $in: subTodo.comments } });
      }
    }

    // Delete comments of todos
    for (const todo of project.todos) {
      await Comment.deleteMany({ _id: { $in: todo.comments } });
    }

    // Delete subtodos
    for (const todo of project.todos) {
      await Subtodo.deleteMany({ _id: { $in: todo.subtodos } });
    }

    // Delete todos
    await Todo.deleteMany({ _id: { $in: project.todos } });
    await Client.findByIdAndUpdate(
      id,
      {
        $pull: { projects: projectId },
      },
      {
        new: true,
      }
  );
    await ClientProject.findByIdAndDelete(projectId);
    return NextResponse.json(
        new ApiResponse(
            200,
            {id:project._id},
            "project is deleted successfully"
          )
    );
  } catch (error) {
    console.error(error);
  }
}


