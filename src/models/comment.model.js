import mongoose,{Schema} from "mongoose";
const CommentSchema=new Schema({
    comment:{
        type:String,
        required:true
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:"Client",
    },
    todo:{
        type:Schema.Types.ObjectId,
        ref:"Todo"
    },
    subtodo:{
        type:Schema.Types.ObjectId,
        ref:"Subtodo"
    }
},{timestamps:true});

export const Comment = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);