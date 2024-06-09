import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {text} = req.body
    const {videoId, userId} = req.params

    if(!videoId || !userId){
        throw new ApiError(400, "Video ID and User ID are required")
    }

    const comment = await Comment.create({
        content: text,
        video: videoId,
        user: userId
    })

    if(!comment){
        throw new ApiError(500, "Error while creating Comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {comment}, "Comment added Successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {text} = req.body

    if(!text){
        throw new ApiError(400, "Content is required")
    }

    const updateComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content: text
            }
        },
        {
            new: true
        }
    )

    if(!updateComment){
        throw new ApiError(500, "Error while updating Comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {updateComment}, "Comment updated Successfully")
    )
    
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    await Comment.findByIdAndDelete(commentId)
    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Comment deleted Successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }