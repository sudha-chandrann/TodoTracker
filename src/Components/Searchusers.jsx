'use client'
import React from 'react'

function SearchUsers({ user, toggleteammemebrs ,isInTeam}) {
    const isinteam = isInTeam(user._id);
  return (
    <div 
      key={user._id} 
      className={`w-full py-1 px-2 cursor-pointer hover:bg-black/20 ${isinteam? 'bg-black/15':'bg-transparent'} `}
      onClick={() => { toggleteammemebrs(user) }}
    >
      {user.username}
    </div>
  )
}

export default SearchUsers
