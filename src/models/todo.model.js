import mongoose,{Schema} from "mongoose";
const TodoSchema= new Schema({
    task:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    iscompleted:{
        type:Boolean,
        default:false
    },
    project:{
        type:Schema.Types.ObjectId,
        ref:"ClientProject"
    },
    assignedto:{
        type:Schema.Types.ObjectId,
        ref:"Client"
    },
    priority:{
        type:String,
        default:"3",
        enum:["1","2","3"]
    },
    deadline:{
        type:Date,
        default:Date.now
    },
    subtodos:[{
        type:Schema.Types.ObjectId,
        ref:"Subtodo"
    }],
    comments:[
        {
            type:Schema.Types.ObjectId,
            ref:"Comment"
        }
    ],

},{timestamps:true})
export const Todo = mongoose.models.Todo || mongoose.model('Todo', TodoSchema);