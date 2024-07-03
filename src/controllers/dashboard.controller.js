import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    // Algo to find total video views, total subscribers, total videos, total likes
    //total subscribers
    /* 

    */

    const subscribers = await User.aggregate([
        {
            $match: {}
        }
    ])
    
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {user} = req.user
    if(!user){
        throw new ApiError(400, "Unidentified Channel")
    }

    const allVideos = await Video.find(user._id)

    if(!allVideos){
        throw new ApiError(400, "No Videos Uploaded by this User")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {allVideos}, "Videos Return Successfully")
    )

})

export {
    getChannelStats, 
    getChannelVideos
    }