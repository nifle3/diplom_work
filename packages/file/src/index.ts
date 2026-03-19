import { deleteFile } from "./delete";
import { getPersistentLink } from "./getPersistentLink";
import { getUploadPersistentLink } from "./getUploadPersistentLink";
import { s3Healthcheck } from "./healthcheck";
import { uploadFile } from "./upload";
import { wrapS3Error } from "./wrapper";

const deleteFileWrapped = wrapS3Error(deleteFile);
const getPersistentLinkWrapped = wrapS3Error(getPersistentLink);
const uploadFileWrapped = wrapS3Error(uploadFile);
const getPersistentUploadLinkWrapped = wrapS3Error(getUploadPersistentLink);

export {
	deleteFileWrapped as deleteFile,
	getPersistentLinkWrapped as getPersistentLink,
	uploadFileWrapped as uploadFile,
	getPersistentUploadLinkWrapped as getPersistentUploadLink,
	s3Healthcheck,
};
