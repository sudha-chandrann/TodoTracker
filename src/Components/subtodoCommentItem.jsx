"use client";
import React, { useState } from "react";
import { MdOutlineDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import axios from "axios";
import { toast } from "sonner";

function Subtodocomment({commentid, comment, user ,subtodoid , ondelete,onedit}) {
    const [isdeleting, setisdeleting] = useState("");
    const[isediting ,setisediting]=useState("");
    const [newcomment,setnewcomment]=useState(comment);
    const deletecomment=async()=>{
        try{
         const response = await axios.delete(`/api/comments/subtodos/${subtodoid}/${commentid}`)
         if(response.data.success){
             toast.success(response.data.message)
             ondelete(response.data.data.id)
         }
         else{
             toast.error(response.data.message)
         }
        }
        catch(error){
         console.log(error);
     
        }
        finally{
         setisdeleting(false)
        }
     
     
       }
     
       const editcomment=async()=>{
          try{
         const response = await axios.patch(`/api/comments/subtodos/${subtodoid}/${commentid}`,
             {
                 newcomment
             }
         )
     
         if(response.data.success){
             toast.success(response.data.message)
             onedit(response.data.data.id,response.data.data.comment)
         }
         else{
             toast.error(response.data.message)
         }
        }
        catch(error){
         console.log(error);
     
        }
        finally{
         setisediting(false)
        }
       
       }
  return (
    <div className="w-full bg-white flex flex-col  rounded-xl px-2">
    {isdeleting ? (
      <div className="fixed top-[25%] left-[40%] bg-gray-400 px-6 py-6 rounded-lg  w-[60%] md:w-[40%] z-10">
        <div className="w-full mt-6 text-xl text-center">
          Are you sure , you want to delete this comment
        </div>
        <div className="w-full mt-6  flex justify-between items-center py-2 px-2">
          <button
            className="bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50"
            onClick={() => {
              setisdeleting(false);
            }}
          >
            {" "}
            Cancal
          </button>
          <button
            className="bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400"
            onClick={() => {deletecomment()}}
          >
            {" "}
            Delete
          </button>
        </div>
      </div>
    ) : (
      <div></div>
    )}

{
    isediting?<div className='fixed top-[25%] left-[40%] bg-gray-400 px-6 py-6 rounded-lg  w-[60%] md:w-[40%] z-10'>

     <div className='w-full mt-6 text-xl'>
        <label htmlFor='description' className='font-bold'>Comment:</label>
        <textarea id="description" className='bg-white rounded-lg text-black w-full py-2 px-3 outline-none focus:outline-none text-xl' onChange={(e)=>{setnewcomment(e.target.value)}} value={newcomment} placeholder='Enter the new comment for the todo '/>
     </div>
     <div className='w-full mt-6  flex justify-between items-center py-2 px-2'>
        <button className='bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50' onClick={()=>{setisediting(false)}}> Cancal</button>
        <button className='bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400'onClick={()=>{editcomment()}}> Edit Comment</button>
     </div>
    </div>:<div></div>

  } 

    <div className="w-full  flex gap-2  items-center pt-1">
      <div className="h-6 w-6 rounded-full bg-cyan-400 text-white font-bold text-lg flex justify-center items-center ">
        {user.charAt(0).toUpperCase()}
      </div>
      <div className="text-black text-lg w-[90%]">{comment}</div>
    </div>
    <div className="w-full flex justify-between">
      <div className="text-black/50 text-sm text-center">{user}</div>
      <div className="flex gap-2 items-center">
       
              <CiEdit
                className="text-2xl text-black/50 hover:text-black"
                onClick={() => {setisediting(true)}}
                title="Edit the comment"
              />
            
              <MdOutlineDelete
                className="text-2xl text-black/50 hover:text-black"
                onClick={() => {
                  setisdeleting(true);
                }}
                title="Delete the comment"
              />
            
      </div>
    </div>
  </div>
  )
}

export default Subtodocomment
