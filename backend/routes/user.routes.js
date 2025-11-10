
import { Router } from "express";
import {
  acceptConnectionsRequest,
  downloadprofile,
  getAllUserProfile,
  getUploadUrl,
  getMyConnectionsRequest,
  getUserAndProfile,
  getUserProfileAndUserBasedUsername,
  register,
  sendConnectionRequest,
  updateProfileData,
  updateUserProfile,
  uploadProfilePicture,
  WhatAreMyConnections,
} from "../controllers/user.controllers.js";
import { login } from "../controllers/user.controllers.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uplodad = multer({ storage: storage });

router
  .route("/update_profile_picture")
  .post(uplodad.single("profile_picture"), uploadProfilePicture);

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/user_update").post(updateUserProfile);
router.route("/get_user_and_profile").get(getUserAndProfile);
router.route("/update_profile_data").post(updateProfileData);
router.route("/user/get_all_users").get(getAllUserProfile);
router.route("/user/download_resume").get(downloadprofile);
router.route('/api/uploads/url').get(getUploadUrl);
router.route("/user/send_connections_request").post(sendConnectionRequest);
router.route("/user/getConnectionRequest").get(getMyConnectionsRequest);
router.route("/user/user_connection_request").get(WhatAreMyConnections);
router.route("/user/accept_connection_request").post(acceptConnectionsRequest);
router
  .route("/user/get_profile_based_on_username")
  .get(getUserProfileAndUserBasedUsername);

export default router;
