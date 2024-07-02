import mongoose from "mongoose"
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

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
        const {videoId} = req.params
        const {body} = req
        const comment = await Comment.create({videoId, body})
        res.status(201).json(comment)
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {id} = req.params
    const {body} = req
    const comment = await Comment.findByIdAndUpdate(id, body, {new: true})
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }
    res.status(200).json(comment)
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {id} = req.params
    const comment = await Comment.findByIdAndDelete(id)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }
    res.status(200).json(comment)
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