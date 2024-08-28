
'use client'
import React, { useEffect, useState } from 'react'
import TodoItem from '@/Components/TodoItem';
import {Itim} from 'next/font/google';
import toast  from 'react-hot-toast';
import axios from 'axios';
import { IoAdd } from "react-icons/io5";
import { Menu } from "@headlessui/react";
import { IoChevronBackOutline } from "react-icons/io5";
import { FaFlag } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';


const itim = Itim({
    weight: ['400'], 
    subsets: ['latin'],     
  });
function page() {
  const router =useRouter();
  const [isAdding,setisAdding]=useState(false)
  const inboxid=useSelector((state)=>state.user.inbox)
  const [inboxtodos,setinboxtodos]=useState([]);
  const getindoxtodo=async()=>{
    
        try{
            const response=await axios.get(`/api/projects/${inboxid}`);
            if(response.data.success){
                const data=response.data.data.project
                setinboxtodos(data.todos);
            }
        }
        catch(error){
            console.log(error);
        }
  

   
  }

  useEffect(()=>{
    if(inboxid){
        getindoxtodo();
    }
   
},[inboxid])
  

const [task,settask]=useState('');
const [description, setdescription] = useState('');
const [priority, setpriority] = useState('3');
const [deadline, setdeadline] = useState(new Date());
const[prioritylevel,setprioritylevel]=useState("Select Priority")
const [minDate, setMinDate] = useState("");

const addtodo=async()=>{

    if(task !='' &&description !='' && deadline !='' && priority !=''){
       try{
         const data={
           task:task,
           description:description,
           priority:priority,
           deadline:new Date(deadline),
         }
         const response=await axios.post(`/api/projects/${inboxid}`,data)
         if(response.data.success){
           toast.success(response.data.message)
           setinboxtodos([...inboxtodos, response.data.data.todo]);
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
         settask('');
         setdescription('');
         setpriority('3');
         setdeadline(new Date());
         setprioritylevel('Select Priority')  
       }
    }
    else{
     toast.error('Please fill all fields')
    }
}

const handleTodoDelete = (deletedTodoId) => {
    setinboxtodos((prevTodos) => prevTodos.filter(todo => todo._id !== deletedTodoId));
};
  const handdletodotoggle = (todoId,iscompleted) => {
    setinboxtodos(prevTodos =>
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
         </div>
         <div className='w-full mt-6  flex justify-between items-center py-2 px-2'>
            <button className='bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50' onClick={()=>{setisAdding(false)}}> Cancal</button>
            <button className='bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400'onClick={()=>{addtodo()}}> Add todo</button>
         </div>
        </div>:<div></div>
      }
    <div className='w-full h-full max-h-dvh '>
    <div className='bg-white/70  rounded-2xl px-6 py-10 w-[90%] lg:w-[85%]  h-[100%]  relative overflow-y-auto mx-auto'>
    <div className='absolute top-2 left-4'>     
    <IoChevronBackOutline className='text-2xl text-black/50 hover:text-black'  onClick={()=>{router.push("/dashboard")}}/>   
      </div>
      <h1 className='text-4xl font-extrabold text-black/75'>Inbox</h1>
      <div className='flex items-center gap-4 mt-8'>
        <IoAdd className='bg-black/30 text-customRed text-4xl rounded-full px-1 py-1' onClick={()=>{
          setisAdding(!isAdding)}}/>
        <div className='text-black text-2xl'>Add Todo</div>
      </div>

      <div className='w-full py-2 flex flex-col gap-5'>
        
        {inboxtodos ? (
     inboxtodos.map((todo) => (
       <TodoItem 
         key={todo._id}
         task={todo.task}
         iscompleted={todo.iscompleted}
         todoid={todo._id}
         priority={todo.priority}
         deadline={todo.deadline}
         projectid={inboxid}
         handletoggletodo={handdletodotoggle}
         handledeletetodo={handleTodoDelete}
       />
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

