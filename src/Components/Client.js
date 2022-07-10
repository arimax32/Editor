import React from 'react'
import Avatar from 'react-avatar';

export default function Client({username}) {
  return (
    <div className='client'>
      <Avatar name = {username} size={50} round = '14px'/>
      <span className='clientName' style={{marginTop : '10px'}}>{username}</span>
    </div>
  )
}
