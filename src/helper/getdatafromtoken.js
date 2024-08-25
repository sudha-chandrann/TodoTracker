import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";


export const getDataFromToken=(request)=>{
    try{
          const token=request.cookies.get("refreshToken")?.value||'';
            const decoded=jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);
            return decoded._id;
    }
    catch(error){
        console.log("the getdata error is ",error.message||error);
    }
}