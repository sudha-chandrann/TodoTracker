import mongoose, { Schema } from "mongoose";
const TeamSchema=new Schema({
    name:{
        type:String,
        required:true
    },
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
    ],
    admin:{
        type: Schema.Types.ObjectId,
        ref:'Client'
    },

},{timestamps:true});
export const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema);

