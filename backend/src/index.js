import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import peopleRoutes from "./routes/peopleRoutes.js";
import threadRoutes from "./routes/threadRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import contextRoutes from "./routes/contextRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";

dotenv.config();

const app=express();
const PORT=process.env.PORT;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/people', peopleRoutes);
app.use('/threads', threadRoutes);
app.use('/tasks', taskRoutes);
app.use('/contexts', contextRoutes);
app.use('/reminders', reminderRoutes);

try{
    await connectDB();
    app.listen(PORT,()=>{
        console.log(`Server is running on PORT : ${PORT}`);
    })
}catch(error){
    console.error("Database connection failed : ",error);
    process.exit(1);
}