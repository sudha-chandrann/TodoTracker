'use client'
import React from 'react'

function Avatar({name,height=10,width=10}) {
    const nameinitials = name ? name.split(' ') : [];
    let initials = '';
    if (nameinitials.length > 1) {
      initials = nameinitials[0].charAt(0).toUpperCase() + nameinitials[1].charAt(0).toUpperCase();
    } else if (nameinitials.length === 1) {
      initials = nameinitials[0].charAt(0).toUpperCase();
    }
  return (
    <div className={`w-${10} h-${10} bg-cyan-300 rounded-full flex items-center justify-center text-black font-extrabold text-2xl`}>
      {initials}
    </div>
  )
}

export default Avatar
