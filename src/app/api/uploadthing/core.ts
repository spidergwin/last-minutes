import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/lib/auth";

const f = createUploadthing();

// Define the UploadThing router
export const ourFileRouter = {
  // Define an endpoint for audio/video uploads
  mediaUploader: f({
    audio: { maxFileSize: "2GB", maxFileCount: 1 },
    video: { maxFileSize: "2GB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      // Authenticate the user
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session) throw new UploadThingError("Unauthorized");

      // Return metadata to be saved with the file
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);

      // Return data to the client
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
