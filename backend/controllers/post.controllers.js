import Post from '../models/posts.model.js';
import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import bcrypt from "bcrypt";
import Comment from '../models/comments.model.js';

export const activeCheck = async (req, res) => {
  return res.status(200).json({ message: "Running" });
};

export const createPost=async(req,res)=>{
    const {token}=req.body;

    try{

        const user=await User.findOne({token:token});

        if(!user) return res.status(404).json({message:"User not found"});

        const post =new Post({
            userId:user._id,
            body:req.body.body,
            media:req.file!=undefined?req.file.filename:"",
            fileType:req.file!=undefined?req.file.mimetype.split("/")[1]:"",
        })

        await post.save();

        return res.status(200).json("Post created");

    }catch(err){
        return res.status(500).json({message:err.message})
    }
}

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate(
      "userId",
      "name username email profilePicture"
    );
    return res.json({ posts });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};


// export const deletePost=async(req,res)=>{
//     const {token,post_id}=req.body;
//     try{

//         const user=await Post.findOne({token:token})
//         .select("_id");
//         if(!user) return res.status(404).json({message:"User not found"});

//         const post=await Post.findOne({_id:post_id});
//         if(!post){
//             return res.status(404).json({message:"Post not found"});
//         }

//         if(post.userId.toString()!==user._id.toString()){
//             return res.status(401).json({message:"Unauthorized"});
//         }

//         await Post.deleteOne({_id:post_id});

//         return res.json({message:"Post Deleted"});

//     }catch(err){
//         return res.status(500).json(err.message);
//     }
// }

export const deletePost = async (req, res) => {
  try {
    const { token, post_id } = req.body;

    if (!token || !post_id) {
      return res.status(400).json({ message: "Missing token or post_id" });
    }

    // ✅ Find the user from token
    const user = await User.findOne({ token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Find the post
    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // ✅ Ensure the post belongs to the user
    if (post.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // ✅ Delete the post
    await Post.deleteOne({ _id: post_id });
    return res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete Post Error:", err);
    return res.status(500).json({ message: err.message });
  }
};


export const get_comments_by_post=async(req,res)=>{
  const {post_id}=req.query;
  try{
    const post=await Post.findOne({_id:post_id});

    if(!post){
      return res.status(404).json({message:"Post not found"});
    }

    const comments=await Comment
    .find({postId:post_id})
    .populate("userId","username name");

    return res.json(comments.reverse());

  }catch(err){
    res.status(500).json({message:err.message});
  }
};

export const delete_comment_of_user=async(req,res)=>{
  const {token,comment_id}=req.body;

  try{
    const user=await User
    .findOne({token:token})
    .select("_id");
    if(!user) return res.status(404).json({message:"User not found"});

    const comment=await Comment.findOne({"_id":comment_id});
    if(comment){
      return res.status(404).json({message:"Comment not found"});
    }

    if(Comment.userId.toString()!==user._id.toString()){
      return res.status(401).json({message:"Unauthorized"});
    }

    await Comment.delete({"_id":comment_id});
    return res.json({message:"Comment Deleted"});

  }catch(err){
    return res.status(500).json({message:err.message});
  }
}


export const increment_likes=async(req,res)=>{
  const {post_id}=req.body;
  const userId = req.user?._id ;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  try{
    const post = await Post.findOne({ _id: post_id });
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check if user already liked the post
    if (post.likedBy.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User has already liked this post" });
    }

    // Add user to likedBy and increment likes
    post.likedBy.push(userId);
    post.likes = post.likes + 1;

    await post.save();
    return res.json({ message: "Like added successfully", likes: post.likes });
  }catch(err){
    return res.status(500).json({message:err.message});
  }
}

