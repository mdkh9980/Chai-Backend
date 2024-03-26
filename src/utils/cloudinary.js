/*
    The main thing of this file is to upload this file to cloud using this cloudinary service.
    For uploading any file, we need to follow two steps, first step is that we need to upload it to local storage(own server) then we need to upload it the cloudinary platform, once the uploading is done on cloud platform we need to delete the file from our storage. And yes we can do it in single step, doing the two step process is production level process because sometimes we might need to reupload the file whenever we want. 

    we are importing the v2 from cloudinary package, we can name this v2 as any name as we want but in this example we named it as cloudinary itself.
*/

import {v2 as cloudinary} from "cloudinary"
import fs from "fs" //this is the file system package in nodejs this does not require installation it is pre-installed in nodejs by default. This helps us to read, write, remove, appending, updating, and changing the permissions also.
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        //uploading the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        //file is uploaded on cloudinary
        console.log("File is uploaded on Cloudinary ", response.url);
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export {uploadOnCloudinary}