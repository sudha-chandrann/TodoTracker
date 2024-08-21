'use client'
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { FaCommentAlt } from "react-icons/fa";
import {CiEdit} from 'react-icons/ci'
import { MdOutlineDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";


function SubTodoitem({
    task,
    iscompleted,
    subtodoid,
    priority,
    deadline,
    projectid,
    todoid,
    handlesubtodotoggle,
    handlesubtododelete
  }) {
    const router=useRouter();
    const [isdeleting ,setisdeleting]=useState(false);
    const [stringdeadline,setstringdeadline]=useState('');

    const gototodo=()=>{
      router.push(`/dashboard/${projectid}/${todoid}/${subtodoid}`)
    }
    const deletetodo=async()=>{
      try{
       const response=await axios.delete(`/api/projects/${projectid}/${todoid}/${subtodoid}`);
       if(response.data.success){
        toast.success(response.data.message)
        handlesubtododelete(response.data.data.id);
       }
       else{
        toast.error(response.data.message)
       }
       
      }
      catch(error){
          console.log(error)
      }
      finally{

        setisdeleting(false)
      }
    }

    const tooglecomplete=async()=>{
      try{
        const response=await axios.put(`/api/projects/${projectid}/${todoid}/${subtodoid}`,{
          iscompleted:!iscompleted
        })
        if(response.data.success){
          toast.success(response.data.message)
          handlesubtodotoggle(response.data.data.id,response.data.data.iscompleted)
        }
        else{
          toast.error(response.data.message)
        }
      }
      catch(error){
        console.log(error)
      }
      
    }
    
    


useEffect(()=>{
    const newdeadline=new Date(deadline);
    setstringdeadline(newdeadline.toDateString());
},[deadline])
   
 
    return (
      <>
       <div className="w-full bg-white rounded-2xl px-2 py-2">
       {
        isdeleting?<div className='fixed top-[25%] left-[40%] bg-gray-400 px-6 py-6 rounded-lg  w-[60%] md:w-[40%] z-10'>

        <div className='w-full mt-6 text-xl text-center'>
           Are you sure , you want to delete this subtodo
        </div>
        <div className='w-full mt-6  flex justify-between items-center py-2 px-2'>
           <button className='bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50' onClick={()=>{setisdeleting(false)}}> Cancal</button>
           <button className='bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400'onClick={()=>{deletetodo()}}> Delete</button>
        </div>
       </div>:<div></div>
      }
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3  w-[70%] ">
            <div className="h-5 w-5 rounded-full bg-gray-200 flex justify-center items-center"
             onClick={()=>{
              
              tooglecomplete()
            }}
            >
              {
                iscompleted?<FaCheck className="text-green-700"/>:<div></div>
              }
            </div>
            <div className={iscompleted?'text-black/50 text-2xl line-through w-[90%] overflow-hidden':'text-black text-2xl w-[90%] overflow-hidden'}>{task}</div>
          </div>
          <div className="flex items-center gap-4">
          
                  <CiEdit className='text-2xl text-black/50 hover:text-black' onClick={()=>{ gototodo()}} title="Edit the Subtodo"/>
               
                  <FaCommentAlt className='text-xl text-black/50 hover:text-black' onClick={()=>{ gototodo()}} title="Comment on Subtodo"/>
               
            
                  <MdOutlineDelete className='text-2xl text-black/50 hover:text-black'
                   onClick={()=>{ setisdeleting(true)}} 
                   title="Delete the Subtodo"/>
               
          </div>

        </div>
        <div className="flex items-center justify-between  px-4">
          <div className="text-black/50 text-lg"> Deadline: {stringdeadline}</div>
          <div className="text-black/50 text-lg"> Priority: {priority}</div>
        </div>
       </div>
      </>
     
    );
  }
  
  export default SubTodoitem;