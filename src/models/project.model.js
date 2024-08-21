import mongoose,{Schema} from "mongoose";
const ProjectSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    todos:[
        {
            type:Schema.Types.ObjectId,
            ref:"Todo"
        }
    ],
    ispersonal:{
           type:Boolean,
           default:true
    },
    team:{
        type:Schema.Types.ObjectId,
        ref:"Team"
    },
    createdby:{
        type:Schema.Types.ObjectId,
        ref:"Client"
    },
    description:{
        type:String
    }
},{timestamps:true})
export const ClientProject = mongoose.models.ClientProject || mongoose.model('ClientProject', ProjectSchema);