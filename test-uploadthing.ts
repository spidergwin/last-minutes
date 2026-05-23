import { genUploader } from "uploadthing/client";
import type { OurFileRouter } from "./src/app/api/uploadthing/core";

const { uploadFiles } = genUploader<OurFileRouter>({
  package: "@uploadthing/react"
});
