import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "./uploadthing";

// Import enhanced versions
import { uploadFilesEnhanced, useUploadThingEnhanced } from "./uploadthing-enhanced";

// Base UploadThing helpers
export const { useUploadThing: useUploadThingBase, uploadFiles: uploadFilesBase } = generateReactHelpers<OurFileRouter>();

// Export enhanced versions as default
export const useUploadThing = useUploadThingEnhanced;
export const uploadFiles = uploadFilesEnhanced;