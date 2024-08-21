// src/pages/api/users/register.js
import dbConnect from "@/lib/dbconnect";
import {ApiResponse} from "@/helper/Apiresponse"
import { NextResponse } from "next/server";
import { ClientProject } from "@/models/project.model";
import {Client} from "@/models/user.model"

export async function POST(req) {
  await dbConnect();

  try {
    const { email, password, username } = await req.json();
    const trimmedEmail = email?.trim();
    const trimmedUsername = username?.trim();
    const trimmedPassword = password?.trim();

    if (
      [trimmedEmail, trimmedUsername, trimmedPassword].some((field) => !field)
    ) {
      return NextResponse.json(
        new ApiResponse(400, {}, "all fields are required")
      );
    }
    const existingUser = await Client.findOne({
      $or: [{ email: trimmedEmail }, { username: trimmedUsername }],
    });

    if (existingUser) {
      return NextResponse.json(
        new ApiResponse(
          400,
          {},
          "User with same email or username already exists"
        )
      );
    }

    const user = await Client.create({
      email: trimmedEmail,
      username: trimmedUsername,
      password: trimmedPassword,
    });

    if (!user) {
      return NextResponse.json(
        new ApiResponse(500, {}, "failed to create new user")
      );
    }
    const inbox = await ClientProject.create({
      name: "inbox",
      description: "your inbox",
      createdby: user._id,
    });
    if (!inbox) {
      return NextResponse.json(
        new ApiResponse(500, {}, "failed to create inbox")
      );
    }
    const updateduser=await Client.findByIdAndUpdate(user._id,{
      inbox:inbox._id
    },{
      new:true
    })

    return NextResponse.json(
      new ApiResponse(200, {}, "new user is created successfully")
    );
  } catch (error) {
    console.error(error);
  }
}
