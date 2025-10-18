const { createSlice } = require("@reduxjs/toolkit");
const { default: axios } = require("axios");
import { AcceptConnection, getAllUsers, getConnectionsRequest, getMyConnectionsRequest, loginUser, registerUser } from "../../action/authAction";
import { getAboutUser } from "../../action/postAction";

const initialState = {
  user: undefined,
  isError: false,
  isSuccess: false,
  isLoading: false,
  loggedIn: false,
  message: "",
  isTokenThere: false,
  profileFetched: false,
  connections: [],
  connectionsRequest: [],
  all_users: [],
  all_profiles_fetched: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => initialState,
    handleLoginUser: (state) => {
      state.message = "hello";
    },
    emptyMessage: (state) => {
      state.message = "";
    },

    setTokenIsThere: (state) => {
      state.isTokenThere = true;
    },

    setTokenIsNotThere: (state) => {
      state.isTokenThere = false;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "Knocking the door...";
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        (state.isLoading = false),
          (state.isError = false),
          (state.isSuccess = true),
          (state.loggedIn = true),
          (state.message = "Login is Successfull");
      })

      .addCase(loginUser.rejected, (state, action) => {
        (state.isLoading = false),
          (state.isError = true),
          (state.message = action.payload);
      })

      .addCase(registerUser.pending, (state) => {
        (state.isLoading = false), (state.message = "Registering you...");
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        (state.isError = true), (state.message = action.payload);
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.message = { message: "Registration is successful,Login" };
      })

      .addCase(getAboutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.profileFetched = true;
        state.loggedIn = true;
        state.user = action.payload || {};
        state.connections = action.payload.connections;
        state.connectionsRequest = action.payload.connectionsRequest;
      })

      .addCase(getAllUsers.fulfilled, (state, action) => {
        (state.isLoading = false),
          (state.isError = false),
          (state.all_profiles_fetched = true),
          (state.all_users = action.payload.profile);
      })

      .addCase(getConnectionsRequest.fulfilled, (state, action) => {
        state.connections = action.payload.connections;
      })

      .addCase(getConnectionsRequest.rejected, (state, action) => {
        state.message = action.payload;
      })

      .addCase(getMyConnectionsRequest.fulfilled, (state, action) => {
        state.connectionsRequest=action.payload;
      })

      .addCase(getMyConnectionsRequest.rejected, (state, action) => {
        state.message = action.payload;
      })



  },
});

export const { reset, emptyMessage, setTokenIsNotThere, setTokenIsThere } =
  authSlice.actions;

export default authSlice.reducer;
