// src/pages/api/users/register.js

import dbConnect from "@/lib/dbconnect";
import {ApiResponse} from "@/helper/Apiresponse"
import { NextResponse } from "next/server";
import {getDataFromToken} from "@/helper/getdatafromtoken"
import { Client } from "@/models/user.model";
import { ClientProject } from "@/models/project.model";


export async function POST(req) {
  await dbConnect();

  try {

    const id = getDataFromToken(req);
    const { name, description } = await req.json();
    if ([name, description].some((field) => !field)) {
      return NextResponse.json(
        new ApiResponse(400, {}, "all fields are required")
      );
    }

    const project = await ClientProject.create({
      name: name,
      description: description,
      createdby: id,
    });

    if (!project) {
      return NextResponse.json(
        new ApiResponse(500, {}, "failed to create new Project")
      );
    }
    await Client.findByIdAndUpdate(
        id,
        {
          $push: { projects: project._id },
        },
        {
          new: true,
        }
    );
    const result={
      _id:project._id,
      name:project.name
    }
    
    return NextResponse.json(
      new ApiResponse(200, { project:result }, "new project is created successfully")
    );
  } catch (error) {
    console.error(error);
  }
}
