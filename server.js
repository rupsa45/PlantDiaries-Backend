import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import connectDB from './config/monogodb.js'
import morgan from 'morgan'
import {v2 as cloudinary} from 'cloudinary';
const app =express()
const port = process.env.PORT || 5050;
connectDB()
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

app.get('/',(req,res)=> res.send("API IS WORKING"))

import authRouter from './routes/auth.routes.js'
app.use('/api/auth',authRouter);

import userRouter from './routes/user.routes.js';
app.use('/api/user',userRouter);

import postRouter from './routes/post.routes.js'
app.use('/api/plants',postRouter)

app.listen(port,()=> console.log(`Server started on PORT:http://localhost:${port}`));

