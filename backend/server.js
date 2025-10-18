import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import postRoutes from './routes/post.routes.js'
import userRoutes from './routes/user.routes.js'


dotenv.config();

const app=express();
app .use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(postRoutes);
app.use(userRoutes)
app.use('/uploads', express.static('uploads'))


const start= async()=>{
    const mongosDB=await mongoose.connect(process.env.MONGO_URL);
    console.log("DB connected");

    app.listen(8080,()=>{
        console.log(`server is running on port 8080`);
    })


}


start();