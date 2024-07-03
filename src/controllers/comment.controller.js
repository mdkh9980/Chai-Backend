import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    const skip = (page - 1) * limit
    const comments = await Comment.find({videoId}).skip(skip).limit(limit).sort({createdAt
        : -1})
    const total = await Comment.countDocuments({videoId})
    const totalPages = Math.ceil(total / limit)
    const nextPage = page + 1
    const prevPage = page - 1
    const hasNextPage = nextPage <= totalPages
    const hasPrevPage = prevPage > 0
    const response = new ApiResponse(comments, hasNextPage, hasPrevPage, nextPage, prevPage
        , totalPages)
    res.status(200).json(response)
    return res
    .status(200)
    .json(
        new ApiResponse(200, {comments, hasNextPage, hasPrevPage, nextPage, prevPage, totalPages}, "Returning comments successfully")
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params;
    const {content} = req.body;
    const {user} = req.user;

    if(!videoId || !content || !user){
        throw new ApiError(400, "Unauthorised User or Empty Comment Content");
    }

    const comment = await Comment.create({
        content: content,
        video: videoId,
        owner: user._id
    })

    if(!comment){
        throw new ApiError(400, "Error while creating the Comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {comment}, "Comment Created Successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {videoId} = req.params
    const {content} = req.body
    const {user} = req.user

    if(!videoId || !content || !user){
        throw new ApiError(400, "Unauthorised User or Empty Comment Content");
    }

    const comment = await Comment.findOneAndUpdate(
        user._id,
        {
            $set: {content: content}
        },
        {
            new: true
        }
    )

    if(!comment){
        throw new ApiError(400, "Error while updating Comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {comment}, "Comment Updated Successfully")
    )

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {videoId} = req.params
    const {user} = req.user
    const {commentId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Unidentified Video Id")
    }
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Unidentified Comment Id")
    
    }
    if(!user){
        throw new ApiError(400, "Unauthorised User")
    }

    await Comment.findByIdAndDelete(
        commentId,
        {
            $unset: {
                content: undefined
            }
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Comment Deleted Successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}


    const getComment = asyncHandler(async (req, res) => {
        const {id} = req.params
        const comment = await Comment.findById(id)
        if (!comment) {
            throw new ApiError(404, "Comment not found")
            }
            res.status(200).json(comment)
            })