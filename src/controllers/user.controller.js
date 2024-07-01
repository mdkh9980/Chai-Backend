import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

/* 
    generating access token and refresh token is just async method because this is not a web request this is a internal matter where we want create tokens for login. 
    To create this we need userId, we can get the user id, because in login method we have instance of User model called user, from that user we can pass userId.
    Wrap it in try catch block we might get something wrong while generating tokens.
    - we need to find the user by id and hold that instance in a variable, and same way generate both access and refresh token and hold it in a variable,earlier we have inserted the methods in userSchema in model directory, from those methods we will generate both access token and refresh token.
    - now add the refreshToken to database which you have created. now comes the question how to add a field in the database, take the instance you created user.refreshToken can access it with dot operator which name you have given in database, user.refreshToken = refreshToken, give the variable which you hold the refreshToken.
    - Now you have updated the refresh Token but you have to save also, for that we have a method called save(). in this we have object parameter.
    - Now there is a challenge when you save anything in database you need password or else it would not work for that reason in the save method we need to pass an argument in object called validateBeforeSave: false now we can save with the password also, if you are saving password then this is not required in save() method.
    - now return the tokens in object format.

*/

const generateAccessAndRefreshToken = async (userId) => {
        try {
            const user = await User.findById(userId);
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();
            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false })
            
            
            return {accessToken, refreshToken}
        } catch (error) {
            throw new ApiError(500, "Error while generating tokens")
        }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from front-end
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary
    // create user-object - create entry in db
    // remove pasword and refresh tokens fields from response
    // check for user creation 
    // return res


    /* 
        first step is to get the details from frontend, to get the data, all the data is present in req.body, forms data also present in it, and JSON data also present in body. If you are getting data from URL then you need handle it separately. 
        Now extract and store data from req.body by destructing body object.
        To check whether it is working or not, go to postman and send the raw data in json format, console.log any value from destructing, if you can get one varible data, remaining also you will get.
    */
    const {username, email, fullName, password} = req.body
    console.log("Email : ", email);

    /* 
        Second step is to validate all the fields are correct or not. If you are beginner you can use if else statements for all the variables, after being in the industry for some time you can use .some() method to check as we given in the if() condition. We have created file called ApiError. because we are sending the error in the same format, and we are going to use this whenever something goes wrong, for that reason we have wrapped in a file to use often. 
        
        meaning of that if condition, take an array and add all the fields you want to check add in it, that is an array, array has many options we have map(), and we have some() methods it will return boolean value. and it needs callback function, we are directly returning the values, [].some((item) => item?.trim() === ""). when some() method iterates through checks the conditions item in array, if item is present we have to put optional "?", trim that item after trimming also if it is empty then throw an error. We need to add optional "?" to check it is present or not. 

        Now you can validate email also to check whether it contain @ symbol or not, you can use methods and with help of one if condition, we can write as many validations as we want no issues in it.
    */
    
    if (
        [fullName, username, email, password].some((fields) => fields?.trim() == "")
    ) {
        throw new ApiError(400, "All Fields are Required");
    }

    /* 
        Third Step : we need to check whether the user already exists ot not.
        For checking user present or not we need to we need to import a user model from the models directory with the name "User", User is imported from mongoose model it will have options, here we are checking for whether this email, username exists or not. if we need to check one we can directly pass this way User.findOne({username}) if it is email we give email instead of username. but here we are checking for two different fields, from mongoose we get options to check one of them option is $or which accepts array of objects. it will return boolean, it goes through document and checks whether this user exists or not. store it in a varible and add the if condition if is true then it will through an ApiError.
    */

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    /* 
        Fourth Step : Check for images, mainly check for avater because the is required.
        In req.body all the data will be present in almost all cases, when you are uploading the file you have passed a middleware from multer, this middleware will add some other properties and data in req.body itself, for accessing files we need to take check for files we need to use optional symbols to check. "req.files?.avatar[0]?.path", this means that in req.files check if it is present with the name of avatar and this avatar will be having many different properties too like which type of image jpeg, png, jpg and size and so on, in the first property we get a object if we take that optinally we need path, what happens with this line is that, complete path will be provided to you whichever way multer has uploaded the file. we have stored this in a variable called avatarLocalPath because it is still is on server, not on cloudinary. same thing with coverImage. 
        And we have got the local path, we need to check for avatar because it is required field, check whether did we get the avatar file or not.


        TIP : CONSOLE.LOG ALL THINGS AND SEE WHAT ALL YOU ARE GETTING IN IT. THAT IS THE MOST UNDERATTED WAY OF LEARNING THEN ONLY YOU WOULD KNOW WHAT ALL IS PRESENT IN EACH VARIBLE. for example console log req.boady, req.files, req.files?.avatar, req.files?.avatar[0], req.files?avatar[0]?.path and in the above codes also console log existed used, try to console all the varibles and see you will learn a lot.
    */

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path


    // let avatarLocalPath;
    // if(req.files && Array.isArray(req.files.avatarLocalPath) && req.files.avatarLocalPath.length > 0){
    //     avatarLocalPath = req.files.avatar[0].path
    // }
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar File is required")
    }

    /* 
        Fifth Step : Upload images on cloudinary
        we have done our preparations so we have a helper file on cloudinary.js which will upload the file on cloudinary and it requires one localFilePath. If you did not do the preparation before now you will writing that code. 
        We need to await this because uploading on clodinary we needs wait, we are intentionally waiting until it uploads on cloudinary.
        Again you need to check for avatar file is uploded correctly or not because database will break because it is a required field.
    */

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    /* Avatar is required field if the required is not there then database will be garbage kind of a thing. BE CAUTIOUS so check again whether it is uploaded or not */

    if (!avatar) {
        throw new ApiError(400, "Avatar File is required")
    }

    /* 
        Sixth Step: Create a user object , create database entry.
        Only one method is communicating with the database is "User", and it comes with many different option in that create is also an option which accepts object, we can send fullName, avatar : will be an avatar.url, we know that url is present at any cost, because we did the checking before coming here. for coverImage we did not check whether it is present or not, it might be empty or it might contain url, for that reason you need to check either url is present or not if it is present then add it to database if not let it be empty. Similarly we need to add email, password and username: we intended to keep the username to lowercase for that reason we are applying the method toLowerCase().
    */

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    /*
        Seventh Step : remove password and refreshToken fields from response.
        before removing we need to check whether user is created or not, for the we need to call the databases again it is extra database call try to optimize it if possible. we are finding by id where this id is present or not, if it is present we will remove the password and refreshToken from it using .select() method, it syntax is weird remember it accepts strings and by default every field is selected whichever field you don't you need to add minus before that field name then that field will be deselected from the user object or user entry. After doing this thing we can check now whether the user is created or not, if not send error 500, because server did not created the user.
    */

    const createUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createUser){
        throw new ApiError(500, "Something went wrong while registering user");
    }

    /* 
        Last step :
        Here user is created successfully, and we need to send the response back, here we can send the response however we want but earlier we have defined a ApiResponse.js, this file is used for structing the response in a standard format. we can send the response this way also return .status(201).json({createdUser}) this is also true but before we have decided to send the response in certain format for that reason we need to create new object of the class ApiResponse which accepts statusCode, data and message. data is nothing but createrUser varible.
    */

    return res.status(201).json(
        new ApiResponse(200, createUser, "User Registered Successfully")
    )

} )

/* 
    Access Token and Refresh Token : Why two are required?
    Access token is absolutely necessary for logging in, extra is refresh token only why this required means when a user is logged in we will generate both access token and refresh token both at time in a same way but the difference is expiration access token is short lived compared to refresh token, refresh token is stored in database, we don't need to login again if we have the refresh token, server and user will communicate through refresh tokens, no need to login again with password and all.

*/

const loginUser = asyncHandler( async (req, res) => {
    // my algorithm
    // take input from user, username, fullname, email, password.
    // check for refresh token if it is empty then go ahead and create new.
    // generate an access token and refresh token at a time for according to that
    // login the user with the email and password.
    // now store the refresh token in database.

    // video algorithm
    // req.body -> data
    // username or email
    // find the user.
    // password check
    // access token and refresh token
    // send secure cookie.


    // we can get data by destructring the object for email or for username from req.body
    const {email, username, password} = req.body;

    if(!email){
        throw new ApiError(400, "Email is required");
    }

    if(!password){
        throw new ApiError(400, "Password is required");
    }
            
    // checking whether user has sent username or email or not, we can do only username or only email
    // if both email or username is not empty then check whether this user is existed or not. for this we need to use the User model which is communicating with the database with the method User.findOne({}), you can pass any query to find in the database either existed or not.

    const user = await User.findOne({
        $or: [{email}, {username}]
    });


    // check user exist or not, if not then throw new apierror.
    if(!user){
        throw new ApiError(404, "User not found");
    }

    // if user exists we need to check for the entered password is correct or not. for that we have already created a method in userModel, and now we are going to use it. One more thing to remember very important. When you are comparing the password which is entered by the user while logging in, the method you created to check whether this password is correct or not, it is stored in the instance of user not in User. This Capital User is that model or document of the mongoose in this model all the mongoose methods will be present but not your methods which you created to compare the password. user which is instance of the User model, in this your methods are available so please keep in mind.

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user Credentials");
    }

    // Now generating access token and refresh token.This method we are going to create it many times for that reason we need to create a separate method for it, and call whenever user wants to sign in.

    //now we have generated the roken with the method we have created above, don't forget to add await here because in generating tokens method you called the database and it will take time to generate for that reason you need to await this method and pass user id as argument from the instance which you accessed through User Model. With the help of destructuring we will hold both access token and refresh token.

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user?._id);

    // Now we did save it in the database but we do not have access to the token in user instance in this method. for that reason we need to create a loggedinUser which will hold all the things except password and refresh tokens.

    const loggedInUser = await User.findById(user?._id).select("-password -refreshToken");

    // now we need to send the cookie to user, for sending cookie we need to design some option before sending. it has some option like httpOnly and secure we need to make these two true, basically cookies can be modified in the frontend when you kept these two options for true this is not modifiable from the frontend this is only modifiable from server but we can see the cookies. 

    const options = {
        httpOnly: true,
        secure: false
    }

    // now send the response that everything went successfully and user can login. we sent the status code and sent accessToken and refreshToken in cookies but why do we need to send tokens again in json data, because if the user wants to save the tokens locally or user will be building the mobile applications in mobile applications the we do not have tokens access, it might be for that reason so it is a good practice to send these tokens also to user.

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {user: loggedInUser, accessToken, refreshToken},
            "Logged In successfully"
        )
    )
} )

/* 
    Now similarly we need to write functinality logout. now we need to have the access of User but we do not have the access in the logout we cannot ask the user to give the email and password to logout, if we ask then he can logout whoever he wants. so for that reason we need not to ask for email and password to logging out. Now the challenge is to get the access of user. 

    we have inject the cookie-parser in this project so it is a two way communication, cookie will be present in response and request also, and remember we sent the token in json data also, how to log out, we will logout using cookies, cookies are availble in request also and response also. for this we need to design a middleware it will be called whenever user wants to logout. 
*/

const logoutUser = asyncHandler ( async ( req, res ) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {refreshToken: undefined}
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: false
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged out successfully")
    )

} )


/*
    Now why this below function called refreshAccesToken is required
    - This is to refresh the access token, when the access token is expired, we know that refresh token is present in database, and we sent it on cookies, now we need to refresh it.
    - 
*/

const refreshAccessToken = asyncHandler ( async (req, res) => {

    // refresh token can be accessed from cookies and body if he is using mobile.
    // why this variable means called incomingRefreshToken because we have refreshToken in database also and this is sent by user.

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    // what if we do not get refresh tokens so check whether we got the token or not.

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        // Now we have the refresh token, now we have to verify is this a real token or a fake token from someone else
        // We need to decode this token also to verify and decoding can done at same time so now we need use jwt.verify method it requires two things one which token to verify and from what code we need to verify, like comparision, compare the incoming token with the available token.
    
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        // This findById method will check whether token is sent by the user exits in the database or not. if it exits continue if it does not exists you can say Invalid Access.
    
        const user = await User.findById(decodedToken?._id);
    
        // check where used exits in the database or not.
        if(!user){
            throw new ApiError(401, "Invalid Refresh token");
        }
        // now we have two decoded tokens one in incomingRefreshToken and other in user which is from the database, now we need to compare these two token are same or not, if not sent the api error.
    
        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used");
        }
    
        // Now verification and checking has been completed and now we can generate the access token and send a new token in response, for generating new access token we have already declared a method which generates tokens, and we need to send the options to keep it secure.
    
        const options = {
            httpOnly: true,
            secure: false
        }
    
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(200, { accessToken, refreshToken : newRefreshToken }, "Token refreshed successfully")
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }

} )


const changeCurrentPassword = asyncHandler ( async (req, res) => {
    // In this method we are writing changing the password of a logged in user, This method is useful only if he is logged in, in this we will take old password and new password, of course we can take confirm password also this need to be an extra check and it can easily handled in the front end. just take two parameters, oldPassword and newPassword.

    const {oldPassword, newPassword} = req.body;

    // Now we need to extract user id from req.body and send in database to find whether this user is existed or not, logged in or not.
    const user = await User.findById(req.user?._id);

    // here we are checking that user's old password is correct or not, by using the method which we have declared in user model.

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password");
    }

    // we have reached a stage where we can take the new password and hash it. for this changing password logic and hashing it is written in user model itself.

    user.password = newPassword;

    await user.save({validateBeforeSave: false})

    return res.status(200).json(
        new ApiResponse(200, {}, "Password Changed successfully")
    )

} )

const getCurrentUser = asyncHandler ( async (req, res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
    )
} )

/*
    now you can write whatever controllers you need but see in this user.controller file you need to decide what changes you are giving user to change like passwords or name, email, username, like this you can write whatever controller you need.

    Advice: When you want update the files please write that controller and endpoint separately because if you write in the same file then the whole text or content in this filed will get resaved again if it loses then you need to take the text fields again from the user, so keep it separatly if you have any image or files to update.
*/

const updateAccountDetails = asyncHandler ( async (req, res) => {

    // here you can give options to your user what all he needs, to changer for this example we are giving options to change only fullName and email
    const {fullName, email} = req.body;

    if(!fullName && !email){
        throw new ApiError(400, "We are giving only two options to change either fullName and email both cannot be empty");
    }
    // now we need to get the user to update the details provided by the user for the we need to find the user by if. 

    const user = await User.findByIdAndUpdate(
        req.user?._id, // passing user id to change the content which is sent by user.
        {
            $set: {
                fullName,
                email
            } // these are mongoose operator these will perform crud operations learn about it.
        },
        {new: true} // this object will return the user after saving what all it is saved newly.
    ).select("-password") // here we have added this select method to remove the password from the user this is where you can reduce calling for database should be concerned.

    return res.status(200).json(
        new ApiResponse(200, {}, "Details updated successfully")
    )


} )

/*
    now we write a controller to updating files like images and pdfs and so on. for this we need to pass two middlewares because first we need to check whether user is logged in or not, and other middleware to upload the file that is multer middleware.
*/

const updateUserAvatar = asyncHandler ( async (req, res) => {

    // Here we are using only req.file not req.files because here we are uploading only one file.

    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Field should not be empty");
    }
    // if we got the path of avatar file then we will upload on cloudinary.

    // TODO: write a util to delete the previous image url from cloudinary and database.

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading on avatar file on cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {avatar: avatar.url} // remember you made a mistake by writing only avatar.
        },
        {new : true}
    ).select("-password")

    if(!user){
        throw new ApiError(401, "Error while updating or finding the user");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar Updated Successfully")
    )

} )

const updateUserCoverImage = asyncHandler ( async (req, res) => {

    // Here we are using only req.file not req.files because here we are uploading only one file.

    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath){
        throw new ApiError(400, "Field should not be empty");
    }
    // if we got the path of avatar file then we will upload on cloudinary.

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading on avatar file on cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {coverImage: coverImage.url} // remember you made a mistake by writing only avatar.
        },
        {new : true}
    ).select("-password")

    if(!user){
        throw new ApiError(401, "Error while updating or finding the user");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover Image Updated Successfully")
    )

} )

const getUserChannelProfile = asyncHandler( async (req, res) => {
    

    // Got Error while sending the username through params but it is working with body. 
    // Check once and improve the code and optimise it.
    const {username} = req?.body

    if(!username?.trim()){
        throw new ApiError(400, "Username is required");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers"
                },
                channelsSubscribersTo : {
                    $size: "$subscribedTo"
                },
                isSubscribed : {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                subscriberCount: 1,
                channelsSubscribersTo : 1,
                isSubscribed: 1
            }
        }
    ])

    /*
        Console log the channel value and see what data type you will get as an output because it is very important and further how to manipulate the data
    */

    if(!channel?.length){
        throw new ApiError(404, "Channel Do Not Exists");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched Successfully")
    )

} )

const getWatchHistory = asyncHandler( async (req, res) => {

    /*
        req.user._id will give the string not the objectId, we are using mongoose, mongoose will convert that string to object Id internally.
        But in aggregation pipelines this code will directly go to mongo db without interfearance of mongoose, so when you are searching with an Id you need to send
        _id: new mongoose.Types.ObjectId(req.user?._id); this will convert that string to Object Id.
    */

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from : "videos",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200, user[0].watchHistory, "User Watch History Fetched")
    )
} )

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}