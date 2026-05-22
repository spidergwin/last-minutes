import * as React from 'react';

import { toast } from 'sonner';
import { z } from 'zod';

export interface UploadedFile {
  key: string;
  url: string;
  name: string;
  size: number;
  type: string;
  appUrl?: string;
}

interface UseUploadFileProps {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: unknown) => void;
}

export function useUploadFile({
  onUploadComplete,
  onUploadError,
}: UseUploadFileProps = {}) {
  const [uploadedFile, setUploadedFile] = React.useState<UploadedFile>();
  const [uploadingFile, setUploadingFile] = React.useState<File>();
  const [progress, setProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);

  async function uploadFile(file: File) {
    setIsUploading(true);
    setUploadingFile(file);

    try {
      // 1. Initiate upload
      const initiateRes = await fetch('/api/upload/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      });

      const initiateData = await initiateRes.json();
      if (!initiateRes.ok || !initiateData.success) {
        throw new Error(initiateData.error || 'Failed to initialize upload.');
      }

      const { uploadUrl, key, type } = initiateData;
      let { publicUrl } = initiateData;

      // 2. Upload directly to provider via PUT with progress tracking
      const putResponseText = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded * 100) / event.total);
            setProgress(Math.min(percentage, 100));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.responseText);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () =>
          reject(new Error('Network error during upload.'))
        );
        xhr.addEventListener('abort', () =>
          reject(new Error('Upload aborted.'))
        );

        xhr.open('PUT', uploadUrl, true);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      // 3. Handle Google Drive specific logic
      if (type === "drive") {
        try {
          const driveFile = JSON.parse(putResponseText);
          const fileId = driveFile.id;
          
          const publicRes = await fetch("/api/drive/public", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId }),
          });
          const publicData = await publicRes.json();
          if (!publicRes.ok || !publicData.success) {
             throw new Error(publicData.error || "Failed to make Drive file public.");
          }
          publicUrl = publicData.publicUrl;
        } catch (e) {
          throw new Error("Failed to process Google Drive upload.");
        }
      }

      const result: UploadedFile = {
        key,
        url: publicUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      };

      setUploadedFile(result);
      onUploadComplete?.(result);

      return result;
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      const message =
        errorMessage.length > 0
          ? errorMessage
          : 'Something went wrong, please try again later.';

      toast.error(message);
      onUploadError?.(error);

      return undefined;
    } finally {
      setProgress(0);
      setIsUploading(false);
      setUploadingFile(undefined);
    }
  }

  return {
    isUploading,
    progress,
    uploadedFile,
    uploadFile,
    uploadingFile,
  };
}

export function getErrorMessage(err: unknown) {
  const unknownError = 'Something went wrong, please try again later.';

  if (err instanceof z.ZodError) {
    const errors = err.issues.map((issue) => issue.message);

    return errors.join('\n');
  }
  if (err instanceof Error) {
    return err.message;
  }
  return unknownError;
}

export function showErrorToast(err: unknown) {
  const errorMessage = getErrorMessage(err);

  return toast.error(errorMessage);
}
