import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { connection } from "next/server";


export const loginUser=createAsyncThunk(
    "user/login",
    async(user,thunkAPI)=>{
        try{
            const response=await clientServer.post(`/login`,{
                email:user.email,
                password:user.password,
            });

            if(response.data.token){
                localStorage.setItem("token", response.data.token);
                return response.data.token;
            }else{
                return thunkAPI.rejectWithValue({
                    message:"token not provided"
                });
            }
            

        }catch(err){
            return thunkAPI.rejectWithValue(err.response.data)
        }
    }
)

export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post(`/register`, {
        username: user.username,
        password: user.password,
        email: user.email,
        name: user.name,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        return response.data.token;
      } else {
        return thunkAPI.rejectWithValue({ message: "token not provided" });
      }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);


export const getAllUsers=createAsyncThunk(
  "user/getAllUsers",
  async(_,thunkAPI)=>{
    try{
      const response = await clientServer.get("/user/get_all_users");

      return thunkAPI.fulfillWithValue(response.data);
    }catch(err){
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
)

export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async (user, thunkAPI) => {
    try {

      const response = await clientServer.post(
        "/user/send_connections_request",
        { 
          token:user.token,
          connectionId:user.user_id,
        },
      );

      thunkAPI.dispatch(getConnectionsRequest({ token: user.token }));
      thunkAPI.dispatch(getMyConnectionsRequest({ token: user.token }));

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to send connection request"
      );
    }
  }
);



export const getConnectionsRequest = createAsyncThunk(
  "user/getConnectionsRequest",
  async(user,thunkAPI)=>{
    try{

      const response = await clientServer.get("/user/getConnectionRequest",{
        params:{
          token:user.token
        },
      });

      return thunkAPI.fulfillWithValue(response.data);

    }catch(err){
      return thunkAPI.rejectWithValue(err.response.data.message)

    }
  }
);

export const getMyConnectionsRequest = createAsyncThunk(
  "user/getMyConnectionsRequest",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/user_connection_request", {
        params: {
          token: user.token,
        },
      });

      return thunkAPI.fulfillWithValue(response.data.connections);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch connections"
      );
    }
  }
);


export const AcceptConnection=createAsyncThunk(
  "user/acceptConnection",
  async(user,thunkAPI)=>{
    try{

      const response = await clientServer.post(
        "/user/accept_connection_request",{
          token:user.token,
          requestId:user.connectionId,
          action_type:user.action
        }
      );
      
      thunkAPI.dispatch(getConnectionsRequest({token:user.token}));
      thunkAPI.dispatch(getMyConnectionsRequest({token:user.token}));


      return thunkAPI.fulfillWithValue(response.data);

    }catch(err){
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
)

