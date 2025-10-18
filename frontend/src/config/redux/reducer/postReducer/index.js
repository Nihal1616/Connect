const { createSlice } = require("@reduxjs/toolkit")
import { getAllComments, getAllPosts } from "../../action/postAction"


const initialState={
    posts:[],
    isError:false,
    postfeatched:false,
    isLoading:false,
    loggedIn:false,
    message:"",
    comments:[],
    postId:"",
}


const PostSlice=createSlice({
    name:"post",
    initialState,
    reducers:{
        reset:()=>
            initialState,
            resetPostId:(state)=>{
                state.postId=""
            },

        
    },
    extraReducers:(builder)=>{
        builder
        .addCase(getAllPosts.pending,(state)=>{
            state.message="Featching all the posts..."
        })

        .addCase(getAllPosts.fulfilled,(state,action)=>{
            state.isLoading=false;
            state.isError=false;
            state.postfeatched=true;
            state.posts = Array.isArray(action.payload.posts)
              ? action.payload.posts.reverse()
              : action.payload.posts.reverse()
              ? [action.payload.posts.reverse()]
              : [];
        })

        .addCase(getAllPosts.rejected,(state,action)=>{
            state.isError=true;
            state.isLoading=false;
            state.message=action.payload;
        })
        .addCase(getAllComments.fulfilled,(state,action)=>{
            state.postId=action.payload.post_id,
            state.comments=state.comments = Array.isArray(action.payload.comments)
        ? action.payload.comments
        : [];
        })
    }


})

export const { resetPostId } = PostSlice.actions;

export default PostSlice.reducer;