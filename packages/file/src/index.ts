import { deleteFile } from "./delete";
import { getPersistentLink } from "./getPersistentLink";
import { uploadFile } from "./upload";
import { wrapS3Error } from "./wrapper";

const deleteFileWrapped = wrapS3Error(deleteFile);
const getPersistentLinkWrapped = wrapS3Error(getPersistentLink);
const uploadFileWrapped = wrapS3Error(uploadFile);

export { 
    deleteFileWrapped as deleteFile,
    getPersistentLinkWrapped as getPersistentLink,
    uploadFileWrapped as uploadFile
};
