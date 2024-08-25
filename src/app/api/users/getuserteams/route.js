import { ApiResponse } from "@/helper/Apiresponse";
import dbConnect from "@/lib/dbconnect";
import { NextResponse } from "next/server";
import { Client } from "@/models/user.model";
import { getDataFromToken } from "@/helper/getdatafromtoken";

export async function GET(req) {
    await dbConnect();

    try {
        const id = getDataFromToken(req);
        const user = await Client.findById(id)
        .populate({
          path: 'teams',
          populate: [
            {
              path: 'members',
              select: 'username _id', // Select username and ID for members
            },
            // {
            //   path: 'projects',
            //   select: 'name _id', // Select name and ID for projects
            // },
          ],
        });

        return NextResponse.json(
            new ApiResponse(200, {teams:user.teams }, "teams found"),
            { status: 200 }
        );

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            new ApiResponse(500, {}, "An error occurred"),
            { status: 500 }
        );
    }
}
