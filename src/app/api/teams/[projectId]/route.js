// src/pages/api/users/register.js


import dbConnect from "@/lib/dbconnect";
import {ApiResponse} from "@/helper/Apiresponse"
import { NextResponse } from "next/server";
import {getDataFromToken} from "@/helper/getdatafromtoken"
import { ClientProject } from "@/models/project.model";

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
    const project = await ClientProject.findById(projectId)
    .populate({
        path: 'todos',
        populate:{
          path: 'assignedto',
          select:'username _id'
        }
    })
    .populate({
        path: 'team',
        select: 'name _id',
        populate: { 
            path: 'admin', 
            select: '_id username email' 
        }
    });
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


