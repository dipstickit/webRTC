import { useEffect, useRef, useState } from "react";
import axios from "axios";

const ScreenCapture = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCapture = async () => {
    try {
      const constraints = {
        video: true,
      };

      const captureStream = await navigator.mediaDevices.getDisplayMedia(
        constraints
      );

      if (captureStream) {
        setStream(captureStream);
        if (videoRef.current) {
          videoRef.current.srcObject = captureStream;
        }
        setIsCapturing(true);
      }
    } catch (err) {
      console.error("Error starting capture: ", err);
    }
  };

  const stopCapture = () => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setStream(null);
    setIsCapturing(false);
  };

  const captureFrame = async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const imageUrl = canvas.toDataURL("image/png");

        try {
          const blob = await (await fetch(imageUrl)).blob();

          const formData = new FormData();
          formData.append("image", blob, `capture-${Date.now()}.png`);

          const response = await axios.post(
            "http://localhost:5000/upload",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              withCredentials: true,
            }
          );

          if (response.status === 200) {
            console.log("Image uploaded successfully");
          } else {
            console.error("Failed to upload image");
          }
        } catch (err) {
          console.error("Error uploading image: ", err);
        }
      }
    }
  };

  useEffect(() => {
    let captureInterval: ReturnType<typeof setInterval> | null = null;

    if (isCapturing) {
      captureInterval = setInterval(() => {
        captureFrame();
      }, 5000);
    } else if (captureInterval) {
      clearInterval(captureInterval);
    }

    return () => {
      if (captureInterval) {
        clearInterval(captureInterval);
      }
    };
  }, [isCapturing]);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Screen Capture Demo
      </h2>

      <div className="text-center mb-4">
        {isCapturing ? (
          <button
            onClick={stopCapture}
            className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-200"
          >
            Stop Capture
          </button>
        ) : (
          <button
            onClick={startCapture}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 mr-4 transition duration-200"
          >
            Capture
          </button>
        )}
      </div>

      <div className="mt-6">
        <video
          ref={videoRef}
          autoPlay
          controls
          className="w-full rounded-lg shadow-lg"
        >
          <track
            kind="captions"
            src="captions.vtt"
            srcLang="en"
            label="English"
            default
          />
        </video>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
    </div>
  );
};

export default ScreenCapture;
