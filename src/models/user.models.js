import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            // index: true  //if you want to use the database to search something useing username make the index: true, BUT BE CAUTIOUS IT WILL TAKE A LOT OF MONEY AND DATABASE SPACE.
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        avatar: {
            type: String,
            required: true
        },
        coverImage: {
            type: String
        },
        watchHistory : [
            {
                type: Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password : {
            type: String,
            required : [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }
    }, 
    {timestamps: true}
)

/*  
    WATCH THIS PART OF VIDEO AGAIN TO GET MORE CLARITY, Video name : User and Video model and jwk from 30:00

    Below is function which is used to change or update the password, we have used bcrypt npm packages,it has some hooks like save, deleteOne, updateOne, validate. Basically it acts as a middleware So we want to encrypt the data and save, this will happen just before saving the password.

    Now the function defined is pre is async because it takes some time to do the encrytion for that reason it is async, here we cannot write the arrow functions syntax because in arrow functions the this keyword will not be having the content of this model itself. so for that reason arrow functions are not used.

    Now we are hashing the password of this particular user, it has the syntax of 
    bcrypt.hash(this.password, 10), it has two parameters first is what to save i.e. password and other parameter is rounds its type is number, now in this example I have given 10, it means that before saving the password encrypt the password these many times before saving in the database.

    If you written only this much then you are creating the problem, Now where is the problem, the problem is whenever the user changes anything like he might change the his name, his avatar, his coverImage and then he clicks the save button then in database, before saving the those things it will do the hashing, now he will keep on changing the password, whatever the user changes password will be changing, this the problem.

    To solve this problem we need a conditional statement where it checks whether the password of this user is modified or not, we have builtin function, so now it will do hashing whenever password is changed.
*/

userSchema.pre("save", async function (next) {
    if(this.isModified("password")){
        this.password = bcrypt.hash(this.password, 10);
        next()
    }
    else{
        return next()
    }
})

/* 
    Now in mongoose we have some methods to check the given password is correct is not using the bcrypt package. Here we created a new method called isPasswordCorrect this is an async function it will take it time, and we are sending the password as an argument to check the password given by the used is correct or not.so we need to await until it returns the boolean true or false.

    bcrypt has a function called compare where it takes two arguments one the password entered by the user and this.password(encrypted password which is stored in the database), it will take the two passwords and the it will return it boolean value.
*/

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password);
}

/* WATCH THE VIDEO FROM 30:00 AND TAKE THE NOTES AS THE CODE IS ALREADY HERE */

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        _id= this._id,
        email= this.email,
        username= this.username,
        fullName = this.fullName
    ),
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        _id= this._id
    ),
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
}

export const User = mongoose.model("User", userSchema);