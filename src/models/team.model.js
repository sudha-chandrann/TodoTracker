import mongoose, { Schema } from "mongoose";
const TeamSchema=new Schema({
    members:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Client'
        }
    ],
    projects:[
        {
            type: Schema.Types.ObjectId,
            ref: 'ClientProject'
        }
    ]
},{timestamps:true});
export const Team=mongoose.model("Team",TeamSchema);
