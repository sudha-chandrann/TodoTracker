"use client";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeMemberFromTeam, removeProjectFromTeam, removeTeam, selectTeamById } from "@/store/teamSlice";
import { MdOutlineDelete } from "react-icons/md";
import { Itim } from "next/font/google";
import { IoChevronBackOutline, IoAdd } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { getSocket, initializeSocket } from "@/socket.js";
import { addProjectToTeam,addMemberToTeam } from "@/store/teamSlice";
import { useRouter } from "next/navigation";
import axios from "axios";
import { IoRemoveCircleOutline } from "react-icons/io5"
import SearchUsers from "@/Components/Searchusers";

const itim = Itim({
  weight: ["400"],
  subsets: ["latin"],
});

function page({ params }) {
  const id = params.teamId;
  const dispatch = useDispatch();
  const [team, setTeam] = useState({});
  const teambyid = useSelector((state) => selectTeamById(state, id));
  const [isdeleting, setisdeleting] = useState(false);
  const [isAdding, setisAdding] = useState(false);
  const [isaddingmember, setisAddingMember] = useState(false);
  const userid = useSelector((state) => state.user._id);
  const [isAdmin, setisAdmin] = useState(false);

  const [search, setsearch] = useState("");
  const [newteammembers, setnewteammembers] = useState([]);
  const [searchusers, setusers] = useState([]);

  const getnewsearchusers = async () => {
    try {
      const members = team && team.members ? team.members.map((member) => member._id) : [];
      const response = await axios.post(`/api/users/getnewusers`, {
        users: members,
        search,
      });
      setusers(response.data.data.user);
    } catch (error) {
      console.log(error);
    }
  };
  const isInTeam = (id) => {
    return newteammembers.some((person) => person._id === id);
  };
  const toggleteammembers = (data) => {
    setnewteammembers((prevTeamPeople) => {
      if (prevTeamPeople.includes(data)) {
        return prevTeamPeople.filter((item) => item !== data);
      } else {
        return [...prevTeamPeople, data];
      }
    });
  };

  useEffect(() => {
    getnewsearchusers();
  }, [search, team]);

  useEffect(() => {
    setTeam(teambyid);
  }, [teambyid]);

  const [projectname, setprojectname] = useState("");
  const [projectdescription, setprojectdescription] = useState("");
  const userId = useSelector((state) => state.user._id);
  const router = useRouter();

  useEffect(() => {
    let socket;
    if (userId) {
      socket = initializeSocket(userId);
    }

      if (socket) {
      // Handle incoming search results
      socket.on("newProject", (data) => {
        if (data.success) {
          dispatch(addProjectToTeam({ teamId: id, project: data.project }));
        }
      });

      socket.on("newmember", (data) => {
        if (data.success) {
          dispatch(addMemberToTeam({ teamId: id, members: data.newMembers }));
        }
      });
      socket.on("teamRemoved", (data) => {
        if (data.success) {
          dispatch(removeTeam( data.teamId ));
          router.push('/dashboard')
        }
      });
      socket.on("userRemovedFromTeam",(data)=>{
        if(data.success){
          dispatch(removeMemberFromTeam({teamId:data.teamId,memberId:data.removedUserId}))
        }
      })
      socket.on("removedFromTeam",(data)=>{
        if(data.success){
          dispatch(removeTeam(data.teamId))
          router.push('/dashboard')
        }
      })
      socket.on("projectDeleted",(data)=>{
        if(data.success){
          dispatch(removeProjectFromTeam({teamId:data.teamId,projectId:data.projectId}))
        }
      })



      return () => {
        socket.off("newProject");
        socket.off("newmember");
        socket.off("teamRemoved");
        socket.off("userRemovedFromTeam");
        socket.off("removedFromTeam");
        socket.off("projectDeleted");
      };
    }
  }, [userId]);

  const formproject = () => {
    if (projectname.trim() === "" || projectdescription.trim() === "") return;

    let socket = getSocket();
    if (!socket && userId) {
      socket = initializeSocket(userId);
    }

    if (socket) {
      socket.emit("projectform", {
        projectname,
        projectdescription,
        teamid: id,
      });

      setprojectdescription("");
      setprojectname("");
      setisAdding("");
    }
  };

  const addnewteammember = () => {
    if (newteammembers.length === 0) return;

    let socket = getSocket();
    if (!socket && userId) {
      socket = initializeSocket(userId);
    }

    if (socket) {
     const members = newteammembers  ? newteammembers.map((member) => member._id) : [];

      socket.emit("addnewmember", {
        members,
        teamid: id,
      });

      setnewteammembers([]);
      setisAddingMember(false)
    }
  };

  const Deleteteam = () => {
    let socket = getSocket();
    if (!socket && userId) {
      socket = initializeSocket(userId);
    }

    if (socket) {
      socket.emit("deleteteam", {
        teamId: id,
      });

      setisdeleting(false)
    }
  };
  const deleteteammember = (memberid) => {
    let socket = getSocket();
    if (!socket && userId) {
      socket = initializeSocket(userId);
    }

    if (socket) {
      socket.emit("removeUserFromTeam", {
        teamId: id,
        memberId:memberid
      });
    }
  };
  const deleteproject = (projectid) => {
    let socket = getSocket();
    if (!socket && userId) {
      socket = initializeSocket(userId);
    }

    if (socket) {
      socket.emit("deleteProjectfromteam", {
        teamId: id,
        projectId:projectid
      });
    }
  };

  // const addtodo=()=>{

  // }

  

  useEffect(() => {
    if (teambyid && userid === teambyid.admin) {
      setisAdmin(true);
    } else {
      setisAdmin(false);
    }
  }, [userid, teambyid]);

  return (
    <div
      className={`h-full bg-slate-400 flex items-center justify-center ${itim.className} w-full `}
    >
      {isAdding && (
        <div className="fixed top-0 bottom-0 left-0 right-0 z-10 bg-black/60 text-white flex justify-center items-center">
          <RxCross2
            className="absolute top-4 right-0 text-white font-extrabold text-2xl hover:bg-cyan-400 p-1 rounded-full bg-cyan-300"
            onClick={() => {
              setisAdding(false);
            }}
          />
          <div className="rounded-lg bg-black p-4 w-[80%] md:w-[60%] lg:w-[30%]">
            <div className="text-lg flex justify-center items-center">
              {" "}
              Project Details
            </div>
            <div className="flex flex-col items-start w-[90%] mx-auto mt-2">
              <label htmlFor="projectname">ProjectName:</label>
              <input
                type="text"
                id="projectname"
                value={projectname}
                onChange={(e) => {
                  setprojectname(e.target.value);
                }}
                className="w-full focus:outline-none text-black rounded-lg py-1 px-2"
              />
            </div>
            <div className="flex flex-col items-start w-[90%] mx-auto mt-2">
              <label htmlFor="ProjectDescription">ProjectDescription:</label>
              <textarea
                type="text"
                id="ProjectDescription"
                value={projectdescription}
                onChange={(e) => {
                  setprojectdescription(e.target.value);
                }}
                className="w-full focus:outline-none text-black rounded-lg py-1 px-2"
              />
            </div>
            <div className="flex justify-between items-center py-1 w-[90%] mx-auto mt-4">
              <button
                className="px-2  rounded-lg bg-white text-cyan-500 hover:text-cyan-700 text-lg"
                onClick={() => {
                  setisAdding(false);
                }}
              >
                {" "}
                Cancal
              </button>
              <button
                className="px-2  rounded-lg bg-cyan-400 hover:bg-cyan-500  text-white text-lg"
                onClick={() => {
                  formproject();
                }}
              >
                {" "}
                Add Project
              </button>
            </div>
          </div>
        </div>
      )}

      {isaddingmember && (
        <div className="fixed top-0 bottom-0 left-0 right-0 z-10 bg-black/60 text-white flex justify-center items-center">
          <RxCross2
            className="absolute top-4 right-0 text-white font-extrabold text-2xl hover:bg-cyan-400 p-1 rounded-full bg-cyan-300"
            onClick={() => {
              setisAddingMember(false);
            }}
          />
          <div className="rounded-lg bg-black p-4 w-[80%] md:w-[60%] lg:w-[30%]">
            <div className="text-lg flex justify-center items-center">
              {" "}
              Add new Members
            </div>
            <h1 className="text-md text-cyan-300 w-[90%] mx-auto">New Members Added</h1>
            <div className="bg-slate-200  rounded-lg overflow-hidden mb-3 w-[90%] mx-auto">
            {newteammembers.length > 0 ? (
              newteammembers.map((user) => (
                <div
                  key={user._id}
                  className="w-full py-1 px-2 cursor-pointer hover:bg-cyan-400 text-black"
                  onClick={() => toggleteammembers(user)}
                >
                  {user.username}
                </div>
              ))
            ) : (
              <p className="py-1 px-3 text-black">No new Team Member</p>
            )}
          </div>
          <h1 className="text-md text-cyan-300 w-[90%] mx-auto">Search</h1>
            <div className="w-[90%] mx-auto">
              <input
                type="text"
                id="search"
                value={search}
                onChange={(e) => setsearch(e.target.value)}
                placeholder="Search for new  members by username or email ..."
                className="w-full focus:outline-none text-black rounded-lg py-1 px-2"
              />
            </div>
           
            <div className="bg-white/5 my-2 rounded-lg overflow-hidden w-[90%] mx-auto text-black">
              {searchusers.length > 0 ? (
                searchusers.map((user) => (
                  <SearchUsers
                    key={user._id}
                    user={user}
                    toggleteammemebrs={toggleteammembers}
                    isInTeam={isInTeam}
                    bg={'bg-white'}
                    bg2={'bg-cyan-200'}
                    className={'text-black hover:bg-cyan-300'}
                  />
                ))
              ) : (
                <p className="py-1 px-3 text-black">No users found</p>
              )}
            </div>

            <div className="flex justify-between items-center py-1 w-[90%] mx-auto mt-4">
              <button
                className="px-2  rounded-lg bg-white text-cyan-500 hover:text-cyan-700 text-lg"
                onClick={() => {
                  setisAddingMember(false);
                }}
              >
                {" "}
                Cancal
              </button>
              <button className='px-2  rounded-lg bg-cyan-400 hover:bg-cyan-500  text-white text-lg' onClick={()=>{addnewteammember()}}> Add Member</button>
            </div>
          </div>
        </div>
      )}

      {
        isdeleting &&(
                <div className="fixed top-0 bottom-0 left-0 right-0 z-10 bg-black/60 text-white flex justify-center items-center">
                  <RxCross2
                    className="absolute top-4 right-0 text-white font-extrabold text-2xl hover:bg-cyan-400 p-1 rounded-full bg-cyan-300"
                    onClick={() => {
                      setisdeleting(false);
                    }}
                  />  
                  <div className="w-[50%] md:w-[40%] lg:w-[30%] px-2 py-4 bg-black text-white flex flex-col items-center rounded-lg">
                        <div className="text-center text-lg">Are Sure You Want to Delete this Team</div>
                         <button className="bg-cyan-300 hover:bg-cyan-400 text-black rounded-lg py-1 px-2 mt-3" onClick={()=>{Deleteteam()}}>Delete</button>
                    </div>              
            </div>
        )
      }



      <div className="w-full h-full max-h-dvh ">
        <div className="bg-white/70  rounded-2xl px-6 py-10 w-[90%] lg:w-[85%]  h-[100%]  relative overflow-y-auto mx-auto">
          {isAdmin && (
            <div className="absolute top-2 right-4">
              <MdOutlineDelete
                className="text-2xl text-black/50 hover:text-black"
                onClick={() => {
                  setisdeleting(true);
                }}
                title="Delete this Project"
              />
            </div>
          )}

          <div className="absolute top-2 left-4">
            <IoChevronBackOutline
              className="text-2xl text-black/50 hover:text-black"
              onClick={() => {
                router.push("/dashboard");
              }}
            />
          </div>
          <h1 className="text-4xl font-bold">{team ? team.name : ""}</h1>
          <h3 className="text-xl font-bold text-cyan-900 mt-3">Team Members</h3>
          {isAdmin && (
            <div className="flex items-center gap-4 ">
              <IoAdd
                className="bg-black/30 text-customRed text-2xl rounded-full px-1 py-1"
                onClick={() => {
                  setisAddingMember(!isaddingmember);
                }}
              />
              <div className="text-black text-2xl">Add Members</div>
            </div>
          )}
          {team && (
            <div className="w-full rounded-lg overflow-hidden md:w-[90%] lg:w-[50%]">
              {team.members ? (
                team.members.map((member) => (
                    <div className="flex justify-between items-center py-1 px-2  bg-black/10 hover:bg-black/15 w-full" key={member._id}>
                        <div className="text-black">{member.username}</div>
                         {
                            isAdmin &&(member._id !==userId) &&(
                                <IoRemoveCircleOutline className="text-black/40 hover:text-black" title="remove Member" onClick={()=>{deleteteammember(member._id)}}/>
                            )
                         }
                          {
                             (member._id ===userId) &&(
                              <div className="py-1 px-2 bg-cyan-300 rounded-full text-black">
                                     Admin
                              </div>
                            )
                         }
                    </div>
                ))
              ) : (
                <div>No memebrs available.</div>
              )}
            </div>
          )}
          <h3 className="text-xl font-bold text-cyan-900 mt-3">
            Team Projects
          </h3>
          {isAdmin && (
            <div className="flex items-center gap-4 ">
              <IoAdd
                className="bg-black/30 text-customRed text-2xl rounded-full px-1 py-1"
                onClick={() => {
                  setisAdding(!isAdding);
                }}
              />
              <div className="text-black text-2xl">Add Project</div>
            </div>
          )}
          {team && (
            <div className="flex flex-col items-start gap-2 bg-black/5 rounded-lg overflow-hidden ">
              {team.projects ? (
                team.projects.map((project) => (
                  <div className="flex justify-between items-center py-2 px-3  bg-black/10 hover:bg-black/15 w-full rounded-lg " key={project._id}>
                        <div className="text-black cursor-pointer" onClick={()=>{router.push(`/dashboard/team/${id}/${project._id}`)}}>{project.name}</div>
                         {
                            isAdmin  &&(
                                <IoRemoveCircleOutline className="text-black/40 hover:text-black" title="remove project" 
                                onClick={()=>{deleteproject(project._id)}}
                                />
                            )
                         }
                   </div>
                ))
              ) : (
                <div>No projects available.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default page;
