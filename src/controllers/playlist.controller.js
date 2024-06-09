import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400, "Video files are required");
    }

    if(!name){
        throw new ApiError(400, "Playlist name is required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        videos: [videoId],
        user: req.user._id
    })

    if(!playlist){
        throw new ApiError(400, "Error while creating the playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {playlist}, `${name} Playlist created Successfully`)
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid User ID");
    }

    const playlists = await Playlist.find(userId);

    if(!playlists){
        throw new ApiError(400, "You have no playlists");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {playlists}, "Playlist Delivered")
    )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist Id");
    }
    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(400, "Playlist do not exists with this Id");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {playlist}, "Playlist found successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Playlist or Video Id");
    }
    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(400, "Playlist does not exists");
    }

    playlist.videos.push(videoId);

    return res
    .status(200)
    .json(
        new ApiResponse(200, {playlist}, "Video Added to Playlist Successfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Playlist or Video Id");
    }
    try {
        const videoPlaylist = await Playlist.findById(playlistId).select("videos");
        if(!videoPlaylist){
            throw new ApiError(400, "Playlist does not exists");
        }
    
        const index = videoPlaylist.indexOf(videoId);
        if (index > -1) {
            videoPlaylist.splice(index, 1);
        }
        if(videoPlaylist.indexOf(videoId)){
            throw new ApiError(409, "Error while deleting the video")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Video deleted Successfully")
        )
    } catch (error) {
        throw new ApiError(409, "Error while Deleting a video from playlist")
    }

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist Id");
    }

    await Playlist.findByIdAndDelete(playlistId, (err, deletedItem) => {
        if (err) {
          throw new ApiError(500, "Error while deleting the playlist");
        }
        if (!deletedItem) {
          throw new ApiError(404, "Playlist not found")
        }
    });

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Playlist deleted Successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist Id");
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name : name,
                description : description
            }
        },
        {
            new : true
        }
    );

    if(!updatePlaylist){
        throw new ApiError(400, "Error while updating playlist");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {updatePlaylist}, "Playlist updated Successfully")
    )

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}