'use client'
import axios from 'axios'
import {Itim} from 'next/font/google';
import React, { useEffect, useState } from 'react'
import { IoAdd } from "react-icons/io5";
import { FaFlag } from "react-icons/fa";
import { Menu } from "@headlessui/react";
import { FaCheck } from "react-icons/fa6";
import { BsFillSendFill } from "react-icons/bs";
import toast from 'react-hot-toast';
import { CiEdit } from "react-icons/ci";
import { MdOutlineDelete } from "react-icons/md";
import { useRouter } from 'next/navigation';
import { IoChevronBackOutline } from "react-icons/io5";
import Timer from '@/Components/Timer';
import SubTodoitem from '@/Components/SubTodoItem';
import Commentitem from '@/Components/CommentItem';

const itim = Itim({
  weight: ['400'], 
  subsets: ['latin'],     
});
function page({params}) {
    const todoid=params.todoId
    const projectId=params.projectId


    const [isAdding ,setisAdding]=useState(false)
    const [isedting,setisediting]=useState(false);
    const [isdeleting ,setisdeleting]=useState(false);
    const [isupdatepriority,setisupdatepriority]=useState(false)
    const [isupdatedeadline,setisupdatedeadline]=useState(false)


    const [todoprojectname,settodoprojectname]=useState('');
    const [tododeadline,settododeadline]=useState('');
    const [todotask ,settodotask]=useState('')
    const [iscompleted,setiscompleted]=useState(false)
    const [tododescription,settododescription]=useState('');
    const [newdescription,setnewdescription]=useState('');
    const [todoSubtodos,settodosubtodos]=useState([])
    const [todoComments,settodocomments]=useState([])
    const [todopriority,settodopriority]=useState('')
    const [newpriority,setnewpriority]=useState('');
    const [newdeadline,setnewdeadline]=useState('')
   

    const router=useRouter();
    const [subtodotask,setsubtodotask]=useState('');
    const [subtododescription,setsubtododescription]=useState('');
    const [subtododeadline,setsubtododeadline]=useState(new Date());
    const [subtodopriority,setsubtodopriority]=useState('3');
    const[prioritylevel,setprioritylevel]=useState("Select Priority")
    const [minDate, setMinDate] = useState("");
  
    const [comment,setComment]=useState('');

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
    const handlesubTodoDelete = (deletedsubTodoId) => {
      settodosubtodos((prevTodos) => prevTodos.filter(todo => todo._id !== deletedsubTodoId));
    };
    const handlesubtodotoogle = (subtodoId,iscompleted) => {
      settodosubtodos(prevTodos =>
        prevTodos.map(subtodo =>
          subtodo._id === subtodoId
            ? { ...subtodo, iscompleted: iscompleted } // Toggle the isCompleted status
            : subtodo
        )
      );
    };
    
    const handlecommentedit=(commentid,newcomment)=>{
      settodocomments(precomment =>
        precomment.map(comment =>
          comment._id === commentid
            ? { ...comment, comment: newcomment } // Toggle the isCompleted status
            : comment
        )
      );
    }
    const handlecommentDelete=(deletecommentid)=>{
      settodocomments((precomment) => precomment.filter(comment => comment._id !== deletecommentid));
    }
    const addsubtodo=async()=>{
       if(subtodotask !='' && subtododescription !='' && subtododeadline !='' && subtodopriority !=''){
        try{
          const response =await axios.post(`/api/projects/${projectId}/${todoid}`,
            {
              task:subtodotask,
              description:subtododescription,
              priority:subtodopriority,
              deadline:new Date(subtododeadline)
            }
          )
          if(response.data.success){
            toast.success(response.data.message)
            settodosubtodos([...todoSubtodos, response.data.data.subtodo]);
          }
          else{
            toast.error(response.data.message)
          }
          
        }
        catch(error){
          console.log(error)
        }
        finally{
           setisAdding(false);
           setsubtododeadline(new Date());
           setsubtododescription('');
           setsubtodotask('');
           setsubtodopriority('3');
           setprioritylevel("select the priority"); 
        }
         

       }
       else{
        toast.error("please fill all the form ")
       }


    }
    const updatetododescription =async()=>{
      try{
         const response =await axios.patch(`/api/projects/${projectId}/${todoid}`,
          {
            newdescription:newdescription
          }
         )
         if(response.data.success){
          toast.success(response.data.message)
          settododescription(response.data.data.description)
         }else{
          toast.error(response.data.message)
         }
      }
      catch(error){
        console.log(error)
      }
      finally{
        setisediting(false);
      }
    }
    const toogleiscompleted=async()=>{
      try{
        const response=await axios.put(`/api/projects/${projectId}/${todoid}`,{
          iscompleted:!iscompleted
        })
        if(response.data.success){
          toast.success(response.data.message)
          setiscompleted(response.data.data.iscompleted)
        }
        else{
          toast.error(response.data.message)
        }

      }
      catch(error){
        console.log(error);
      }
    }
    const updatePriority=async()=>{
       try{
        const response=await axios.patch(`/api/projects/${projectId}/${todoid}`,
          {
            newpriority:newpriority
          }
        )
        if(response.data.success){
          toast.success(response.data.message)
          settodopriority(response.data.data.priority);
        }
        else{
          toast.error(response.data.message)
        }

       }
       catch(error){
        console.log(error);
       }
       finally{
        setisupdatepriority(false)
        setprioritylevel("select the priority")
        setnewpriority(todopriority);
       }
    }
    const updateDeadline=async()=>{
      try{
       const response=await axios.patch(`/api/projects/${projectId}/${todoid}`,
         {
           newdeadline:new Date(newdeadline)
         }
       )
       if(response.data.success){
         toast.success(response.data.message)
         const newdeadline=new Date(response.data.data.deadline)
         settododeadline(newdeadline.toDateString())
       }
       else{
         toast.error(response.data.message)
       }

      }
      catch(error){
       console.log(error);
      }
      finally{
       setisupdatedeadline(false)
       setnewdeadline(new Date(tododeadline))
      }
   }
    useEffect(() => {
        if (todoid && projectId) {
          getTodo();
        }
      }, [todoid,projectId]);
    const getTodo=async()=>{
        try{
           const response=await axios.get(`/api/projects/${projectId}/${todoid}`);
           if(response.data.success){
            const data=response.data.data.todo
          
            settodosubtodos(data.subtodos);
            settodoprojectname(data.project);
            settodotask(data.task);
            settododescription(data.description);
            setnewdescription(data.description);
            const deadlinedate= new Date(data.deadline)
            settododeadline(deadlinedate.toDateString());
            setiscompleted(data.iscompleted)
            settodocomments(data.comments);
            settodopriority(data.priority);
            setnewpriority(data.priority);
            setnewdeadline(data.deadlinedate)
           }
           
        }
        catch(error){
            console.log(error.message)
        }
    }

   const handlefunction=()=>{
      setisupdatedeadline(true)
   }

  const deletetodo=async()=>{
        try{
           const response=await axios.delete(`/api/projects/${projectId}/${todoid}`);
           if(response.data.success){
              toast.success(response.data.message)
              router.back()
           }
           else{
            toast.error(response.data.message)
           }
        }
        catch(error){
          console.log(error.message)
        }


  }

  const sendcomment=async()=>{ 
      if(!comment){
        toast.error("please enter a comment ")
      }
      else{
          try{
        const response=await axios.post(`/api/comments/${todoid}`,
          {
            comment:comment
          })
          if(response.data.success){
            toast.success(response.data.message)
            settodocomments([...todoComments, response.data.data.result]);
          }
          else{
            toast.error(response.data.message)
          }
       }
       catch(error){
        console.log(error.message)
       }
       finally{
        setComment('')
       }
      }
   


  }

   
  return (
    <div className={`h-screen bg-slate-400 flex items-center justify-center ${itim.className} `}>
     {
      isAdding?<div className='fixed top-[25%] left-[40%] bg-gray-400 px-6 py-6 rounded-lg  w-[60%] md:w-[40%] z-10'>
        <div className='w-full'>
          <label htmlFor='name' className='font-bold text-xl'>Task :</label>
          <input  id="name" className='bg-white rounded-lg text-black w-full py-2 px-3 outline-none focus:outline-none text-xl' onChange={(e)=>{setsubtodotask(e.target.value)}} value={subtodotask} placeholder='Enter the subtodo '/>
       </div>
       <div className='w-full mt-6 text-xl'>
          <label htmlFor='description' className='font-bold'>Description:</label>
          <textarea id="description" className='bg-white rounded-lg text-black w-full py-2 px-3 outline-none focus:outline-none text-xl' onChange={(e)=>{setsubtododescription(e.target.value)}} value={subtododescription} placeholder='Enter the description for the subtodo '/>
       </div>
       <div className='w-full flex flex-wrap gap-2 items-center mt-3'>
       <input
            type="date"
            className="bg-black/50 px-2 py-1 rounded-xl outline-none text-white"
            value={subtododeadline}
            min={minDate}
            onChange={(e) => {
              setsubtododeadline(e.target.value);
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
                            setsubtodopriority(option.value)
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
          <button className='bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50' onClick={()=>{
            setisAdding(false)
            setsubtodotask('')
            setsubtododescription('')
            setprioritylevel("select the priority")
            setsubtodopriority('3')
            setsubtododeadline(new Date())
            
          }}> Cancal</button>
          <button className='bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400'onClick={()=>{addsubtodo()}}> Add todo</button>
       </div>
      </div>:<div></div>
  
    } 
       {
      isedting?<div className='fixed top-[25%] left-[40%] bg-gray-400 px-6 py-6 rounded-lg  w-[60%] md:w-[40%] z-10'>

       <div className='w-full mt-6 text-xl'>
          <label htmlFor='description' className='font-bold'>Description:</label>
          <textarea id="description" className='bg-white rounded-lg text-black w-full py-2 px-3 outline-none focus:outline-none text-xl' onChange={(e)=>{setnewdescription(e.target.value)}} value={newdescription} placeholder='Enter the description for the todo '/>
       </div>
       <div className='w-full mt-6  flex justify-between items-center py-2 px-2'>
          <button className='bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50' onClick={()=>{setisediting(false)}}> Cancal</button>
          <button className='bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400'onClick={()=>{updatetododescription()}}> Edit Description</button>
       </div>
      </div>:<div></div>
  
    } 
    
     { 
     isdeleting?<div className='fixed top-[25%] left-[40%] bg-gray-400 px-6 py-6 rounded-lg  w-[60%] md:w-[40%] z-10'>

      <div className='w-full mt-6 text-xl text-center'>
         Are you sure , you want to delete this todo 
      </div>
      <div className='w-full mt-6  flex justify-between items-center py-2 px-2'>
         <button className='bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50' onClick={()=>{setisdeleting(false)}}> Cancal</button>
         <button className='bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400'onClick={()=>{deletetodo()}}> Delete</button>
      </div>
     </div>:<div></div>
     }

{
      isupdatepriority?<div className='fixed top-[25%] left-[40%] bg-gray-400 px-6 py-6 rounded-lg  w-[60%] md:w-[40%] z-10'>
        <div className='text-center text-black font-bold'>
          Update the Priority
        </div>
        <div className='flex justify-center mt-5'>
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
                            setnewpriority(option.value)
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
          <button className='bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50' onClick={()=>{setisupdatepriority(false)}}> Cancal</button>
          <button className='bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400'onClick={()=>{updatePriority()}}> Update priority</button>
       </div>
      </div>:<div></div>
  
    } 
  {
      isupdatedeadline?<div className='fixed top-[25%] left-[40%] bg-gray-400 px-6 py-6 rounded-lg  w-[60%] md:w-[40%] z-30'>
        <div className='text-center text-black font-bold'>
          Update the Deadline
        </div>
        <div className='flex justify-center mt-5'>
           <input
            type="date"
            className="bg-black/50 px-2 py-1 rounded-xl outline-none text-white"
            value={newdeadline}
            min={minDate}
            onChange={(e) => {
              setnewdeadline(e.target.value);
            }}
          />
          </div>
       <div className='w-full mt-6  flex justify-between items-center py-2 px-2'>
          <button className='bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50' onClick={()=>{setisupdatedeadline(false)}}> Cancal</button>
          <button className='bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400'onClick={()=>{updateDeadline()}}> Update priority</button>
       </div>
      </div>:<div></div>
  
    }   
    
    <div className='h-full w-full max-h-dvh flex justify-center'>
    <div className='bg-white/70  rounded-2xl px-2 md:px-6 py-10 w-[95%]   h-[100%]  relative overflow-y-auto'>
  <div className='absolute top-2 right-4'>     
     <MdOutlineDelete className='text-2xl text-black/50 hover:text-black' onClick={()=>{ setisdeleting(true)}} title='Delete this Todo'/>       
   </div >
   <div className='absolute top-2 left-4'>     
     <IoChevronBackOutline className='text-2xl text-black/50 hover:text-black' onClick={()=>{router.back()}}/>
   </div >
   <div className='w-full flex justify-between items-center'>
    <div className='text-2xl'>Project: {todoprojectname}</div>
    <div className='text-black/50 text-xl'>Deadline:{tododeadline}</div>
   </div>
   <div className='w-full flex flex-wrap-reverse justify-between items-center py-2'>
    <div className='w-[100%] md:w-[70%] lg:w-[65%]'>
      <div className='flex gap-3 items-center w-full'>
        <div className='w-10 h-10 rounded-full bg-gray-300 flex justify-center items-center'
         onClick={()=>{toogleiscompleted()}}
          >
             {
                iscompleted?<FaCheck className="text-green-700 font-bold text-3xl"/>:<div></div>
              }
        </div>
        <div className={iscompleted?'text-3xl w-[80%] text-green-500':'text-3xl w-[80%]'}>{todotask}</div>
      </div>
     
     <div className=' flex justify-between items-center  w-full  mt-2'>
      <div className='text-xl text-black/50'>Description:</div>
      
           <CiEdit className='text-2xl text-black/50 hover:text-black' onClick={()=>{ setisediting(!isedting)}} title='Edit the Description'/>
               
     </div>
     <div className='bg-white py-3  w-full px-2 rounded-xl'>
      {tododescription}
     </div>

    </div>
    <div className='w-[100%] md:w-[30%] lg:w-[35%]'>
      <div className='w-full p-3 flex flex-col items-center gap-3'>
        <Timer date={tododeadline} iscompleted={iscompleted} fun={handlefunction}/>
        <div className='w-full bg-white rounded-xl py-2 px-3 flex justify-between items-center'>
          <div>Priority:{todopriority}</div>
                  <CiEdit className='text-2xl text-black/50 hover:text-black' onClick={()=>{ setisupdatepriority(true)}} title='Edit the Priority'/>
        </div>
        <div className='w-full bg-white rounded-xl py-2 px-3 flex justify-between items-center'>
          <div>Deadline:{tododeadline}</div>
          
                  <CiEdit className='text-2xl text-black/50 hover:text-black' onClick={()=>{ setisupdatedeadline(true)}} title='Edit the Deadline'/>
              
        </div>
      </div>
    </div>
   </div>
    <div className='w-full flex flex-wrap justify-between  py-2 mt-5'>
      <div className='w-[full] lg:w-[65%]'>
          <div className='w-full flex gap-4 items-center'>
          <IoAdd className='bg-black/30 text-customRed text-4xl rounded-full px-1 py-1' onClick={()=>{
          setisAdding(!isAdding)}}/>
          <div className='text-black text-2xl'>Add SubTodo</div>
          </div>
          <div className='w-full py-2 flex flex-col gap-5'>
        
           {todoSubtodos ? (
        todoSubtodos.map((subtodo) => (
          <SubTodoitem    
            key={subtodo._id}
            task={subtodo.task}
            iscompleted={subtodo.iscompleted}
            subtodoid={subtodo._id} 
            priority={subtodo.priority}
            deadline={subtodo.deadline}
            projectid={projectId}
            todoid={subtodo.todo}
            handlesubtodotoggle={handlesubtodotoogle}
            handlesubtododelete={handlesubTodoDelete}
          />
        ))
      ) : (
        <div>No todos available.</div>
      )}
         
      </div>
      </div>
      <div className='w-full lg:w-[35%]  px-2 py-2 flex flex-col '>
      <div className='text-2xl  text-black/50'>Comments:</div>
      <div className='bg-black/20 w-full rounded-xl flex justify-between items-center py-2'>
        <input value={comment} onChange={(e)=>{setComment(e.target.value)}} placeholder='Comments'
        className='lg:w-[90%] text-xl w-[50%] bg-transparent px-2 text-white py-1 focus:outline-none focus:border-none'/>
        <BsFillSendFill className='text-green-600 text-4xl pr-3' onClick={()=>{ sendcomment()}}/>
      </div>
      <div className='w-full flex flex-col gap-2 mt-3'>
      {todoComments ? ( 
        todoComments.map((comment) => (
          <Commentitem   
            key={comment._id}
            commentid={comment._id}
            comment={comment.comment}
            user={comment.user}
            todoid={todoid}
            ondelete={handlecommentDelete}
            onedit={handlecommentedit}
          />
        ))
      ) : (
        <div>No comments available.</div>
      )}
      </div>
      </div>
    </div>
   
       
    </div>
    </div>

  

  </div>

  )
}

export default page
