'use selector'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaAngleDown, FaAngleRight } from "react-icons/fa6";
function Teamcomponent({team}) {
    const router = useRouter()
    const [ismyprojectsvisible, setprojectvisible] = useState(true);
  return (
    <div className='w-ful' >
        <div className='w-full flex items-center justify-between pl-5 text-black/70 text-lg hover:bg-black/10'>
        <div className='flex items-center gap-1' onClick={()=>{
           
            router.push(`/dashboard/team/${team._id}`)
            }}> <span className='text-lg text-black'>#</span> {team.name}</div>
        <div className='flex gap-1 items-center'>
          {ismyprojectsvisible ? (
              <FaAngleDown
                className="text-xl text-black/75 hover:text-black"
                onClick={() => {
                  setprojectvisible(false);
                }}
              />
            ) : (
              <FaAngleRight
                className="text-xl text-black/75 hover:text-black"
                onClick={() => {
                  setprojectvisible(true);
                }}
              />
           )}
        </div>
        </div>
     
    </div>
  )
}

export default Teamcomponent
