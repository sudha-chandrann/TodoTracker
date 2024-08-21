'use client'
import React, { useEffect, useState } from 'react'
import {Itim} from 'next/font/google';
import { IoAdd } from "react-icons/io5";
import { FaFlag } from "react-icons/fa";
import { Menu } from "@headlessui/react";
import { useSelector } from 'react-redux';
const itim = Itim({
  weight: ['400'], 
  subsets: ['latin'],     
});
import toast from 'react-hot-toast';
import Timer from '@/Components/Timer';
import axios from 'axios';
import TodayTodoItem from '@/Components/Todattodoitem';
function page() {

  const inboxid=useSelector((state)=>state.user.inbox);  
  const [date,setdate]=useState(new Date());
  const [isAdding ,setisAdding]=useState(false)


  const [task, settask] = useState("");
  const [description, setdescription] = useState("");
  const [priority, setpriority] = useState("3");
  const[prioritylevel,setprioritylevel]=useState("Select Priority")
  const [projectname ,setprojectname]=useState("select the project")
  const [projectId,setprojectId]=useState('');
  const projects = useSelector((state) => state.user.projects);
  const [todaytodos,settodaytodos]=useState([])
  
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
  const setrequiredDate=()=>{
    let newDate = new Date();
    newDate=newDate.toDateString();
    setdate(newDate)
  }
  useEffect(()=>{
    setrequiredDate();
  },[date])

  const handleTodoDelete = (deletedTodoId) => {
    settodaytodos((prevTodos) => prevTodos.filter(todo => todo._id !== deletedTodoId));
  };
  const handdletodotoggle = (todoId,iscomplete) => {
    settodaytodos(prevTodos =>
      prevTodos.map(todo =>
        todo._id === todoId
          ? { ...todo, iscompleted: iscomplete } // Toggle the isCompleted status
          : todo
      )
    );
  };
  
  const addtodo=async()=>{

    if(task !='' && description !='' && projectId !='' && priority !=''){
       try{
         const response=await axios.post(`/api/projects/${projectId}`,{
           task,
           description,
           priority,
           deadline:new Date()
         })
         if(response.data.success){
           toast.success(response.data.message)
           settodaytodos([...todaytodos, response.data.data.todo]);
         }
         else{
           toast.error(response.data.message)
         }
       }
       catch(error){
         console.log(error)
       }
       finally{
         setisAdding(false)
         settask('')
         setdescription('')
         setpriority('3')
         setprioritylevel('Select Priority')
         setprojectname("select the project")
         setprojectId('')
       }
    }
    else{
     toast.error('Please fill all fields')
    }
  }

  const gettodaytodos=async()=>{
     try{
      const response=await axios.get(`/api/users/gettodaytodos`);
      if(response.data.success){
        settodaytodos(response.data.data.todayTodos)
      }
     }
     catch(error){
      console.log(error);
     }
  }
  useEffect(()=>{
    gettodaytodos();
  },[date])

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
         <div className='bg-black/50 text-white text-center py-1 px-5 rounded-xl text-lg'>
             Today
         </div>
         
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
                    {projectname}
                  </Menu.Button>
                </div>
                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="p-1">
                  <Menu.Item >
                        {({ active }) => (
                          <button
                            onClick={() => {
                              setprojectId(inboxid)
                              setprojectname("Inbox")
                              }
                            }
                            className={`group flex items-center w-full px-2 py-2 text-sm ${
                              active
                                ? "bg-black/60 text-white"
                                : "text-gray-900"
                            }`}
                          >
                            
                            {'Inbox'}
                          </button>
                        )}
                      </Menu.Item>
                    {projects.map((option) => (
                      <Menu.Item key={option._id}>
                        {({ active }) => (
                          <button
                            onClick={() => {
                              setprojectId(option._id)
                              setprojectname(option.name)
                              }
                            }
                            className={`group flex items-center w-full px-2 py-2 text-sm ${
                              active
                                ? "bg-black/60 text-white"
                                : "text-gray-900"
                            }`}
                          >
                            
                            {option.name}
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




    <div className='w-[100%] h-dvh overflow-y-auto md:w-[90%] bg-white/70 lg:w-[75%] rounded-2xl pt-6 px-7'>
    <div className='w-full flex flex-wrap-reverse justify-between py-2  items-center'>
      <div className='text-black text-4xl font-extrabold  w-[40%]'>Today</div>
      <div className='w-[50%]'>
      <Timer date={date}/>
      </div>
    </div>
    <div className='w-full flex gap-4 items-center'>
          <IoAdd className='bg-black/30 text-customRed text-4xl rounded-full px-1 py-1' onClick={()=>{
          setisAdding(!isAdding)}}/>
          <div className='text-black text-2xl'>Add Todo</div>
    </div>
      <div className='w-full flex flex-col gap-5 py-2'>
      {todaytodos ? (
        todaytodos.map((todo) => (
          <TodayTodoItem 
           
            key={todo._id}
            task={todo.task}
            iscompleted={todo.iscompleted}
            todoid={todo._id}
            priority={todo.priority}
            projectname={todo.projectname}
            projectid={todo.project}
            handledeletetodo={handleTodoDelete} 
            handletoggletodo={handdletodotoggle}
          />
        ))
      ) : (
        <div>No todos available.</div>
      )}
      </div>
    </div>
   </div>
  )
}

export default page
