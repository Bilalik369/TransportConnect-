import mongoose from "mongoose";

export const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Data base connected")
    } catch (error) {
        console.log("Error connecting to database");
        process.exit(1);
    }
};

