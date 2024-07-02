import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;
    
    // Set up pagination variables
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Create filter object
    let filter = {};
    if (query) {
        filter.title = { $regex: query, $options: 'i' }; // Example: filtering by title with a case-insensitive regex search
    }
    if (userId) {
        filter.userId = userId; // Example: filtering by userId
    }

    // Create sort object
    let sort = {};
    if (sortBy) {
        sort[sortBy] = sortType === 'desc' ? -1 : 1;
    }

    try {
        // Fetch videos from the database based on the filter, pagination, and sort criteria
        const videos = await Video.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(pageSize);

        // Get the total count of videos that match the filter criteria
        const totalVideos = await Video.countDocuments(filter);

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalVideos / pageSize);

        // Send response with videos, total pages, and current page number
        res.status(200).json({
            videos,
            totalPages,
            currentPage: pageNumber
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    // get video file local path link from the user
    const videoLocalFilePath = req.files?.videoFile[0]?.path;
    const thumbnailLocalFilePath = req.files?.thumbnail[0]?.path;
    // throw error if video file is not available
    if(!videoLocalFilePath){
        throw new ApiError(401, "Video Field is required");
    }
    if(!thumbnailLocalFilePath){
        throw new ApiError(401, "Thumbnail Field is required");
    }
    // upload it on cloudinary get the string
    const videoURL = await uploadOnCloudinary(videoLocalFilePath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalFilePath);

    if(!videoURL.url){
        throw new ApiError(400, "Error while uploading on video file on cloudinary");
    }

    if(!thumbnail.url){
        throw new ApiError(400, "Error while uploading on thumbnail file on cloudinary");
    }

    // create video in database
    // store video url in database and toggle isPublished true
    const video = await Video.create({
        videoFile: videoURL.url,
        thumbnail: thumbnail.url,
        title,
        description,
        owner: req.user?._id
    })

    if(!video){
        throw new ApiError(400, "Error while publishing a video");
    }

    // return video
    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video published Successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Sent current video successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const newVideoLocalPath = req.file?.videoFile[0]?.path;
    
    if(!newVideoLocalPath){
        throw new ApiError(400, "Video file is required");
    }

    const newThumbnailLocalPath = req.file?.thumbnail[0]?.path;
    if(!newThumbnailLocalPath){
        throw new ApiError(400, "Thumbnail is required");
    }

    const videoPath = await uploadOnCloudinary(newVideoLocalPath);
    const thumbnailPath = await uploadOnCloudinary(newThumbnailLocalPath);

    if(!videoPath || !thumbnailPath){
        throw new ApiError(400, "Error while updating video and thumbnail on cloudinary");
    }

    const { title, description } = req.body;
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $unset: {
                videoFile: undefined,
                thumbnail: undefined,
                title: undefined,
                description: undefined 
            },
            $set: {
                videoFile: videoPath,
                thumbnail: thumbnailPath,
                title: title,
                description: description
            }
        },
        {
            new : true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video Updated Successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!videoId){
        throw new ApiError(400, "unauthorized video Id");
    }

    await Video.findByIdAndUpdate(
        videoId,
        {
            $unset: {
                videoFile: undefined,
                thumbnail: undefined
            }
        },
        {
            new : true
        }
    )
    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Video Deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400, "unauthorized video Id");
    }
    await Video.findByIdAndUpdate(
        videoId,
        {
            $bit:{
                isPublished: {xor: 0}
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Video toggled successfully")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}