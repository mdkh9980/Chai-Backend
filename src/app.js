import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

/* when you have cors imported you have two things to add in the project, you can add configuarations and other you can add middleware. Configuarations are different of input and outputs we set for a particular project like couple of them are below those are configuarations of project */

/* You will use these cors and cookie parser packages after the app is built. whenever you write 
app.use(cors()) this means you are creating a middleware, it has some of the option it is very useful once check the docs of this cors to understand the requirement of particular app. For now we need to know only two one is origin and other is credentials: true */

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

/* we get the input in various form it might be in json, in express we use this 
express.json() and these has some option like limit(to limit the amount of data to send) like it might be in kb(kilo-byte)  */

app.use(express.json({limit: "16kb"}))

/* We might get the data or input from url also, in express we use the express.urlencoded() if you write this much is enough but in some of the code bases it, they will some options like extended where it we extend the into nested things too. Limit option is also available to limit the amount of data we get */

app.use(express.urlencoded({extended: true, limit: "16kb"}))

/* We might receive some data like pdf files or images we need to store it express this express.static is used to store the files. we can make it a public folder which is present in the file structure where everyone can access */

app.use(express.static("public"))

/* This below line is also a configuaration because this follows the syntax of app.use(), cookieParser() is also some of the options, if we leave it without options it will work great if we need something then we will jump to docs and find out the requirement */

app.use(cookieParser())


// routes import
import userRouter from "../src/routes/user.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter)

export { app }