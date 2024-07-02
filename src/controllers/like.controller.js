import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/likes.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Unauthorized video Id")
    }

    const videoLike = await Like.create({
        video: videoId,
        likedBy: req.user?._id
    })

    if(!videoLike){
        throw new ApiError(400, "Error While toggling Video Like");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {},"Video Like toggled successfully")
    )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Unauthorized comment Id")
    }

    const commentLike = await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    })

    if(!commentLike){
        throw new ApiError(400, "Error While toggling Comment Like");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Toggling comment is Successfull")
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Unauthorized tweet Id")
    }

    const tweetLike = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    if(!tweetLike){
        throw new ApiError(400, "Error While toggling Tweet Like");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Toggling tweet is Successfull")
    )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const {userId} = req.user?._id
    const likedVideos = await Like.find({likedBy: userId}).populate("video")

    if(!likedVideos){
        throw new ApiError(400, "Error While getting liked videos");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {likedVideos}, "All videos Fetched Successfully")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}