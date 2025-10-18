import mongoose from "mongoose";

const CommentSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:"User"
    },
    postId:{
        type:mongoose.Schema.ObjectId,
        ref:"Post",
    },
    body:{
        type:String,
        required:true,
    }
})


const Comment=mongoose.model("Comment",CommentSchema);

export default Comment;