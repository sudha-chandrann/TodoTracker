"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Itim } from "next/font/google";
import { getSocket, initializeSocket } from "@/socket.js";
import { useSelector ,useDispatch} from "react-redux";
import axios from "axios";
import SearchUsers from "@/Components/Searchusers";
import { addTeam } from "@/store/teamSlice";

const itim = Itim({
  weight: ["400"],
  subsets: ["latin"],
});

function Page() {
  const [teamname, setteamname] = useState("");
  const router = useRouter();
  const userId = useSelector((state) => state.user._id);
  const [search, setsearch] = useState("");
  const [searchusers, setsearchusers] = useState("");
  const [teammembers, setteammembers] = useState([]);
  const dispatch=useDispatch();


  const toggleteammembers = (data) => {
    setteammembers((prevTeamPeople) => {
      if (prevTeamPeople.includes(data)) {
        return prevTeamPeople.filter((item) => item !== data);
      } else {
        return [...prevTeamPeople, data];
      }
    });
  };

  const isInTeam = (id) => {
    return teammembers.some((person) => person._id === id);
  };

  const getsearchusers = async () => {
    try {
      const response = await axios.post("/api/users/getsearchusers", { search });
      setsearchusers(response.data.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getsearchusers();
  }, [search]);

  useEffect(() => {
    let socket;
    if (userId) {
      socket = initializeSocket(userId);
    }

    if (socket) {
      // Handle incoming search results
      socket.on("newTeam", (data) => {
        dispatch(addTeam(data.team))
        router.push(`/dashboard/team/${data.team._id}`)
      });

      return () => {
        socket.off("newTeam");
      };
    }
  }, [userId]);
  
  const formteam = () => {
    if (teamname.trim() === '') return;

    let socket = getSocket();
    if (!socket && userId) {
      socket = initializeSocket(userId);
    }

    if (socket) {
      const teamMemberIds = teammembers.map(member => member._id);
      socket.emit("teamform", { teamname,members: [userId, ...teamMemberIds]});
      setteamname(''); 
      setteammembers([]);
      setsearch('')// Clear the input field after sending
    }
  };


  return (
    <div
      className={`h-full w-full bg-slate-400 flex items-center justify-center ${itim.className}`}
    >
      <div className="bg-white/70  rounded-2xl px-6 py-10 w-[80%] md:w-[60%] lg:w-[50%] ">
        <div className="w-full">
          <label htmlFor="name" className="font-bold text-xl">
            Team Name :
          </label>
          <input
            id="name"
            className="bg-black/10 rounded-lg text-black w-full py-2 px-3 outline-none focus:outline-none text-xl"
            onChange={(e) => {
              setteamname(e.target.value);
            }}
            value={teamname}
            placeholder="Enter the name for the Team "
          />

          <div className="bg-cyan-300 my-2 rounded-lg overflow-hidden">
            {teammembers.length > 0 ? (
              teammembers.map((user) => (
                <div
                  key={user._id}
                  className="w-full py-1 px-2 cursor-pointer hover:bg-cyan-400"
                  onClick={() => toggleteammembers(user)}
                >
                  {user.username}
                </div>
              ))
            ) : (
              <p className="py-1 px-3 text-black">No Team Member</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="search" className="font-bold text-xl">
            Search Users:
          </label>
          <input
            id="search"
            className="bg-black/10 rounded-lg text-black w-full py-2 px-3 outline-none focus:outline-none text-xl"
            type="text"
            value={search}
            onChange={(e) => {
              setsearch(e.target.value);
            }}
          />
          <div className="bg-black/5 my-2 rounded-lg overflow-hidden">
            {searchusers.length > 0 ? (
              searchusers.map((user) => (
                 <SearchUsers
                  key={user._id}
                  user={user}
                  toggleteammemebrs={toggleteammembers}
                  isInTeam={isInTeam}
                  bg={'bg-slate-100'}
                  bg2={'bg-slate-200'}
                  className={'text-black hover:bg-slate-300'}
                />
              ))
            ) : (
              <p className="py-1 px-3 text-black">No users found</p>
            )}
          </div>
        </div>

        <div className="w-full mt-6  flex justify-between items-center py-2 px-2">
          <button
            className="bg-black/5 px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-black/10"
            onClick={() => {
              router.back();
            }}
          >
            Cancel
          </button>
          <button
            className="bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400"
            onClick={() => { formteam() }}
          >
            Add Team
          </button>
        </div>
      </div>
    </div>
  );
}

export default Page;
