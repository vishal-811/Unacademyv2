import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFileName } from "../strore/useFileName";
import { useParams } from "react-router-dom";
import { useSocket } from "../strore/useSocket";

export function GetSlides() {
  const [loading, setLoading] = useState(false);
  const [imgUrls, setImgUrls] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState("");

  const Socket = useSocket((state) => state.socket);

  const fileName = useFileName((state) => state.fileName);
  const { RoomId } = useParams<string>();

  function handleSendSlideChangeEvent({
    RoomId,
    imageId,
  }: {
    RoomId: string;
    imageId: string;
  }) {
    Socket?.send(
      JSON.stringify({
        type: "slide_change",
        data: {
          roomId: RoomId,
          imageId: imageId,
        },
      })
    );
  }

  const getImageFromCdn = useCallback(
    async (imageId: string) => {
      try {
        if (!RoomId) return;

        setLoading(true);
        const res = await axios.get(
          `https://livetrack.b-cdn.net/${RoomId}/${imageId}.jpeg`,
          { responseType: "arraybuffer" }
        );
        if (res.status === 200) {
          const blob = new Blob([res.data], { type: "image/jpeg" });
          setCurrentImage(URL.createObjectURL(blob));
          handleSendSlideChangeEvent({ RoomId, imageId });
        }
      } catch (error) {
        console.error("Error fetching image from CDN", error);
      } finally {
        setLoading(false);
      }
    },
    [RoomId]
  );

  useEffect(() => {
    async function fetchSlides() {
      try {
        setLoading(true);
        const res = await axios.post(
          `http://localhost:3000/api/v1/room/get-slides/${RoomId}`,
          { fileName },
          { withCredentials: true }
        );
        if (res.status === 200) {
          const imageUrls = res.data.data.imageurls;
          setImgUrls(imageUrls);
          if (imageUrls.length > 0) {
            getImageFromCdn(imageUrls[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching slides:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSlides();
  }, [RoomId, fileName, getImageFromCdn]);

  const handleSlideChange = (direction: "next" | "prev") => {
    let newIndex = currentIndex;
    if (direction === "next" && currentIndex < imgUrls.length - 1) {
      newIndex++;
    } else if (direction === "prev" && currentIndex > 0) {
      newIndex--;
    }
    setCurrentIndex(newIndex);
    getImageFromCdn(imgUrls[newIndex]);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full w-full">
      <div className="relative aspect-video">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : currentImage ? (
          <img
            src={currentImage}
            alt={`Slide ${currentIndex + 1}`}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            No images available
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-between px-4">
          <button
            onClick={() => handleSlideChange("prev")}
            className="p-2 bg-black/50 text-white rounded-full hover:bg-black/75 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous slide</span>
          </button>
          <button
            onClick={() => handleSlideChange("next")}
            className="p-2 bg-black/50 text-white rounded-full hover:bg-black/75 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex === imgUrls.length - 1}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next slide</span>
          </button>
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-100 text-center">
        <p className="text-sm text-gray-600">
          {imgUrls.length > 0
            ? `Slide ${currentIndex + 1} of ${imgUrls.length}`
            : "No slides available"}
        </p>
      </div>
    </div>
  );
}
