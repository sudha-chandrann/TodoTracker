'use client'
import React from 'react'

function SearchUsers({ user, toggleteammemebrs ,isInTeam ,className,bg,bg2}) {
    const isinteam = isInTeam(user._id);
  return (
    <div 
      key={user._id} 
      className={`w-full py-1 px-2 cursor-pointer  ${isinteam? bg2:bg} ${className}`}
      onClick={() => { toggleteammemebrs(user) }}
    >
      {user.username}
    </div>
  )
}

export default SearchUsers
