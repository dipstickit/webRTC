import { useEffect, useRef, useState } from "react";

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

  // Stop capturing the screen
  const stopCapture = () => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setStream(null);
    setIsCapturing(false);
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const imageUrl = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = `capture-${Date.now()}.png`;

        link.click();
      }
    }
  };

  useEffect(() => {
    let captureInterval: ReturnType<typeof setInterval> | null = null;

    if (isCapturing) {
      captureInterval = setInterval(() => {
        captureFrame();
      }, 5000);
    } else {
      if (captureInterval) {
        clearInterval(captureInterval);
      }
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
          <>
            <button
              onClick={startCapture}
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 mr-4 transition duration-200"
            >
              Capture Screen
            </button>
            <button
              onClick={() => startCapture()}
              className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 mr-4 transition duration-200"
            >
              Capture Window
            </button>
            <button
              onClick={() => startCapture()}
              className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600 transition duration-200"
            >
              Capture Tab
            </button>
          </>
        )}
      </div>

      <div className="mt-6">
        <video
          ref={videoRef}
          autoPlay
          controls
          className="w-full rounded-lg shadow-lg"
        ></video>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
    </div>
  );
};

export default ScreenCapture;
