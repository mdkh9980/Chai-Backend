import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {text, userId} = req.body
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Unauthorised User ID")
    }

    const tweet = await Tweet.create({
        text,
        user: userId
    })

    if(!tweet){
        throw new ApiError(500, "Failed to create tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {tweet}, "Tweet Created Successfully")
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Unauthorised User ID")
    }

    const tweets = await Tweet.findById(userId)

    if(!tweets){
        throw new ApiError(400, "No tweets available with this user")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {tweets}, "All thw tweets sent successfully")
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {text} = req.body
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID")
    }

    const updateTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                text: text
            }
        },
        {
            new: true
        }
    )

    if(!updateTweet){
        throw new ApiError(500, "Error while updating tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {updateTweet}, "Tweet Updated Successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID")
    }
    await Tweet.findByIdAndDelete(tweetId);

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Tweet Deleted Successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}