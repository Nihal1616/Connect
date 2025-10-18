import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";





export  const getAllPosts=createAsyncThunk(
    "post/getAllPosts",
    async(_,thunkAPI)=>{
        try{
            const response=await clientServer.get('/posts');

            return thunkAPI.fulfillWithValue(response.data)

        }catch(err){
            return thunkAPI.rejectWithValue(err.response.data)
        }
    }
)


export const getAboutUser=createAsyncThunk(
    "user/getAboutUser",
    async(_,thunkAPI)=>{
        try{
            const token = localStorage.getItem("token");
            const response = await clientServer.get("/get_user_and_profile", {
              params: {
                token,
              },
            });

            return thunkAPI.fulfillWithValue(response.data);
        }catch(err){
            return thunkAPI.rejectWithValue(err.response.data)
        }
    }
)


export const createPost=createAsyncThunk(
    "post/createPost",
    async(userData,thunkAPI)=>{
        const {file,body}=userData;

        try {
          const formData = new FormData();
          formData.append("token", localStorage.getItem("token"));
          formData.append("body", body);
          formData.append("media", file);

          const response=await clientServer.post("/post",formData,{
            headers:{
                'Content-Type':'multipart/form-data'
            }
          });

          if(response.status===200){
            return thunkAPI.fulfillWithValue("Post Uploaded");
          }else{
            return thunkAPI.rejectWithValue("Post not uploaded");
          }
        } catch (err) {
          return thunkAPI.rejectWithValue(err.response.data);
        }
    }
)

export const deletePost = createAsyncThunk(
  "post/deletePost",
  async (post_id, thunkAPI) => {
    try {
      const response = await clientServer.delete("/delete_post", {
        data: {
          token: localStorage.getItem("token"),
          post_id,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);


export const incrementPostLike = createAsyncThunk(
  "post/incrementLike",
  async (post, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await clientServer.post(
        `/increment_post_likes`,
        { post_id: post.post_id }, // only post_id needed
        {
          headers: {
            Authorization: token, // raw token works with crypto token middleware
            "Content-Type": "application/json",
          },
        }
      );

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to like the post";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);




export const getAllComments=createAsyncThunk(
  "post/getallComments",
  async(postData,thunkAPI)=>{
    try{
      const response=await clientServer.get("/get_Comment",{
        params:{
          post_id:postData.post_id
        }
      });
      return thunkAPI.fulfillWithValue({
        comments: Array.isArray(response.data) ? response.data : [],
        post_id: postData.post_id,
      });
    }catch(err){
      return thunkAPI.rejectWithValue("Something went wrong");
    }
  }
)


export const postComment=createAsyncThunk(
  "post/postComment",
  async(commentData,thunkAPI)=>{
    try{
      console.log({
        post_id:commentData.post_id,
        body:commentData.body
      })

      const response=await clientServer.post("/comment",{
        token:localStorage.getItem("token"),
        post_id:commentData.post_id,
        body:commentData.body
      });

      return thunkAPI.fulfillWithValue(response.data);
    }catch(err){
      return thunkAPI.rejectWithValue("Something went wrong");
    }
  }
)