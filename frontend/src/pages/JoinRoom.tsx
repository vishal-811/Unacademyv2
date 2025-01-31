import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import axios from "axios";
import { useRoomJoin } from "../strore/useRoomJoin";
import { toast } from "sonner";

export default function JoinRoom() {
  const { RoomId } = useParams<{ RoomId: string }>();
  const [isValidRoom, setIsValidRoom] = useState<boolean>(false);
  const setIsRoomJoined = useRoomJoin((state) => state.setIsRoomJoined);
  useEffect(() => {
    async function isRoomExist() {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/v1/room/roomExist/${RoomId}`,
          {
            withCredentials: true,
          }
        );
  
        if (res.status === 200) {
          setIsValidRoom(true);
          setIsRoomJoined(true);
        }
      } catch (error : any) {
        if(error.response && error.response.status === 410){
          // setIsValidRoom(false);
          toast.error('Meeting has been ended');
        }
      } 
    }

    isRoomExist();
  });

  return isValidRoom && RoomId ? (
    <>
      <Layout roomId={RoomId} />
    </>
  ) : (
    <div className="text-black">"Wrong RoomID,please provide a valid roomId"</div>
  );
}
