import {upload} from "../config/Multer.js";

export const uploadUserImage = upload.single("profilePic");
