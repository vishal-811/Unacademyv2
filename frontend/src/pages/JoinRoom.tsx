import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import axios from "axios";
import { useRoomJoin } from "../strore/useRoomJoin";

export default function JoinRoom(){
    const { RoomId } = useParams<{RoomId : string}>();
    const [isValidRoom, setIsValidRoom] = useState<boolean>(false);
    
    const setIsRoomJoined = useRoomJoin((state) => state.setIsRoomJoined);
    useEffect(() => {
        
        async function isRoomExist(){
            const res = await axios.get(`http://localhost:3000/api/v1/room/roomExist/${RoomId}`,{
                withCredentials :true
            })

            if(res.status === 200){
                setIsValidRoom(true);
                setIsRoomJoined(true);
            }
        }

        isRoomExist();
    })
    return isValidRoom ?   (
        <>
           <Layout/>
        </>
    ) :  (
        <div>"Wrong RoomID,please provide a valid roomId"</div>
    )
}