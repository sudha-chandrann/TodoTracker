'use client'
import React, { useEffect, useState } from 'react'
import {Itim} from 'next/font/google';
import toast from 'react-hot-toast';
import { MdOutlineDelete } from "react-icons/md";
import axios from 'axios';
import { FaCheck } from "react-icons/fa6";
import { CiEdit } from "react-icons/ci";
import { Menu } from "@headlessui/react";
import { FaFlag } from "react-icons/fa";
import { BsFillSendFill } from "react-icons/bs";
import { IoChevronBackOutline } from "react-icons/io5";
import { getSocket, initializeSocket } from "@/socket.js";
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Timer2 from '@/Components/Timer2';
import { getcapitalLetter } from '@/helper/getstringdate';
const itim = Itim({
  weight: ['400'], 
  subsets: ['latin'],     
});

function page({params}) {
  const teamid = params.teamId;
  const todoid=params.todoId
  const projectId=params.projectId
  const subtodoid=params.subtodoId
  
  const [isdeleting ,setisdeleting]=useState(false);
  const [isedting,setisediting]=useState(false);
  const [isupdatepriority,setisupdatepriority]=useState(false)
  const [isupdatedeadline,setisupdatedeadline]=useState(false)
  const [isedtingcomment,setiseditingcomment]=useState(false);


  const [priority,setpriority]=useState('3');
  const[prioritylevel,setprioritylevel]=useState("Select Priority")
  const [minDate, setMinDate] = useState("");
  const [deadline,setdeadline]=useState(new Date())


  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;
    setMinDate(formattedDate);
  }, []);


  const [assignedto,setassignedto]=useState({});
  const [subtodotask,setsubtodotask]=useState('');
  const [subtododescription,setsubtododescription]=useState('');
  const [subtododeadline,setsubtododeadline]=useState('');
  const [subtodopriority,setsubtodopriority]=useState('');
  const [subtodocomments,setsubtodocomments]=useState([]);
  const [subtodotodoname,setsubtodotodoname]=useState('');
  const [subtodoiscompleted,setsubtodoiscompleted]=useState(false);
  const [newdescription,setnewdescription]=useState('')

  const [comment,setComment]=useState('');
  const [newcomment,setnewcomment]=useState("");
  const [newcommentid,setnewcommentid]=useState('')


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

  const userid = useSelector((state) => state.user._id);
  const router = useRouter();
  const getsubTodo=async()=>{
    try{
       const response=await axios.get(`/api/projects/${projectId}/${todoid}/${subtodoid}`);
       if(response.data.success){
        const data=response.data.data.subtodo
        setsubtodotask(data.task);
        setsubtododescription(data.description);
        setsubtodocomments(data.comments);
        const deadlinedate= new Date(data.deadline)
        setsubtododeadline(deadlinedate.toDateString());
        setsubtodopriority(data.priority);
        setsubtodotodoname(data.todo);
        setsubtodoiscompleted(data.iscompleted)
        setnewdescription(data.description);
        setassignedto(data.assignedto[0]);
       }
    }
    catch(error){
        console.log(error.message)
    }
  }
  useEffect(() => {
    if (todoid && projectId && subtodoid) {
      getsubTodo();
    }
  }, [todoid,projectId,subtodoid]);

  useEffect(() => {
    let socket;
    if (userid) {
      socket = initializeSocket(userid);
    }

    if (socket) {
      socket.on("error", (data) => {
        if (!data.success) {
          toast.error(data.message);
        }
      });


      socket.on("subtodoCompletionToggled", (data) => {
        if (data.success) {
          setsubtodoiscompleted( data.iscompleted);
        }
      });
      socket.on("subtodoDeleted", (data) => {
        if (data.success) {
            router.back();
        }
      });
      socket.on("subtodoDescriptionUpdated", (data) => {
        if (data.success) {
            setsubtododescription(data.newDescription);
            setnewdescription(data.newDescription);
            setisediting(false);
        }
      });
      socket.on("subtodoPriorityUpdated", (data) => {
        if (data.success) {
            setsubtodopriority(data.newPriority);
            setprioritylevel('Select The priority');
            setpriority('3');
            setisupdatepriority(false);
        }
      });
      socket.on("updatesubTodoDeadlineSuccess", (data) => {
        if (data.success) {
           const date=new Date(data.newDeadline)
            setsubtododeadline(date.toDateString());
            setisupdatedeadline(false);
        }
      });
      socket.on("commentsubtodoAdded", (data) => {
        if (data.success) {
            setsubtodocomments((prev)=>[...prev,data.comment])
            setComment('')
        }
      });
      socket.on("commentsubtodoDeleted", (data) => {
        if (data.success) {
          handlecommentDelete(data.commentId)
        }
      });
      socket.on("updatedsubtodocomment", (data) => {
        console.log("the comment is sent",data)
        if (data.success) {
            handlecommentedit(data.commentId,data.comment)
            setnewcomment('')
            setiseditingcomment(false)
            setnewcommentid('')
        }
      });
      



      return () => {
        socket.off("subtodoCompletionToggled");
        socket.off("subtodoDeleted");
        socket.off("error");
        socket.off("subtodoDescriptionUpdated");
        socket.off("subtodoPriorityUpdated");
        socket.off("updatesubTodoDeadlineSuccess");
        socket.off("commentsubtodoAdded");
        socket.off("commentsubtodoDeleted");
        socket.off("updatedsubtodocomment");

      };
    }
  }, [userid]);

  const subtodotoogle = () => {
    let socket = getSocket();
    if (!socket && userid) {
      socket = initializeSocket(userid);
    }

    if (socket) {
      socket.emit("toggleSubTodoCompletion", {
        teamId: teamid,
        subtodoId: subtodoid,
      });
    }
  };
  const deleteSubTodo=()=>{
    let socket = getSocket();
    if (!socket && userid) {
      socket = initializeSocket(userid);
    }

    if (socket) {
      socket.emit("deleteSubTodo", {
        todoId: todoid,
        SubtodoId: subtodoid,
        teamId:teamid
      });
    }
  }
  const updatesubtododescription = () => {
    let socket = getSocket();
    if (!socket && userid) {
      socket = initializeSocket(userid);
    }

    if (socket) {
      socket.emit("updatesubTodoDescription", {
        teamId: teamid,
        subtodoId: subtodoid,
        newDescription: newdescription,
      });
    }
  };
  const updatesubtodopriority = () => {
    let socket = getSocket();
    if (!socket && userid) {
      socket = initializeSocket(userid);
    }

    if (socket) {
      socket.emit("updatesubTodoPriority", {
        teamId: teamid,
        subtodoId: subtodoid,
        newPriority: priority,
      });
    }
  };
  const updatesubtododeadline = () => {
    let socket = getSocket();
    if (!socket && userid) {
      socket = initializeSocket(userid);
    }

    if (socket) {
      socket.emit("updatesubTodoDeadline", {
        teamId: teamid,
        subtodoId: subtodoid,
        newDeadline: new Date(deadline),
      });
    }
  };
  const sendcomment=()=>{
    let socket = getSocket();
    if (!socket && userid) {
      socket = initializeSocket(userid);
    }
    if(comment ===''){
        toast.error("fill enter the comment")
        return ;
    }

    if (socket) {
      socket.emit("addCommentToSubTodo", {
        subtodoId: subtodoid,
        comment,
        teamId:teamid
      });
     
    }
  }
  const deletecomment=(commentId)=>{
    let socket = getSocket();
    if (!socket && userid) {
      socket = initializeSocket(userid);
    }


    if (socket) {
      socket.emit("deletesubTodoComment", {
        subtodoId: subtodoid,
        commentId:commentId,
        teamId:teamid
      });
    }
  }
  const editcomment=(commentId)=>{
    
    let socket = getSocket();
    if (!socket && userid) {
      socket = initializeSocket(userid);
    }
    if(newcomment===''){
        toast.error("fill new comment")
        return ;
    }
    if (socket) {
      socket.emit("updatesubtodocomment", {
        newcomment: newcomment,
        commentId:commentId,
        teamId:teamid
      });
    
      
    }
    
  }

const handlecommentDelete=(deletecommentid)=>{
  setsubtodocomments((precomment) => precomment.filter(comment => comment._id !== deletecommentid));
}
const handlecommentedit=(commentid,newcomment)=>{
  setsubtodocomments(precomment =>
    precomment.map(comment =>
      comment._id === commentid
        ? { ...comment, comment: newcomment } // Toggle the isCompleted status
        : comment
    )
  );
}





  return (
    <div className={`h-screen bg-slate-400 flex items-center justify-center ${itim.className} `}>
           { 
     isdeleting?<div className='fixed top-[25%] left-[40%] bg-gray-400 px-6 py-6 rounded-lg  w-[60%] md:w-[40%] z-10'>

      <div className='w-full mt-6 text-xl text-center'>
         Are you sure , you want to delete this subtodo 
      </div>
      <div className='w-full mt-6  flex justify-between items-center py-2 px-2'>
         <button className='bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50' onClick={()=>{setisdeleting(false)}}> Cancal</button>
         <button className='bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400'onClick={()=>{deleteSubTodo()}}> Delete</button>
      </div>
     </div>:<div></div>
     }
     {
      isedting?<div className='fixed top-[25%] left-[40%] bg-gray-400 px-6 py-6 rounded-lg  w-[60%] md:w-[40%] z-10'>

       <div className='w-full mt-6 text-xl'>
          <label htmlFor='description' className='font-bold'>Description:</label>
          <textarea id="description" className='bg-white rounded-lg text-black w-full py-2 px-3 outline-none focus:outline-none text-xl' onChange={(e)=>{setnewdescription(e.target.value)}} value={newdescription} placeholder='Enter the description for the subtodo '/>
       </div>
       <div className='w-full mt-6  flex justify-between items-center py-2 px-2'>
          <button className='bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50' onClick={()=>{setisediting(false)}}> Cancal</button>
          <button className='bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400'onClick={()=>{updatesubtododescription()}}> Edit Description</button>
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
          <button className='bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50' onClick={()=>{setisupdatepriority(false)}}> Cancal</button>
          <button className='bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400'onClick={()=>{updatesubtodopriority()}}> Update priority</button>
       </div>
      </div>:<div></div>
      }
        {
      isupdatedeadline?<div className='fixed top-[25%] left-[40%] bg-gray-400 px-6 py-6 rounded-lg  w-[60%] md:w-[40%] z-20'>
        <div className='text-center text-black font-bold'>
          Update the Deadline
        </div>
        <div className='flex justify-center mt-5'>
           <input
            type="date"
            className="bg-black/50 px-2 py-1 rounded-xl outline-none text-white"
            value={deadline}
            min={minDate}
            onChange={(e) => {
              setdeadline(e.target.value);
            }}
          />
          </div>
       <div className='w-full mt-6  flex justify-between items-center py-2 px-2'>
          <button className='bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50' onClick={()=>{setisupdatedeadline(false)}}> Cancal</button>
          <button className='bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400'onClick={()=>{updatesubtododeadline()}}> Update deadline</button>
       </div>
      </div>:<div></div>
    }
     {isedtingcomment ? (
        <div className="fixed top-[25%] left-[40%] bg-gray-400 px-6 py-6 rounded-lg  w-[60%] md:w-[40%] z-10">
          <div className="w-full mt-6 text-xl">
            <label htmlFor="newcomment" className="font-bold">
              New Comment:
            </label>
            <input
              id="newcomment"
              className="bg-white rounded-lg text-black w-full py-2 px-3 outline-none focus:outline-none text-xl"
              onChange={(e) => {
                setnewcomment(e.target.value);
              }}
              value={newcomment}
              placeholder="Enter the new comment for the todo "
            />
          </div>
          <div className="w-full mt-6  flex justify-between items-center py-2 px-2">
            <button
              className="bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50"
              onClick={() => {
                setiseditingcomment(false);
                setnewcomment("");
                setnewcommentid('');
              }}
            >
              {" "}
              Cancal
            </button>
            <button
              className="bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400"
              onClick={() => {
                editcomment(newcommentid);
              }}
            >
              {" "}
              Edit Comment
            </button>
          </div>
        </div>
      ) : (
        <div></div>
      )}  

   <div className='w-full h-full flex justify-center'>
   <div className='bg-white/70  rounded-2xl px-2 md:px-6 py-10 w-[95%]   h-[100%]  relative overflow-y-auto'>
   {  assignedto?._id ===userid &&(
         <div className='absolute top-2 right-4'>     
         
         <MdOutlineDelete className='text-2xl text-black/50 hover:text-black' onClick={()=>{ setisdeleting(true)}} title='Delete this Subtodo'/>
     
    </div >
   )
   }
           
           <div className='absolute top-2 left-4'>     
      
      <IoChevronBackOutline className='text-2xl text-black/50 hover:text-black'  onClick={()=>{router.back()}}/>
                  
      </div>
           <div className='w-full flex justify-between items-center'>
                  <div className='text-2xl'>Todo: {subtodotodoname}</div>
                  <div className='text-black/50 text-xl'>Deadline: {subtododeadline}</div>
           </div>
           <div className='w-full flex flex-wrap-reverse justify-between items-center py-2'>
              <div className='w-[100%] md:w-[70%] lg:w-[65%]'>
                 <div className='flex gap-3 items-center w-full'>
             <div className='w-10 h-10 rounded-full bg-gray-300 flex justify-center items-center' onClick={()=>{subtodotoogle()}}>
             {
                subtodoiscompleted?<FaCheck className="text-green-700 font-bold text-3xl"/>:<div></div>
              }
        </div>
        <div className={subtodoiscompleted?'text-3xl w-[80%] text-green-500':'text-3xl w-[80%]'}>{subtodotask}</div>
      </div>
     
     <div className=' flex justify-between items-center  w-full  mt-2'>
      <div className='text-xl text-black/50'>Description:</div>
      {  assignedto?._id ===userid &&(
                 <CiEdit className='text-2xl text-black/50 hover:text-black' onClick={()=>{ setisediting(!isedting)}} title='Update the Description'/>
               )
          }
               
     </div>
     <div className='bg-white py-3  w-full px-2 rounded-xl'>
      {subtododescription}
     </div>
    </div>
    <div className='w-[100%] md:w-[30%] lg:w-[35%]'>
      <div className='w-full p-3 flex flex-col items-center gap-3'>
        <Timer2 date={subtododeadline} />
        <div className='w-full bg-white rounded-xl py-2 px-3 flex justify-between items-center'>
          <div>Priority:{subtodopriority}</div>
          {  assignedto?._id ===userid &&(
          <CiEdit className='text-2xl text-black/50 hover:text-black' onClick={()=>{ setisupdatepriority(true)}} title='Edit the Prority'/>
        )
          }
       
                
        </div>
        <div className='w-full bg-white rounded-xl py-2 px-3 flex justify-between items-center'>
          <div>Deadline:{subtododeadline}</div>
          {  assignedto?._id ===userid &&(
                  <CiEdit className='text-2xl text-black/50 hover:text-black' onClick={()=>{ setisupdatedeadline(true)}} title='Edit the Deadline'/>
            )
          }
               
        </div>
        <div className='w-full bg-white rounded-xl py-2 px-3 flex justify-between items-center'>
          <div>AssignedTo:
                    {assignedto?._id === userid
                      ? "You"
                      : assignedto?.username}
           </div>
         
               
        </div>
      </div>
    </div>
            </div>
           <div className='w-[80%] lg:w-[60%] px-6 py-5 '>
           <div className='text-2xl  text-black/50'>Comments:</div>
           <div className='bg-black/20 w-full rounded-xl flex justify-between items-center py-2'>
           <input value={comment} onChange={(e)=>{setComment(e.target.value)}} placeholder='Comments'
        className='lg:w-[90%] text-xl w-[50%] bg-transparent px-2 text-white py-1 focus:outline-none focus:border-none'/>
           <BsFillSendFill className='text-green-600 text-4xl pr-3' onClick={()=>{ sendcomment()}}/>
           </div>
           <div className='w-full flex flex-col gap-2 mt-3'>
      {subtodocomments ? ( 
        subtodocomments.map((comment) => (
          <div key={comment._id} className="px-2 rounded-xl py-1 bg-black/10 w-full">
          <div className="flex items-center gap-2">
            
             <div className="bg-cyan-300 text-black  w-6 h-6 rounded-full flex items-center justify-center">{getcapitalLetter(comment.user)}</div>
             <div>
                  {comment.comment}
              </div>
          </div>
          <div className="flex items-center justify-between">
               <div> { comment.userid === userid?"You": comment.user }</div>
               <div className="flex gap-2 items-center text-black/60">
                 {
                  comment.userid === userid &&(
                      <MdOutlineDelete className='hover:text-black cursor-pointer' onClick={()=>{ deletecomment(comment._id)}}/>
                      
                  )

                 }
                  {
                  comment.userid === userid &&(
                      <CiEdit
                      className="text-2xl text-black/50 hover:text-black"
                      onClick={() => {
                        setiseditingcomment(true);
                        setnewcommentid(comment._id);
                        setnewcomment(comment.comment);
                      }}
                      title="Edit the comment"
                    />                        
                  )

                 }
                
               </div>
          </div>
        </div>
        ))
      ) : (
        <div>No comments available.</div>
      )}
      </div>





           </div>
       </div>

   </div>
       


    </div>
  
  )
}

export default page
