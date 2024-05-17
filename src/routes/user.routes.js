/* Watch this video again So that you learn debuggling */

import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

// When this route hits we need to run a callback function called registerUser. We can handle this data directly without any middlewares, We are handling files i.e. images for avatar and coverImage for that reason we need to use a multer middleware to upload files on cloudinary. Before running registerUser callback we need to run middleware, we need to import it from middleware directory. we have imported multer middleware as "upload". upload gives us many different options because it is from multer, we have single, array, fields and more. if we want to upload a single file then we would have used single, same scenario with array, we will use fields option which accepts array, which can be array of objects. Here we are uploading two different images i.e. avatar and coverImage. first object will be avatar and other will be coverImage, If you have different use case please go and refer docs for your use case. Each object has element name and maxCount there is no restriction in having number of options we can have one or two, when deciding the name in this fields we have to communicate with frontend engineer becase name should be same. for first image we are calling avatar and other coverImage. Below syntax is industry standard but we have couple more syntaxes.


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

export default router