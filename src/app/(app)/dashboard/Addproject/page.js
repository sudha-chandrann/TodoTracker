'use client'
import React from 'react'
import { useState } from 'react'
import {Itim} from 'next/font/google';
import { useRouter } from 'next/navigation';
import  toast from 'react-hot-toast';
import axios from 'axios';
import { addProject } from '@/store/userSlice';
import { useDispatch } from 'react-redux';
const itim = Itim({
    weight: ['400'], 
    subsets: ['latin'],     
  });
function page() {
    const  dispatch=useDispatch();
    const [name,setname]=useState("");
    const [description,setdescription]=useState('');
    const router=useRouter();
    const handleaddproject=async()=>{
      if(name =="" || description == ""){
          toast.error(" please enter all the fields ")
      }
      else{
        try{
            const response= await axios.post("/api/projects/addnewproject",{
              name:name,
              description:description
            })
            if(response.data.success){
                const id=response.data.data.project._id;
                toast.success(response.data.message)
                dispatch(addProject(response.data.data.project));
                router.push(`/dashboard/${id}`)
            }
            else{
                toast.error(response.data.message);
            }
          }
          catch(error){
             console.log("the error is ",error);
          }
          finally{
            setname("");
            setdescription("");
          }
         
      }
    }

  return (
    <div className={`h-full w-full bg-slate-400 flex items-center justify-center ${itim.className}`}>
       <div className='bg-white/70  rounded-2xl px-6 py-10 w-[80%] md:w-[60%] lg:w-[50%] '>
         <div className='w-full'>
            <label htmlFor='name' className='font-bold text-xl'>Project Name :</label>
            <input  id="name" className='bg-black/10 rounded-lg text-black w-full py-2 px-3 outline-none focus:outline-none text-xl' onChange={(e)=>{setname(e.target.value)}} value={name} placeholder='Enter the name for the Project '/>
         </div>
         <div className='w-full mt-6 text-xl'>
            <label htmlFor='description' className='font-bold'>Description:</label>
            <textarea id="description" className='bg-black/10 rounded-lg text-black w-full py-2 px-3 outline-none focus:outline-none text-xl' onChange={(e)=>{setdescription(e.target.value)}} value={description} placeholder='Enter the description for the Project '/>
         </div>
         <div className='w-full mt-6  flex justify-between items-center py-2 px-2'>
            <button className='bg-black/5 px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-black/10' onClick={()=>{router.back()}}> Cancal</button>
            <button className='bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400'onClick={()=>{ handleaddproject()}}> Add Project</button>
         </div>
       </div>
    </div>
  )
}

export default page
