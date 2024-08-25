'use client'
import React, { useEffect,useState } from 'react'
import { useSelector } from 'react-redux';
import { selectTeamById } from '@/store/teamSlice';
import {MdOutlineDelete} from "react-icons/md"
import {Itim} from 'next/font/google';
import{IoChevronBackOutline,IoAdd} from 'react-icons/io5'
import { RxCross2 } from "react-icons/rx";
const itim = Itim({
    weight: ['400'], 
    subsets: ['latin'],     
});

function page({params}) {
    const id=params.teamId;
    const [team, setTeam] = useState({});
    const teambyid=useSelector((state)=>selectTeamById(state,id));
    const [isdeleting ,setisdeleting]=useState(false);
    const [isedting,setisediting]=useState(false);
    const [isAdding,setisAdding]=useState(false);
    const [isaddingmember,setisAddingMember]=useState(false);
    const userid=useSelector((state)=>state.user._id);
    const [isAdmin,setisAdmin]=useState(false);
    useEffect(()=>{
        setTeam(teambyid);
        console.log(teambyid)
    },[teambyid]);
    const [projectname,setprojectname]=useState('');
    const [projectdescription,setprojectdescription]=useState('')
   
    useEffect(()=>{
    if( teambyid && userid === teambyid.admin){
        setisAdmin(true);
    }
    else{
        setisAdmin(false);
    }
    },[userid,teambyid])

  return (
    <div className={`h-full bg-slate-400 flex items-center justify-center ${itim.className} w-full `}>
   
     {
        isAdding&&(
            <div className='fixed top-0 bottom-0 left-0 right-0 z-10 bg-black/60 text-white flex justify-center items-center'>
                <RxCross2 className='absolute top-4 right-0 text-white font-extrabold text-2xl hover:bg-cyan-400 p-1 rounded-full bg-cyan-300' onClick={()=>{setisAdding(false)}}/>
                    <div className='rounded-lg bg-black p-4 w-[80%] md:w-[60%] lg:w-[30%]'>
                        <div className='text-lg flex justify-center items-center'> Project Details</div>
                       <div className='flex flex-col items-start w-[90%] mx-auto mt-2'>
                        <label htmlFor='projectname'>ProjectName:</label>
                        <input type='text' id='projectname' value={projectname} onChange={(e)=>{setprojectname(e.target.value)}} className='w-full focus:outline-none text-black rounded-lg py-1 px-2'/>
                       </div >
                       <div className='flex flex-col items-start w-[90%] mx-auto mt-2'>
                        <label htmlFor='ProjectDescription'>ProjectDescription:</label>
                        <textarea type='text' id='ProjectDescription' value={projectdescription} onChange={(e)=>{setprojectdescription(e.target.value)}} className='w-full focus:outline-none text-black rounded-lg py-1 px-2'/>
                       </div>
                       <div className='flex justify-between items-center py-1 w-[90%] mx-auto mt-4'>
                        <button className='px-2  rounded-lg bg-white text-cyan-500 hover:text-cyan-700 text-lg' onClick={()=>{setisAdding(false)}}> Cancal</button>
                        <button className='px-2  rounded-lg bg-cyan-400 hover:bg-cyan-500  text-white text-lg'> Add Project</button>
                       </div>
                    </div>
            </div>
        )
     }
   
   
 <div className='w-full h-full max-h-dvh '>
 <div className='bg-white/70  rounded-2xl px-6 py-10 w-[90%] lg:w-[85%]  h-[100%]  relative overflow-y-auto mx-auto'>
 <div className='absolute top-2 right-4'>     
   
 <MdOutlineDelete className='text-2xl text-black/50 hover:text-black' onClick={()=>{ setisdeleting(true)}} title="Delete this Project"/>
             
 </div>
 <div className='absolute top-2 left-4'>     
   
 <IoChevronBackOutline className='text-2xl text-black/50 hover:text-black'  onClick={()=>{router.push("/dashboard")}}/>
             
 </div>
  <h1 className='text-4xl font-bold'>{team?team.name:''}</h1>
  <h3 className='text-xl font-bold text-cyan-900 mt-3'>Team Members</h3>
  {
    isAdmin &&(
        <div className='flex items-center gap-4 '>
        <IoAdd className='bg-black/30 text-customRed text-2xl rounded-full px-1 py-1' onClick={()=>{
          setisAddingMember(!isaddingmember)}}/>
        <div className='text-black text-2xl'>Add Members</div>
      </div>
    )
  }
   {
    team &&(
        <div>
    {team.members ? (
     team.members.map((member) => (
      <div key={member._id}>{member.username}</div>
     ))
   ) : (
     <div>No memebrs available.</div>
   )}
      
        </div>
    )
   }
    <h3 className='text-xl font-bold text-cyan-900 mt-3'>Team Projects</h3>
  {
    isAdmin&&(
        <div className='flex items-center gap-4 '>
     <IoAdd className='bg-black/30 text-customRed text-2xl rounded-full px-1 py-1' onClick={()=>{
       setisAdding(!isAdding)}}/>
     <div className='text-black text-2xl'>Add Project</div>
   </div>
    )
  }

   
   <div className='w-full py-2 flex flex-col gap-5'>
     
        {/* {projecttodos ? (
     projecttodos.map((todo) => (
       <TodoItem 
         key={todo._id}
         task={todo.task}
         iscompleted={todo.iscompleted}
         todoid={todo._id}
         priority={todo.priority}
         deadline={todo.deadline}
         projectid={id}
         handletoggletodo={handdletodotoggle}
         handledeletetodo={handleTodoDelete}
       />
     ))
   ) : (
     <div>No todos available.</div>
   )}
       */}
   </div>

 </div>
 </div>
 
</div>
  )
}

export default page
