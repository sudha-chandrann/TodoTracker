import { ApiResponse } from "@/helper/Apiresponse";
import dbConnect from "@/lib/dbconnect";
import { NextResponse } from "next/server";
import { Client } from "@/models/user.model";
import { getDataFromToken } from "@/helper/getdatafromtoken";

export async function POST(req) {
    await dbConnect();

    try {
        const id = getDataFromToken(req); // Current user's ID
        const { search, users } = await req.json(); // `users` is the array of IDs to exclude
        const query = new RegExp(search, 'i', 'g');

        // Find users by username or email, excluding the current user and the IDs in `users`
        const user = await Client.find({
            $or: [
                { username: query },
                { email: query }
            ],
            _id: { $nin: [...users, id] } // Exclude the user with the given ID and the ones in `users`
        }).select('_id username email');

        return NextResponse.json(
            new ApiResponse(200, { user }, "Users found"),
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
