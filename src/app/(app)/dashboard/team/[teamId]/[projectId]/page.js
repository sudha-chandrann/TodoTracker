'use client'
import React, { useState ,useEffect} from 'react'
import { useRouter } from 'next/navigation';
import {Itim} from 'next/font/google';
import toast  from 'react-hot-toast';
import { CiEdit } from "react-icons/ci";
import { IoAdd } from "react-icons/io5";
import { Menu } from "@headlessui/react";
import { MdOutlineDelete } from "react-icons/md";
import { IoChevronBackOutline } from "react-icons/io5";
import { FaFlag ,FaCheck } from "react-icons/fa";
import { FaCommentAlt } from "react-icons/fa";
import axios from 'axios';
import { useSelector ,useDispatch} from 'react-redux';
import { removeProjectFromTeam, selectTeamById } from '@/store/teamSlice';
import { getSocket, initializeSocket } from "@/socket.js";
import { GetstringDate } from '@/helper/getstringdate';

const itim = Itim({
    weight: ['400'], 
    subsets: ['latin'],     
  });
function page({params}) {
    const teamid = params.teamId;
    const projectid=params.projectId;
    const [project,setproject]=useState({});
    const [projectname,setprojectname]=useState('');
    const [projectdescription,setprojectdescription]=useState('');
    const [projecttodos,setprojecttodos]=useState([]);
    const [newdescription,setnewdescription]=useState('');
    const [isedting,setisediting]=useState(false);
    const [isdeleting ,setisdeleting]=useState(false);
    const [isAdding ,setisAdding]=useState(false);
    const [isAdmin,setisAdmin]=useState(false);
    const userid = useSelector((state) => state.user._id);
    const dispatch=useDispatch();
    const router=useRouter();
    const [assignedoptions,setassignedoptions]=useState([]);
    const teambyid = useSelector((state) => selectTeamById(state, teamid));
    const [task,settask]=useState('');
    const [description,setdescription]=useState('');
    const [assignedto,setassignedto]=useState('');
    const [priority,setpriority]=useState('');
    const [deadline,setdeadline]=useState(new Date());
    const[prioritylevel,setprioritylevel]=useState("Select Priority")
    const [minDate, setMinDate] = useState("");
    const [assignedtolevel,setassignedtolevel]=useState('Assigned To')


    useEffect(() => {
        if (teambyid && userid === teambyid.admin) {
          setisAdmin(true);
        } else {
          setisAdmin(false);
        }
        if(teambyid){
            setassignedoptions(teambyid.members)
           
        }
      }, [userid, teambyid]);

    useEffect(() => {
        
        if (projectid) {
          projectinfo();
        }
      }, [projectid]);
      const projectinfo= async()=>{
        try{
            const response=await axios.get(`/api/teams/${projectid}`);
            if(response.data.success){
                const data=response.data.data.project
                // console.log(data)
                setproject(data);
                setprojectname(data.name);
                setprojectdescription(data.description);
                setprojecttodos(data.todos);
                setnewdescription(data.description)
            }
        }
        catch(error){
            console.log(error)
        }
      }  
      const deleteproject = () => {
        let socket = getSocket();
        if (!socket && userid) {
          socket = initializeSocket(userid);
        }
    
        if (socket) {
          socket.emit("deleteProjectfromteam", {
            teamId: teamid,
            projectId:projectid
          });
        }
      };
      useEffect(() => {
        let socket;
        if (userid) {
          socket = initializeSocket(userid);
        }
    
          if (socket) {
          socket.on("projectDeleted",(data)=>{
            if(data.success){
              dispatch(removeProjectFromTeam({teamId:data.teamId,projectId:data.projectId}))
              router.back();
            }
          })

          socket.on("descriptionUpdated",(data)=>{
            if(data.success){
                setprojectdescription(data.newDescription);
                setisediting(false)
            }
          })
          
          socket.on("todoAdded",(data)=>{
            if(data.success){
              setprojecttodos((prev)=>[...prev,data.todo])
              setisAdding(false)
              settask('');
              setdescription('');
              setpriority('3');
              setdeadline(new Date());
              setassignedto('');
              setassignedtolevel("Assigned to");
              setprioritylevel('Select Priority')

            }
          })
         
            socket.on("todoCompletionToggled", (data) => {
              if (data.success) {
                handdletodotoggle(data.todoId, data.iscompleted);
              }
            });
            socket.on("error", (data) => {
              if (!data.success) {
                toast.error(data.message)
                
              }
            });
            socket.on("todoDeleted", (data) => {
              if (data.success) {
                handleTodoDelete(data.todoId);
              }
            });
          

    
    
    
          return () => {
            socket.off("projectDeleted");
            socket.off("descriptionUpdated");
            socket.off("todoCompletionToggled");
            socket.off("todoAdded");
            socket.off("error");
          };
        }
      }, [userid]);
      const editdescription = () => {
        let socket = getSocket();
        if (!socket && userid) {
          socket = initializeSocket(userid);
        }
    
        if (socket) {
          socket.emit("editProjectDescription", {
            teamId: teamid,
            projectId:projectid,
            newDescription:newdescription
          });
        }
      };
      const addtodo=()=>{
        if(task ==='' || description ==='' ||assignedto ==='' ||deadline ===''){
          toast.error("please enter all the fields");
          return;
        }
        let socket = getSocket();
        if (!socket && userid) {
          socket = initializeSocket(userid);
        }
    
        if (socket) {
          socket.emit("addTodo", {
            teamId: teamid,
            projectId:projectid,
            task,
            description,
            assignedto,
            priority,
            deadline:new Date(deadline)

          });
        }
      }
      const  tooglecomplete=(todoId)=>{
        let socket = getSocket();
        if (!socket && userid) {
          socket = initializeSocket(userid);
        }
    
        if (socket) {
          socket.emit("toggleTodoCompletion", {
            teamId: teamid,
            todoId:todoId

          });
        }
      };
      const  deleteTodo=(todoId)=>{
        let socket = getSocket();
        if (!socket && userid) {
          socket = initializeSocket(userid);
        }
    
        if (socket) {
          socket.emit("deleteTodoFromProject", {
            teamId: teamid,
            todoId:todoId,
            projectId:projectid
          });
        }
      };
      const handleTodoDelete = (deletedTodoId) => {
        setprojecttodos((prevTodos) => prevTodos.filter(todo => todo._id !== deletedTodoId));
      };
      const handdletodotoggle = (todoId,iscompleted) => {
        setprojecttodos(prevTodos =>
          prevTodos.map(todo =>
            todo._id === todoId
              ? { ...todo, iscompleted: iscompleted } // Toggle the isCompleted status
              : todo
          )
        );
      };
    

      
      useEffect(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
        const day = String(today.getDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;
        setMinDate(formattedDate);
      }, []);
      const options = [
        {
          value: "1",
          label: "Priority 1",
          icon: <FaFlag className="h-5 w-5 text-yellow-500" />,
        },
        {
          value: "2",
          label: "Priority 2",
          icon: <FaFlag className="h-5 w-5 text-green-500" />,
        },
        {
          value: "3",
          label: "Priority 3",
          icon: <FaFlag className="h-5 w-5 text-red-500" />,
        },
      ];
      



     
  return (
    <div className={`h-full bg-slate-400 flex items-center justify-center ${itim.className} w-full `}>
     {
     isAdding?<div className='fixed top-[25%] left-[40%] bg-gray-400 px-6 py-6 rounded-lg  w-[60%] md:w-[40%] z-10'>
       <div className='w-full'>
         <label htmlFor='name' className='font-bold text-xl'>Task :</label>
         <input  id="name" className='bg-white rounded-lg text-black w-full py-2 px-3 outline-none focus:outline-none text-xl' onChange={(e)=>{settask(e.target.value)}} value={task} placeholder='Enter the todo '/>
      </div>
      <div className='w-full mt-6 text-xl'>
         <label htmlFor='description' className='font-bold'>Description:</label>
         <textarea id="description" className='bg-white rounded-lg text-black w-full py-2 px-3 outline-none focus:outline-none text-xl' onChange={(e)=>{setdescription(e.target.value)}} value={description} placeholder='Enter the description for the Project '/>
      </div>
      <div className='w-full flex flex-wrap gap-2 items-center mt-3'>
      <input
           type="date"
           className="bg-black/50 px-2 py-1 rounded-xl outline-none text-white"
           value={deadline}
           min={minDate}
           onChange={(e) => {
             setdeadline(e.target.value);
           }}
         />
      
      <div className="relative inline-block text-left ">
           <Menu as="div" className="relative">
             <div>
               <Menu.Button className="inline-flex w-full justify-center rounded-xl  bg-black/50 px-4 py-2 text-sm font-medium text-white  hover:bg-black/60 focus:outline-none  ">
                 {prioritylevel}
                 <FaFlag className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
               </Menu.Button>
             </div>
             <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
               <div className="p-1">
                 {options.map((option) => (
                   <Menu.Item key={option.value}>
                     {({ active }) => (
                       <button
                         onClick={() => {
                           setpriority(option.value)
                           setprioritylevel(option.label)
                           }
                         }
                         className={`group flex items-center w-full px-2 py-2 text-sm ${
                           active
                             ? "bg-black/60 text-white"
                             : "text-gray-900"
                         }`}
                       >
                         <span className="mr-2">{option.icon}</span>
                         {option.label}
                       </button>
                     )}
                   </Menu.Item>
                 ))}
               </div>
             </Menu.Items>
           </Menu>
        </div>
        <div className="relative inline-block text-left ">
           <Menu as="div" className="relative">
             <div>
               <Menu.Button className="inline-flex w-full justify-center rounded-xl  bg-black/50 px-4 py-2 text-sm font-medium text-white  hover:bg-black/60 focus:outline-none  ">
                 {assignedtolevel}
               </Menu.Button>
             </div>
             <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
               <div className="p-1">
                 {assignedoptions.map((option) => (
                   <Menu.Item key={option._id}>
                     {({ active }) => (
                       <button
                         onClick={() => {
                           if(option._id ===userid ){
                            setassignedtolevel("Me")
                           }
                           else{
                            setassignedtolevel(option.username)
                           }
                           setassignedto(option._id)
                           }
                         }
                         className={`group flex items-center w-full px-2 py-2 text-sm ${
                           active
                             ? "bg-black/60 text-white"
                             : "text-gray-900"
                         }`}
                       >
                         {
                          option._id ===userid?"Me":option.username
                         }
                         
                       </button>
                     )}
                   </Menu.Item>
                 ))}
               </div>
             </Menu.Items>
           </Menu>
         </div>
      </div>
      <div className='w-full mt-6  flex justify-between items-center py-2 px-2'>
         <button className='bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50' onClick={()=>{setisAdding(false)}}> Cancal</button>
         <button className='bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400'onClick={()=>{addtodo()}}> Add todo</button>
      </div>
     </div>:<div></div>
 
   } 
     {
     isedting?<div className='fixed top-[25%] left-[40%] bg-gray-400 px-6 py-6 rounded-lg  w-[60%] md:w-[40%] z-10'>

      <div className='w-full mt-6 text-xl'>
         <label htmlFor='description' className='font-bold'>Description:</label>
         <textarea id="description" className='bg-white rounded-lg text-black w-full py-2 px-3 outline-none focus:outline-none text-xl' onChange={(e)=>{setnewdescription(e.target.value)}} value={newdescription} placeholder='Enter the description for the Project '/>
      </div>
      <div className='w-full mt-6  flex justify-between items-center py-2 px-2'>
         <button className='bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50' onClick={()=>{setisediting(false)}}> Cancal</button>
         <button className='bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400'onClick={()=>{editdescription()}}> Edit Description</button>
      </div>
     </div>:<div></div>
   }
   {
     isdeleting?<div className='fixed top-[25%] left-[40%] bg-gray-400 px-6 py-6 rounded-lg  w-[60%] md:w-[40%] z-10'>

     <div className='w-full mt-6 text-xl text-center'>
        Are you sure , you want to delete this project 
     </div>
     <div className='w-full mt-6  flex justify-between items-center py-2 px-2'>
        <button className='bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50' onClick={()=>{setisdeleting(false)}}> Cancal</button>
        <button className='bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400'onClick={()=>{deleteproject()}}> Delete</button>
     </div>
    </div>:<div></div>
   } 
   
 <div className='w-full h-full max-h-dvh '>
 <div className='bg-white/70  rounded-2xl px-6 py-10 w-[90%] lg:w-[85%]  h-[100%]  relative overflow-y-auto mx-auto'>
 {
    isAdmin &&(
        <div className='absolute top-2 right-4'>     
   
        <MdOutlineDelete className='text-2xl text-black/50 hover:text-black' onClick={()=>{ setisdeleting(true)}} title="Delete this Project"/>
                    
        </div>
    )
 }

 <div className='absolute top-2 left-4'>     
   
 <IoChevronBackOutline className='text-2xl text-black/50 hover:text-black'  onClick={()=>{router.back()}}/>
             
 </div>
 <div className='flex justify-between items-center'>
 <h1 className='text-4xl font-bold'>{projectname}</h1> 
 <h2 className='text-black flex gap-1 items-center'> Admin: <div className='px-2 py-1 rounded-lg bg-cyan-200'>{project? project.team?.admin?._id ===userid ?'You':project.team?.admin?.username :''}</div></h2>
 </div>
  
  <div className=' flex justify-between items-center  w-full lg:w-[70%] mt-2'>
   <div className='text-xl text-black/50'>Description:</div>
 {
    isAdmin&&(
        <CiEdit className='text-2xl text-black/50 hover:text-black' onClick={()=>{ setisediting(!isedting)}} title='Edit the description'/>
    )
 }
           
  </div>
  <div className='bg-black/10 py-3  w-full lg:w-[70%] px-2 rounded-xl'>
  {projectdescription}
  </div>
  {
   isAdmin &&(
    <div className='flex items-center gap-4 mt-8'>
    <IoAdd className='bg-black/30 text-customRed text-4xl rounded-full px-1 py-1' onClick={()=>{
      setisAdding(!isAdding)}}/>
    <div className='text-black text-2xl'>Add Todo</div>
  </div>
   )
  }
   {
    !isAdmin &&(
    <div className='flex items-center gap-4 mt-8'>
    <div className='text-black text-2xl'> Todos</div>
  </div>
   )
  }

   <div className='w-full py-2 flex flex-col gap-5 mt-3'>
        {projecttodos ? (
     projecttodos.map((todo) => (
       <div key={todo._id}  className='w-full px-2 py-1 bg-black/10 rounded-xl'>
        <div className='w-full  flex items-center justify-between'>
        <div className='text-black/60 flex flex-col items-start justify-between'>
           <div className='flex items-center gap-2'>
            <div
            className="h-5 w-5 rounded-full bg-white flex justify-center items-center"
            onClick={() => {
              tooglecomplete(todo._id);
            }}
          >
            {todo.iscompleted ? <FaCheck className="text-green-700" /> : <div></div>}
          </div>
            <div className={`text-lg  cursor-pointer ${todo.iscompleted?'text-green-600':'text-black'}`}>{todo.task}</div>
             
             </div>
           <div className='hover:text-black cursor-pointer'> Deadline : {GetstringDate(todo.deadline)}</div>
        </div>
        <div  className='flex flex-col items-end  text-black/60'>
           <div className='hover:text-black cursor-pointer'> AssignedTo: {
            todo.assignedto._id ===userid ?'You':todo.assignedto.username
           }</div>
           <div className='hover:text-black cursor-pointer'> Priority : {todo.priority}</div>
        </div>
        </div>
        <div className='flex items-center justify-end'>
          <div className='flex items-center gap-2 text-black/60 text-lg'>
            <CiEdit  className='hover:text-black cursor-pointer' onClick={()=>{router.push(`/dashboard/team/${teamid}/${projectid}/${todo._id}`)}}/>
            <FaCommentAlt className='hover:text-black cursor-pointer' onClick={()=>{router.push(`/dashboard/team/${teamid}/${projectid}/${todo._id}`)}}/>
              {
                isAdmin &&(
                  <MdOutlineDelete className='hover:text-black cursor-pointer' onClick={()=>{ deleteTodo(todo._id)}}/>
                )
              }
            
          </div>
        </div>
       
       
        </div>
     ))
   ) : (
     <div>No todos available.</div>
   )}
      
   </div>

 </div>
 </div>
 
</div>
  )
}

export default page
