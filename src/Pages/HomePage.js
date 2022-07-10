import React, { useState } from 'react'
import toast , {Toaster} from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {v4 as uuidv4} from 'uuid';

export default function HomePage() {
  const navigate = useNavigate();
  const [roomid,setroomId] = useState('');
  const [username,setusername] = useState('');
  const createNewRoom = (e) =>{
      e.preventDefault();
      const roomId = uuidv4();
      setroomId(roomId);
      toast.success("Created a New Room");
  }
  const joinRoom = () =>{
    if(/^ *$/.test(roomid) ||  /^ *$/.test(username)){
      toast.error("Enter UserName OR Room Id");
    }
    else{
      navigate(`/editor/${roomid}`,{
        state : {
          username : username
        }
      })
    }
  }
  const willJoin = (e) =>{
    if(e.code === 'Enter'){
      joinRoom();
    }
  }
  return (
    <>
    <Toaster position="top-center" reverseOrder={false}/>
    <div className='homePageWrapper'>
      <div className='formWrapper'>
        <div style={{textAlign:'center'}}><img className='PageLogo' src="/sync.png" alt="Icon Logo"/></div>
        <h4 className='mainlabel'>Paste invitation room Id</h4>
        <div className='inputGroup'>
          <input onChange = {(e)=>setroomId(e.target.value)} type = "text" 
                className='inputBox' placeholder='Room Id'
                value = {roomid} onKeyUp={willJoin}/>
          <input onChange={(e)=>setusername(e.target.value)} type = "text" 
                className='inputBox' placeholder='Name'
                value = {username} onKeyUp={willJoin}/>
          <button onClick = {joinRoom} className='btn joinbtn'>Join</button><br></br>
          <span className="createInfo">If you don't have an invite &nbsp; 
            <a onClick={createNewRoom} className = "createNewbtn" href="/">
                Create New room
            </a>
          </span>
        </div>
      </div>
    </div>
    </>
  )
}
