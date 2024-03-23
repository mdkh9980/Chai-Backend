// require('dotenv').config({
//     path:'./env'
// })
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path:'./env'
})

connectDB();















/*
This is one of the approach to connect the DB. 
You can also connect using a function also. but this is better than the function approach.

import { Express } from "express";

const app = express();


// Always Connect the database with Async Await wrapped in try catch block
// because whenever you try to connect with Database you will get errors
// so it is better to wrap in this, And do not connect the database in single line.
// Wrap in IIFE function.


( async() => { //in standard they can use ; at the begining of this line
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error)=>{
            console.log("ERROR: ", error)
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`The program is running on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("ERROR: ", error);
        throw error;
    }
})() //this is IIFE function which means it should be executed immediately. 

*/