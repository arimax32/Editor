import React, { useEffect, useRef, useState } from 'react'
import toast , {Toaster} from 'react-hot-toast';
import Client from '../Components/Client'
import Editor from '../Components/Editor'
import { initSocket } from '../socket';
import {useLocation,useNavigate, Navigate,useParams} from 'react-router-dom';

export default function EditorPage() {
  const socketRef = useRef(null);
  const location = useLocation();
  const roomId = useParams().room_id;
  const [clients,setclients] = useState([])
  const routeNavigate = useNavigate();
  useEffect(()=>{
    const init = async () =>{
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error",(err) => handlError(err));
      socketRef.current.on("connect_failed",(err) => handlError(err));
      const handlError = (e) =>{
        console.log(e);
        toast.error("Ther has been a connection error");
        routeNavigate("/");
      }
      socketRef.current.emit("join",{roomId : roomId,username : location.state.username})
      socketRef.current.on('connectToRoom',({clients,user,socketId})=>{
        if(user !== location.state.username){
          toast.success(`${user} has Joined the Room`)
        }
        else{
          toast.success(`${user} You have succesfully joined in`)
        }
        setclients(clients)
      })
      socketRef.current.on("disconnected",({socketId,username}) => {
          toast.success(`${username} has left the room`)
          setclients((prev_state) => {
            return prev_state.filter( (client) =>{
              return client.socketId !== socketId
            });
          });
      });
    }
    init();

    return () => {
      socketRef.current.disconnect();
      socketRef.current.off("join")
      socketRef.current.off("disconnected")
    }
  },[])
  const LeaveRoom = () => {
    routeNavigate("/");
  }
  return (
    <>
    <Toaster position="top-center" reverseOrder={false}/>
    <div className='mainWrap'>
      <div className="leftBlock">
        <div className='leftInner'>
          <div className='logo'>
            <img className='editorLogo PageLogo' src = "/sync.png" alt = "logo" />
          </div>
          <h3 className=''>Connected</h3>
          <div className='clientsList'>
            {
              clients.map((client) => {
                return <Client key = {client.socketId} username = {client.username}/>
              })
            }
          </div>
        </div>
        <button style = {{width : 'auto'}} className='btn roomIdbtn' 
                onClick={async () => {
                  try{
                    await navigator.clipboard.writeText(roomId)
                    toast.success("Room ID has been copied to your clipboard");
                  }
                  catch(err){
                      toast.error("Therehas beena error in copying the Room ID");
                      console.log(err)
                  }
                }}>
                Copy Room ID</button>
        <button style = {{width : 'auto'}} className='btn leaveRoombtn'
                onClick={LeaveRoom}>
                Leave Room</button>
      </div>
      <div className='MainEditor'>
        <Editor socketRef={socketRef} roomId={roomId}/>
      </div>
    </div>
    </>
  )
}
