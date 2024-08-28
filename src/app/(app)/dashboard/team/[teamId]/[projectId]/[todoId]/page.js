"use client";
import axios from "axios";
import { Itim } from "next/font/google";
import React, { useEffect, useState } from "react";
import { IoAdd } from "react-icons/io5";
import { FaCommentAlt, FaFlag } from "react-icons/fa";
import { Menu } from "@headlessui/react";
import { FaCheck } from "react-icons/fa6";
import { BsFillSendFill } from "react-icons/bs";
import toast from "react-hot-toast";
import { CiEdit } from "react-icons/ci";
import { MdOutlineDelete } from "react-icons/md";

import { IoChevronBackOutline } from "react-icons/io5";
import Timer2 from "@/Components/Timer2";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { getSocket, initializeSocket } from "@/socket.js";

import { selectTeamById } from "@/store/teamSlice";
import { getcapitalLetter, GetstringDate } from "@/helper/getstringdate";

const itim = Itim({
  weight: ["400"],
  subsets: ["latin"],
});
function page({ params }) {
  const teamid = params.teamId;
  const todoid = params.todoId;
  const projectId = params.projectId;

  const [isAdding, setisAdding] = useState(false);
  const [isedting, setisediting] = useState(false);
  const [isdeleting, setisdeleting] = useState(false);
  const [isupdatepriority, setisupdatepriority] = useState(false);
  const [isupdatedeadline, setisupdatedeadline] = useState(false);
  const [isupdateingassignedto, setisupdatingassignedto] = useState(false);
  const [isedtingcomment,setiseditingcomment]=useState(false);
  const [newcommentid,setnewcommentid]=useState('')

  const [todoprojectname, settodoprojectname] = useState("");
  const [tododeadline, settododeadline] = useState("");
  const [todotask, settodotask] = useState("");
  const [iscompleted, setiscompleted] = useState(false);
  const [tododescription, settododescription] = useState("");
  const [todoassignedto, settodoassignedto] = useState("");
  const [todoSubtodos, settodosubtodos] = useState([]);
  const [todoComments, settodocomments] = useState([]);
  const [todopriority, settodopriority] = useState("");

  const [newpriority, setnewpriority] = useState("");
  const [newdeadline, setnewdeadline] = useState("");
  const [newdescription, setnewdescription] = useState("");
  const [newtodoassignedto, setnewtodoassignedto] = useState("");

  const [subtodotask, setsubtodotask] = useState("");
  const [subtododescription, setsubtododescription] = useState("");
  const [subtododeadline, setsubtododeadline] = useState(new Date());
  const [subtodopriority, setsubtodopriority] = useState("3");
  const [prioritylevel, setprioritylevel] = useState("Select Priority");
  const [minDate, setMinDate] = useState("");
  const [assignedtolevel, setassignedtolevel] = useState("Assigned To");


  const [comment, setComment] = useState("");
  const [newcomment,setnewcomment]=useState("");
  const [isAdmin, setisAdmin] = useState(false);
  const userid = useSelector((state) => state.user._id);
  const router = useRouter();
  const [assignedoptions, setassignedoptions] = useState([]);
  const teambyid = useSelector((state) => selectTeamById(state, teamid));

  useEffect(() => {
    if (teambyid && userid === teambyid.admin) {
      setisAdmin(true);
    } else {
      setisAdmin(false);
    }
    if (teambyid) {
      setassignedoptions(teambyid.members);
    }
  }, [userid, teambyid]);

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
 


  useEffect(() => {
    if (todoid && projectId) {
      getTodo();
    }
  }, [todoid, projectId]);
  const getTodo = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}/${todoid}`);
      if (response.data.success) {
        const data = response.data.data.todo;
        settodosubtodos(data.subtodos);
        settodoprojectname(data.project);
        settodotask(data.task);
        settododescription(data.description);
        setnewdescription(data.description);
        const deadlinedate = new Date(data.deadline);
        settododeadline(deadlinedate.toDateString());
        setiscompleted(data.iscompleted);
        settodocomments(data.comments);
        settodopriority(data.priority);
        setnewpriority(data.priority);
        setnewdeadline(data.deadlinedate);
        settodoassignedto(data.assignedto[0]);
      }
    } catch (error) {
      console.log(error.message);
    }
  };


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
      socket.on("todoDeleted", (data) => {
        if (data.success) {
          router.back();
        }
      });
      socket.on("todoCompletionToggled", (data) => {
        if (data.success) {
          setiscompleted(data.iscompleted);
        }
      });
      socket.on("todoDescriptionUpdated", (data) => {
        if (data.success) {
          settododescription(data.newDescription);
          setisediting(false);
        }
      });
      socket.on("todoPriorityUpdated", (data) => {
        if (data.success) {
          settodopriority(data.newPriority);
          setisupdatepriority(false);
          setprioritylevel("Select Priority");
          setnewpriority("3");
        }
      });
      socket.on("updateTodoDeadlineSuccess", (data) => {
        if (data.success) {
          setnewdeadline(new Date());
          const deadlinedate = new Date(data.newDeadline);
          settododeadline(deadlinedate.toDateString());
          setisupdatedeadline(false);
        }
      });
      socket.on("updateAssignedToSuccess", (data) => {
        if (data.success) {
          settodoassignedto(data.newAssignedTo);
          setisupdatingassignedto(false);
          setassignedtolevel("Assigned To");
          setnewtodoassignedto("");
        }
      });
      socket.on("subtodoAdded", (data) => {
        if (data.success) {
            
            settodosubtodos((prev)=>[...prev,data.subtodo])
           setsubtododeadline(new Date());
           setsubtododescription('');
           setsubtodopriority('3');
           setsubtodotask('');
           setprioritylevel('Select the Priority')
           setisAdding(false)
        }
      });
      socket.on("subtodoCompletionToggled", (data) => {
        if (data.success) {
            handlesubtodotoogle(data.subtodoId, data.iscompleted);
        }
      });
      socket.on("subtodoDeleted", (data) => {
        if (data.success) {
            handlesubTodoDelete(data.subtodoId);
        }
      });
      socket.on("commenttodoAdded", (data) => {
        if (data.success) {
            settodocomments((prev)=>[...prev,data.comment])
            setComment('')
        }
      });
      socket.on("commenttodoDeleted", (data) => {
        if (data.success) {
            handlecommentDelete(data.commentId)
        }
      });
      socket.on("updatedtodocomment", (data) => {
        if (data.success) {
            handlecommentedit(data.commentId,data.comment)
            setnewcomment('')
            setiseditingcomment(false)
            setnewcommentid('')
        }
      });

      return () => {
        socket.off("todoDeleted");
        socket.off("error");
        socket.off("todoCompletionToggled");
        socket.off("todoDescriptionUpdated");
        socket.off("todoPriorityUpdated");
        socket.off("updateTodoDeadlineSuccess");
        socket.off("updateAssignedToSuccess");
        socket.off("subtodoAdded");
        socket.off("subtodoCompletionToggled");
        socket.off("subtodoDeleted");
        socket.off("commenttodoAdded");
        socket.off("commenttodoDeleted");
        socket.off("updatedtodocomment");
      };
    }
  }, [userid]);

  const deleteTodo = () => {
    let socket = getSocket();
    if (!socket && userid) {
      socket = initializeSocket(userid);
    }

    if (socket) {
      socket.emit("deleteTodoFromProject", {
        teamId: teamid,
        todoId: todoid,
        projectId: projectId,
      });
    }
  };
  const toogletodocomplete = () => {
    let socket = getSocket();
    if (!socket && userid) {
      socket = initializeSocket(userid);
    }

    if (socket) {
      socket.emit("toggleTodoCompletion", {
        teamId: teamid,
        todoId: todoid,
      });
    }
  };
  const updatetododescription = () => {
    let socket = getSocket();
    if (!socket && userid) {
      socket = initializeSocket(userid);
    }

    if (socket) {
      socket.emit("updateTodoDescription", {
        teamId: teamid,
        todoId: todoid,
        newDescription: newdescription,
      });
    }
  };
  const updatetodopriority = () => {
    let socket = getSocket();
    if (!socket && userid) {
      socket = initializeSocket(userid);
    }

    if (socket) {
      socket.emit("updateTodoPriority", {
        teamId: teamid,
        todoId: todoid,
        newPriority: newpriority,
      });
    }
  };
  const updatetododeadline = () => {
    let socket = getSocket();
    if (!socket && userid) {
      socket = initializeSocket(userid);
    }

    if (socket) {
      socket.emit("updateTodoDeadline", {
        teamId: teamid,
        todoId: todoid,
        newDeadline: newdeadline,
      });
    }
  };
  const updatetodoassigni = () => {
    let socket = getSocket();
    if (!socket && userid) {
      socket = initializeSocket(userid);
    }

    if (socket) {
      socket.emit("updateTodoAssignedTo", {
        teamId: teamid,
        todoId: todoid,
        newAssignedTo: newtodoassignedto,
      });
    }
  };
  const addsubtodo = () => {
    let socket = getSocket();
    if (!socket && userid) {
      socket = initializeSocket(userid);
    }
    if(subtodotask===''||subtododescription===''){
        toast.error("fill all the fields")
        return ;
    }

    if (socket) {
      socket.emit("addSubtodo", {
        teamId: teamid,
        todoId: todoid,
        task:subtodotask,
        description:subtododescription,
        priority:subtodopriority,
        deadline:subtododeadline
      });
    }
  };
  const subtodotoogle = (subtodoId) => {
    let socket = getSocket();
    if (!socket && userid) {
      socket = initializeSocket(userid);
    }

    if (socket) {
      socket.emit("toggleSubTodoCompletion", {
        teamId: teamid,
        subtodoId: subtodoId,
      });
    }
  };
  const deleteSubTodo=(subtodoId)=>{
    let socket = getSocket();
    if (!socket && userid) {
      socket = initializeSocket(userid);
    }

    if (socket) {
      socket.emit("deleteSubTodo", {
        todoId: todoid,
        SubtodoId: subtodoId,
        teamId:teamid
      });
    }
  }
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
      socket.emit("addCommentToTodo", {
        todoId: todoid,
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
      socket.emit("deleteTodoComment", {
        todoId: todoid,
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
      socket.emit("updatetodocomment", {
        newcomment: newcomment,
        commentId:commentId,
        teamId:teamid
      });
    }
    
  }

  return (
    <div
      className={`h-screen bg-slate-400 flex items-center justify-center ${itim.className} `}
    >
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
      {isedting ? (
        <div className="fixed top-[25%] left-[40%] bg-gray-400 px-6 py-6 rounded-lg  w-[60%] md:w-[40%] z-10">
          <div className="w-full mt-6 text-xl">
            <label htmlFor="description" className="font-bold">
              Description:
            </label>
            <textarea
              id="description"
              className="bg-white rounded-lg text-black w-full py-2 px-3 outline-none focus:outline-none text-xl"
              onChange={(e) => {
                setnewdescription(e.target.value);
              }}
              value={newdescription}
              placeholder="Enter the description for the todo "
            />
          </div>
          <div className="w-full mt-6  flex justify-between items-center py-2 px-2">
            <button
              className="bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50"
              onClick={() => {
                setisediting(false);
              }}
            >
              {" "}
              Cancal
            </button>
            <button
              className="bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400"
              onClick={() => {
                updatetododescription();
              }}
            >
              {" "}
              Edit Description
            </button>
          </div>
        </div>
      ) : (
        <div></div>
      )}

      {isdeleting ? (
        <div className="fixed top-[25%] left-[40%] bg-gray-400 px-6 py-6 rounded-lg  w-[60%] md:w-[40%] z-10">
          <div className="w-full mt-6 text-xl text-center">
            Are you sure , you want to delete this todo
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
              onClick={() => {
                deleteTodo();
              }}
            >
              {" "}
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div></div>
      )}

      {isupdatepriority ? (
        <div className="fixed top-[25%] left-[40%] bg-gray-400 px-6 py-6 rounded-lg  w-[60%] md:w-[40%] z-10">
          <div className="text-center text-black font-bold">
            Update the Priority
          </div>
          <div className="flex justify-center mt-5">
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
                              setnewpriority(option.value);
                              setprioritylevel(option.label);
                            }}
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
          <div className="w-full mt-6  flex justify-between items-center py-2 px-2">
            <button
              className="bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50"
              onClick={() => {
                setprioritylevel("Select priority");
                setnewpriority("3");
                setisupdatepriority(false);
              }}
            >
              {" "}
              Cancal
            </button>
            <button
              className="bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400"
              onClick={() => {
                updatetodopriority();
              }}
            >
              {" "}
              Update priority
            </button>
          </div>
        </div>
      ) : (
        <div></div>
      )}
      {isupdatedeadline ? (
        <div className="fixed top-[25%] left-[40%] bg-gray-400 px-6 py-6 rounded-lg  w-[60%] md:w-[40%] z-30">
          <div className="text-center text-black font-bold">
            Update the Deadline
          </div>
          <div className="flex justify-center mt-5">
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
          <div className="w-full mt-6  flex justify-between items-center py-2 px-2">
            <button
              className="bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50"
              onClick={() => {
                setisupdatedeadline(false);
              }}
            >
              {" "}
              Cancal
            </button>
            <button
              className="bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400"
              onClick={() => {
                updatetododeadline();
              }}
            >
              {" "}
              Update Deadline
            </button>
          </div>
        </div>
      ) : (
        <div></div>
      )}
      {isupdateingassignedto ? (
        <div className="fixed top-[25%] left-[40%] bg-gray-400 px-6 py-6 rounded-lg  w-[60%] md:w-[40%] z-10">
          <div className="text-center text-black font-bold">
            Update the AssigneTo
          </div>
          <div className="flex justify-center mt-5">
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
                              if (option._id === userid) {
                                setassignedtolevel("Me");
                              } else {
                                setassignedtolevel(option.username);
                              }
                              setnewtodoassignedto(option._id);
                            }}
                            className={`group flex items-center w-full px-2 py-2 text-sm ${
                              active
                                ? "bg-black/60 text-white"
                                : "text-gray-900"
                            }`}
                          >
                            {option._id === userid ? "Me" : option.username}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Menu>
            </div>
          </div>
          <div className="w-full mt-6  flex justify-between items-center py-2 px-2">
            <button
              className="bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50"
              onClick={() => {
                setassignedtolevel("AssignedTo");
                setnewtodoassignedto("");
                setisupdatingassignedto(false);
              }}
            >
              {" "}
              Cancal
            </button>
            <button
              className="bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400"
              onClick={() => {
                updatetodoassigni();
              }}
            >
              {" "}
              Update AssignedTo
            </button>
          </div>
        </div>
      ) : (
        <div></div>
      )}
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

      <div className="h-full w-full max-h-dvh flex justify-center">
        <div className="bg-white/70  rounded-2xl px-2 md:px-6 py-10 w-[95%]   h-[100%]  relative overflow-y-auto">
          {isAdmin && (
            <div className="absolute top-2 right-4">
              <MdOutlineDelete
                className="text-2xl text-black/50 hover:text-black"
                onClick={() => {
                  setisdeleting(true);
                }}
                title="Delete this Todo"
              />
            </div>
          )}
          <div className="absolute top-2 left-4">
            <IoChevronBackOutline
              className="text-2xl text-black/50 hover:text-black"
              onClick={() => {
                router.back();
              }}
            />
          </div>
          <div className="w-full flex justify-between items-center">
            <div className="text-2xl">Project: {todoprojectname}</div>
            <div className="text-black/50 text-xl">Deadline:{tododeadline}</div>
          </div>
          <div className="w-full flex flex-wrap-reverse justify-between items-center py-2">
            <div className="w-[100%] md:w-[70%] lg:w-[65%]">
              <div className="flex gap-3 items-center w-full">
                <div
                  className="w-10 h-10 rounded-full bg-gray-300 flex justify-center items-center"
                  onClick={() => {
                    toogletodocomplete();
                  }}
                >
                  {iscompleted ? (
                    <FaCheck className="text-green-700 font-bold text-3xl" />
                  ) : (
                    <div></div>
                  )}
                </div>
                <div
                  className={
                    iscompleted
                      ? "text-3xl w-[80%] text-green-500"
                      : "text-3xl w-[80%]"
                  }
                >
                  {todotask}
                </div>
              </div>

              <div className=" flex justify-between items-center  w-full  mt-2">
                <div className="text-xl text-black/50">Description:</div>
                {isAdmin && (
                  <CiEdit
                    className="text-2xl text-black/50 hover:text-black"
                    onClick={() => {
                      setisediting(!isedting);
                    }}
                    title="Edit the Description"
                  />
                )}
              </div>
              <div className="bg-white py-3  w-full px-2 rounded-xl">
                {tododescription}
              </div>
            </div>
            <div className="w-[100%] md:w-[30%] lg:w-[35%]">
              <div className="w-full p-3 flex flex-col items-center gap-3">
                <Timer2 date={tododeadline} />
                <div className="w-full bg-white rounded-xl py-2 px-3 flex justify-between items-center">
                  <div>Priority:{todopriority}</div>
                  {isAdmin && (
                    <CiEdit
                      className="text-2xl text-black/50 hover:text-black"
                      onClick={() => {
                        setisupdatepriority(true);
                      }}
                      title="Edit the Priority"
                    />
                  )}
                </div>
                <div className="w-full bg-white rounded-xl py-2 px-3 flex justify-between items-center">
                  <div>Deadline:{tododeadline}</div>
                  {isAdmin && (
                    <CiEdit
                      className="text-2xl text-black/50 hover:text-black"
                      onClick={() => {
                        setisupdatedeadline(true);
                      }}
                      title="Edit the Deadline"
                    />
                  )}
                </div>
                <div className="w-full bg-white rounded-xl py-2 px-3 flex justify-between items-center">
                  <div>
                    AssignedTo:
                    {todoassignedto?._id === userid
                      ? "You"
                      : todoassignedto?.username}
                  </div>
                  {isAdmin && (
                    <CiEdit
                      className="text-2xl text-black/50 hover:text-black"
                      onClick={() => {
                        setisupdatingassignedto(true);
                      }}
                      title="Edit the AssignedTo"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex flex-wrap justify-between  py-2 mt-5">
            <div className="w-[full] lg:w-[65%]">
              {(todoassignedto?._id === userid)&&(!iscompleted) ? (
                <div className="w-full flex gap-4 items-center">
                  <IoAdd
                    className="bg-black/30 text-customRed text-4xl rounded-full px-1 py-1"
                    onClick={() => {
                      setisAdding(!isAdding);
                    }}
                  />
                  <div className="text-black text-2xl">Add SubTodo</div>
                </div>
              ):(
                <div className="text-black text-2xl"> SubTodo</div>
              )}

              <div className="w-full py-2 flex flex-col gap-5">
                {todoSubtodos ? (
        todoSubtodos.map((subtodo) => (
         <div key={subtodo._id} className="w-full px-2 py-1 bg-black/10 rounded-xl">
             <div className='w-full  flex items-center justify-between'>
        <div className='text-black/60 flex flex-col items-start justify-between'>
           <div className='flex items-center gap-2'>
            <div
            className="h-5 w-5 rounded-full bg-white flex justify-center items-center"
            onClick={() => {
                subtodotoogle(subtodo._id);
            }}
          >
            {subtodo.iscompleted ? <FaCheck className="text-green-700" /> : <div></div>}
          </div>
            <div className={`text-lg  cursor-pointer ${subtodo.iscompleted?'text-green-600':'text-black'}`}>{subtodo.task}</div>
             
             </div>
           <div className='hover:text-black cursor-pointer'> Deadline : {GetstringDate(subtodo.deadline)}</div>
        </div>
        <div  className='flex flex-col items-end  text-black/60'>
           <div className='hover:text-black cursor-pointer'> AssignedTo: {
            todoassignedto?._id ===userid ?'You':todoassignedto?.username
           }</div>
           <div className='hover:text-black cursor-pointer'> Priority : {subtodo.priority}</div>
        </div>
             </div>
             <div className='flex items-center justify-end'>
          <div className='flex items-center gap-2 text-black/60 text-lg'>
            <CiEdit  className='hover:text-black cursor-pointer' onClick={()=>{router.push(`/dashboard/team/${teamid}/${projectId}/${todoid}/${subtodo._id}`)}}/>
            <FaCommentAlt className='hover:text-black cursor-pointer' onClick={()=>{router.push(`/dashboard/team/${teamid}/${projectId}/${todoid}/${subtodo._id}`)}}/>
              {
                todoassignedto?._id === userid &&(
                  <MdOutlineDelete className='hover:text-black cursor-pointer' onClick={()=>{ deleteSubTodo(subtodo._id)}}/>
                )
              }
            
          </div>
        </div>
         </div>
        ))
      ) : (
        <div>No subtodos available.</div>
      )}
              </div>
            </div>
            <div className="w-full lg:w-[35%]  px-2 py-2 flex flex-col ">
              <div className="text-2xl  text-black/50">Comments:</div>
              <div className="bg-black/20 w-full rounded-xl flex justify-between items-center py-2">
                <input
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                  }}
                  placeholder="Comments"
                  className="lg:w-[90%] text-xl w-[50%] bg-transparent px-2 text-white py-1 focus:outline-none focus:border-none"
                />
                <BsFillSendFill
                  className="text-green-600 text-4xl pr-3"
                  onClick={() => {
                    sendcomment();
                  }}
                />
              </div>
              <div className="w-full flex flex-col gap-2 mt-3">
                {todoComments ? ( 
        todoComments.map((comment) => (
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
    </div>
  );
}

export default page;
