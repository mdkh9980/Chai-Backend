import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, callback){
        callback(null, "./public/temp")
    },
    filename: function (req, file, callback){
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        // callback(null, file.filename + '-' + uniqueSuffix)
        callback(null, file.originalname); // this is not a good practice because when a used upload the files with same name then those files in server will get overwritten. file.originalname is name user saved or given to the uploading.
    }
})

export const upload = multer({
    storage,
})