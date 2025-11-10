
import User from "../models/user.model.js";
import Post from '../models/posts.model.js'
import Profile from "../models/profile.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from 'pdfkit'
import fs from 'fs';
import axios from 'axios';
import path from 'path';
import  ConnectionRequest  from "../models/connections.model.js";
import Comment from "../models/comments.model.js"



const convertUserDataToPDF = async (userData) => {
  const doc = new PDFDocument();

  const outputPath = crypto.randomBytes(16).toString("hex") + ".pdf"; // shorter random name

  const stream = fs.createWriteStream("uploads/" + outputPath); // FIXED
  doc.pipe(stream);

  // === Profile Picture Section ===
  // We'll support both local filenames (stored in DB) and absolute URLs.
  // If the profilePicture is an absolute URL, download it to a temporary file
  // inside uploads/ and use that for PDF rendering.
  let tempDownloadedImage = null;
  let localImagePath = null;
  if (userData.userId.profilePicture) {
    let picValue = userData.userId.profilePicture;
    try {
      // normalize to string and trim
      picValue = String(picValue).trim();

      // If picValue looks like an absolute URL (case-insensitive), download it.
      if (/^https?:\/\//i.test(picValue) || picValue.includes('://')) {
        try {
            // try to request the image using a safe encoded URL
            const safeUrl = encodeURI(picValue);
            const resp = await axios.get(safeUrl, { responseType: 'arraybuffer' });
            const ext = path.extname(new URL(safeUrl).pathname) || '.jpg';
            const tempName = crypto.randomBytes(12).toString('hex') + ext;
            const tempPath = `uploads/${tempName}`;
            fs.writeFileSync(tempPath, resp.data);
            tempDownloadedImage = tempPath;
            localImagePath = tempPath;
          } catch (downloadErr) {
            console.warn('Failed to download remote profile picture:', downloadErr.message);
            // if download fails, fallback to the default placeholder image to avoid ENOENT
            localImagePath = 'uploads/default.jpg';
          }
      }

      // If we didn't set localImagePath via download, build a safe local path
      if (!localImagePath) {
        // If stored value already contains uploads/ or starts with a slash, normalize it
        if (picValue.startsWith('/uploads/')) {
          localImagePath = picValue.slice(1); // remove leading slash
        } else if (picValue.startsWith('uploads/')) {
          localImagePath = picValue;
        } else {
          // treat as filename
          localImagePath = `uploads/${picValue}`;
        }
      }

      // Ensure the resolved localImagePath actually exists. If not, use default placeholder
      try {
        if (!fs.existsSync(localImagePath)) {
          console.warn('Resolved image path does not exist, using default:', localImagePath);
          localImagePath = 'uploads/default.jpg';
        }
      } catch (e) {
        console.warn('Error checking image path existence:', e.message);
        localImagePath = 'uploads/default.jpg';
      }
    } catch (err) {
      console.error('Failed to prepare profile image for PDF (normalize):', err);
      localImagePath = null;
    }
  }

  if (localImagePath) {
    const pageWidth = doc.page.width;
    const centerX = pageWidth / 2;
    const topMargin = 60;
    const radius = 50;

    // Shadow
    doc.save();
    doc
      .circle(centerX + 3, topMargin + radius + 3, radius)
      .fillColor("#000", 0.15)
      .fill();
    doc.restore();

    // Circular clipped image
    doc.save();
    doc
      .circle(centerX, topMargin + radius, radius)
      .clip()
      .image(localImagePath, centerX - radius, topMargin, {
        width: radius * 2,
        height: radius * 2,
      });
    doc.restore();

    // Border
    doc
      .circle(centerX, topMargin + radius, radius)
      .lineWidth(3)
      .strokeColor("#AEB6BF")
      .stroke();

    // Caption
    doc
      .fontSize(12)
      .fillColor("#666")
      .text("Profile Picture", centerX - 40, topMargin + radius * 2 + 10, {
        align: "center",
        width: 80,
      });
  }

  // === USER NAME ===
  doc.moveDown(3);
  doc
    .fontSize(20)
    .fillColor("#222")
    .font("Helvetica-Bold")
    .text(userData.userId.name, { align: "center" });

  doc.moveDown(0.5);
  doc
    .fontSize(14)
    .fillColor("#666")
    .font("Helvetica")
    .text(`@${userData.userId.username}`, { align: "center" });

  // === HORIZONTAL LINE ===
  doc.moveDown(0.5);
  const pageWidth = doc.page.width;
  doc
    .moveTo(70, doc.y)
    .lineTo(pageWidth - 70, doc.y)
    .strokeColor("#DDDDDD")
    .stroke();

  // === USER INFO SECTION ===
  doc.moveDown(1.5);
  doc
    .fontSize(16)
    .fillColor("#1E1E1E")
    .font("Helvetica-Bold")
    .text("User Information", { underline: true });

  doc.moveDown(0.5);
  doc
    .fontSize(13)
    .fillColor("#333")
    .font("Helvetica")
    .text(`Email: ${userData.userId.email}`)
    .text(`Bio: ${userData.bio || "N/A"}`)
    .text(`Current Position: ${userData.currentPost || "N/A"}`);

  // === PAST WORK SECTION ===
  doc.moveDown(1.5);
  doc
    .fontSize(16)
    .fillColor("#1E1E1E")
    .font("Helvetica-Bold")
    .text("Past Work Experience", { underline: true });

  if (userData.pastWork?.length > 0) {
    doc.moveDown(0.5);
    userData.pastWork.forEach((work) => {
      doc
        .fontSize(13)
        .fillColor("#333")
        .font("Helvetica")
        .text(`• Company: ${work.company}`)
        .text(`  Position: ${work.position}`)
        .text(`  Years: ${work.years}`)
        .moveDown(0.5);
    });
  } else {
    doc.moveDown(0.5);
    doc.fontSize(13).fillColor("#777").text("No past work records available.");
  }

  // === FOOTER LINE ===
  doc.moveDown(1.5);
  doc
    .moveTo(70, doc.y)
    .lineTo(pageWidth - 70, doc.y)
    .strokeColor("#EAEAEA")
    .stroke();
  doc.moveDown(0.5);
  doc
    .fontSize(10)
    .fillColor("#999")
    .text("Generated by Career Profile Builder © 2025", { align: "center" });

  // === FINALIZE PDF ===
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      // clean up any temporary downloaded image we created
      if (tempDownloadedImage) {
        fs.unlink(tempDownloadedImage, (e) => {
          if (e) console.warn('Failed to remove temp image:', e.message);
        });
      }
      resolve(outputPath);
    });
    stream.on("error", (err) => reject(err));
  });
};

export default convertUserDataToPDF;



export const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

      if (!name || !email || !password || !username)
        return res.status(400).json({ message: "All fields are required " });

    const user = await User.findOne({
      email,
    });
    if (user) return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });
    await newUser.save();

    const profile = new Profile({ userId: newUser._id });

    await profile.save();

    return res.json({ message: "User Created" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required " });

    const user = await User.findOne({
      email,
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Credentials" });

    //generating the token
    const token = crypto.randomBytes(32).toString("hex");

    await User.updateOne({ _id: user._id }, { token });
    return res.json({ token,user });
  } catch (e) {
    console.log(e);
  }
};

export const uploadProfilePicture = async (req, res) => {
  const { token } = req.body;

  try {
    // Find user by token
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Before saving new filename, try to remove the previous file (if any)
    try {
      const prev = user.profilePicture;
      if (prev && typeof prev === 'string') {
        let prevFilename = prev;
        // If prev is a full URL, extract basename
        if (prev.startsWith('http://') || prev.startsWith('https://')) {
          try {
            prevFilename = path.basename(new URL(prev).pathname);
          } catch (e) {
            prevFilename = path.basename(prev);
          }
        } else {
          // could be a path or filename
          prevFilename = path.basename(prev);
        }

        // avoid deleting the default placeholder image
        if (prevFilename && prevFilename !== 'default.jpg' && prevFilename !== req.file.filename) {
          const prevPath = `uploads/${prevFilename}`;
          if (fs.existsSync(prevPath)) {
            try {
              fs.unlinkSync(prevPath);
            } catch (e) {
              console.warn('Failed to remove previous profile picture:', e.message);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error while attempting to remove previous profile picture:', e.message);
    }

    // Build the public URL (useful for responses)
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    // Store only the filename in DB for consistency
    user.profilePicture = req.file.filename;

    await user.save();

    return res.json({
      message: "Profile picture updated successfully",
      // return both the stored filename and the public URL
      profilePicture: req.file.filename,
      url: imageUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


export const updateUserProfile = async (req, res) => {
  try {
    const { token, ...newUserDate } = req.body;

    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { username, email } = newUserDate;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      if (existingUser || String(existingUser._id) !== String(user._id)) {
        return res.status(400).json({ message: "User already exist" });
      }
    }

    Object.assign(user,newUserDate);

    await user.save();

    return res.json({ message: "user Updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture"
    );

    

    return res.json(userProfile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const updateProfileData = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body;

    const userProfile = await User.findOne({ token: token });
    if (!userProfile)
      return res.status(404).json({ message: "User not found" });

    const profile_to_update = await Profile.findOne({
      userId: userProfile._id,
    });

    Object.assign(profile_to_update, newProfileData);

    await profile_to_update.save();

    return res.json({ message: "Profile Updated" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



export const getAllUserProfile=async(req,res)=>{
  try{

    const profile=await Profile.find().populate("userId","name username email profilePicture");

    return res.json({profile});

  }catch(err){
    return res.status(500).json({message:err.message});

  }

}

// export const downloadprofile=async (req,res)=>{

//   const user_id=req.query.id;

//   const userProfile=await Profile.findOne({userId:user_id})
//   .populate('userId','name username email profiePicture');

//   let outputPath=await convertUserDataToPDF(userProfile);

//   return res.json({"message":outputPath})
// }

export const downloadprofile = async (req, res) => {
  try {
    const user_id = req.query.user_id;

    if (!user_id) {
      return res
        .status(400)
        .json({ message: "user_id query param is required" });
    }

    const userProfile = await Profile.findOne({ userId: user_id }).populate(
      "userId",
      "name username email profilePicture"
    );

    if (!userProfile) {
      return res
        .status(404)
        .json({ message: "Profile not found for this user" });
    }

    // ✅ Generate the PDF and get the file path
    const outputPath = await convertUserDataToPDF(userProfile);

    // ✅ Extract only filename (no "uploads/" prefix, no URL)
    const fileName = path.basename(outputPath);

    // ✅ Ensure the file exists before sending back
    const absolutePath = path.join("uploads", fileName);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    // ✅ Send only filename to frontend
    return res.json({ message: fileName });
  } catch (err) {
    console.error("Error in downloadprofile:", err);
    return res.status(500).json({ message: err.message });
  }
};


// Return a full public URL for a stored uploads filename.
export const getUploadUrl = async (req, res) => {
  try {
    const { file } = req.query;
    console.log('getUploadUrl called, file=', file);
    if (!file) return res.status(400).json({ message: 'file query param is required' });

    // sanitize to basename to avoid path traversal
    const filename = path.basename(file);
    const url = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    return res.json({ url, filename });
  } catch (err) {
    console.error('getUploadUrl error:', err);
    return res.status(500).json({ message: err.message });
  }
};



export const sendConnectionRequest=async(req,res)=>{


  const {token,connectionId}=req.body;

  try{
    const user=await  User.findOne({token});

    if(!user) return res.status(404).json({message:"User not found"});

      const connectionUser=await User.findOne({_id:connectionId});

      if(!connectionUser)return res.status(404).json({message:"Connection User not found"});

    const existingRequest = await ConnectionRequest.findOne({
      userId:user._id,
      connectionId:connectionUser._id
    });

    if(existingRequest){
      return res.status(400).json({message:"Request already sent"});

    }

    const request=new ConnectionRequest({
      userId:user._id,
      connectionId:connectionUser._id
    });

    await request.save();
    return res.status(201).json({
      message: "Connection request sent successfully",
      request,
    });
  }catch(err){
    return res.status(500).json({messsage:err.message});
  }

}


export const getMyConnectionsRequest=async(req,res)=>{
  const {token}=req.query;

  try{
    const user=await  User.findOne({token});

    if(!user) return res.status(404).json({message:"User not found"});

    const connections=await ConnectionRequest.find({userId:user._id})
    .populate('connectionId','name username email profilePicture');

    return res.json({connections});

  }catch(err){
    return res.status(500).json({message:err.message});
  }
}

export const WhatAreMyConnections=async(req,res)=>{
  const {token}=req.query;
  try{
    const user=await User.findOne({token});

    if(!user){
      return res.status(404).json({message:"User not found"});
    }

    const connections = await ConnectionRequest.find({
      connectionId: user._id,
    }).populate("userId", "name username email profilePicture");


    return res.json({connections});

  }catch(err){
    res.status(500).json({message:err.message});
  }
}


export const acceptConnectionsRequest=async(req,res)=>{
  const {token,requestId,action_type}=req.body;

  try{
    
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connection=await ConnectionRequest.findOne({_id:requestId});
    if(!connection) return res.status(404).json({messsage:"connection not found"});

    if(action_type==="accepted"){
      connection.status_accepted=true;
    }else{
      connection.status_accepted=false;
    }

    await connection.save();

    return res.json({message:"Request updated"});


  }catch(err){
    return res.status(500).json(err.message);
  }
}

export const commentPost = async (req, res) => {
  const { token, post_id, body } = req.body;

  try {
    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findOne({
      _id: post_id,
    });
    if (!post) return res.status(404).josn({ message: "Post not found" });

    const comment = new Comment({
      userId: user._id,
      postId: post_id,
      body: body,
    });

    await comment.save();

    return res.status(200).json({ message: "Comment Added" });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

export const getUserProfileAndUserBasedUsername=async(req,res)=>{

  const {username}=req.query;
  try{
    const user=await User.findOne({
      username
    })
    if(!user){
      return res.status(400).json({message:"User not found"});
    }

    const userProfile=await Profile.findOne({userId:user._id})
    .populate('userId','name username email profilePicture');

    return res.json({"profile":userProfile});

  }catch(err){
    return res.status(500).json(err.message);

  }
}



export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization; // raw token from frontend
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    // Find user with this token
    const user = await User.findOne({ token });
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    req.user = user; // attach user to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
