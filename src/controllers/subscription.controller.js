import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel Id")
    }
    const user = await User.findById(req.user?._id)
    if(!user){
        throw new ApiError(400, "User not found");
    }
    const channel = await Subscription.findById(channelId);
    if(!channel){
        throw new ApiError(400, "Channel not found");
    }

    const toggle = await Subscription.create({
        subscriber: user._id
    })

    if(!toggle){
        throw new ApiError(400, "Failed to toggle subscription")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Subscription Toggled Successfully")
    )
    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Unauthorized Channel Id")
    }

    const channel = await Subscription.aggregate([
        {
            $match: {
                channel: mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers"
            }
        },
        {
            $addField: {
                subscriberCount: {
                    $size : "$subscribers"
                }
            }
        },
        {
            $project: {
                subscriberCount: 1,
            }
        }
    ])
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!subscriberId){
        throw new ApiError(400, "Subscriber ID is empty");
    }

    const channelCount = await Subscription.aggregate([
        {
            $match: {
                subscriber: mongoose.Types.ObjectId(subscriberId)
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
            $addField: {
                channelCount: {
                    $size : "$subscribedTo"
                }
            }
        },
        {
            $project: {
                channelCount: 1
            }
        }
    ])
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}