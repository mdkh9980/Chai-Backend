import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

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

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

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


export { registerUser }