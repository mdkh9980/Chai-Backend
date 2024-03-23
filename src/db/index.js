/* This file is used to connect the database and mongoose */
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async() => {
   try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
        console.log(`MongoDB Connected !! DB Host: ${connectionInstance.connection.host}`);
        /* Do the study about the above line variable i.e. connectionInstance.connection.host  . This connection is made so specific because the connection may be many like distribuiton connection on db and some other. For that reason we need to have specificity. */
   } catch (error) {
        console.log("MongoDB Connection ERROR : ", error);
        process.exit(1);
        /*process is nothing but the application which is running on node, this process is built in node so we can access anywhere in the project. */
   } 
}
export default connectDB