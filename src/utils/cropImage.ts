// Utility function to crop an image using Canvas API

/**
 * Get a cropped image from the original image and cropped area pixels
 * @param imageSrc - The original image source (Data URL or Blob URL)
 * @param croppedAreaPixels - Object containing the cropped area pixels (x, y, width, height)
 * @returns Promise<HTMLCanvasElement> - Promise that resolves to the cropped canvas element
 */
export const getCroppedImg = (imageSrc: string, croppedAreaPixels: any): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    
    // Handle image loading
    image.onload = () => {
      try {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        // Set canvas size to the cropped area dimensions
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        // Draw the cropped part of the image onto the canvas
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

        resolve(canvas);
      } catch (error) {
        reject(error);
      }
    };

    // Handle image loading errors
    image.onerror = (error) => {
      reject(error);
    };

    // Set crossOrigin to anonymous to avoid CORS issues
    image.crossOrigin = 'anonymous';
    
    // Load the image
    image.src = imageSrc;
  });
};

/**
 * Get a data URL from a canvas element
 * @param canvas - The canvas element
 * @param type - The image type (e.g., 'image/jpeg', 'image/png')
 * @param quality - The image quality (0-1, only applies to JPEG)
 * @returns string - The data URL of the image
 */
export const getCanvasDataURL = (canvas: HTMLCanvasElement, type: string = 'image/jpeg', quality: number = 0.9): string => {
  return canvas.toDataURL(type, quality);
};

/**
 * Convert a data URL to a File object
 * @param dataURL - The data URL of the image
 * @param fileName - The name of the file
 * @returns File - The File object
 */
export const dataURLToFile = (dataURL: string, fileName: string): File => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], fileName, { type: mime });
};