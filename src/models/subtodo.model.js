import mongoose,{Schema} from "mongoose";
const SubTodoSchema= new Schema({
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
    todo:{
        type:Schema.Types.ObjectId,
        ref:"Todo"
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
    comments:[
        {
            type:Schema.Types.ObjectId,
            ref:"Comment"
        }
    ]

},{timestamps:true})

export const Subtodo = mongoose.models.Subtodo || mongoose.model('Subtodo', SubTodoSchema);