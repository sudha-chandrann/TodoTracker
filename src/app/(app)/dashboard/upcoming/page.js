"use client";
import React, { useEffect, useState } from "react";
import { Itim } from "next/font/google";
import { IoAdd } from "react-icons/io5";
import { FaFlag } from "react-icons/fa";
const itim = Itim({
  weight: ["400"],
  subsets: ["latin"],
});
import toast from "react-hot-toast";
import axios from "axios";

import UpcomingItem from "@/Components/upcomingItem";
function page() {
  const [todos, settodos] = useState([]);
 const [tododate,settododate]=useState(new Date());
 const [datestring,setdatestring]=useState('');
 const [isdue,setisdue]=useState(false);
 const [count,setcount]=useState(0);


  const gettodos = async () => {
    try {
      const response = await axios.post(`/api/users/gettodos`,{
        date:tododate
      });
      if (response.data.success) {
        settodos(response.data.data.todayTodos);
        setcount(response.data.data.count)
      }
    } catch (error) {
      console.log(error);
    }
  };

    useEffect(()=>{
      const newdate=new Date(tododate)  
      newdate.setHours(23, 59, 59, 999);
      const todaydate=new Date();
      todaydate.setHours(23, 59, 59, 999);
      if(todaydate>newdate){
        setisdue(true)
      }

      setdatestring(newdate.toDateString())
      gettodos();
    },[tododate])

  return (
    <div
      className={`h-full bg-slate-400 flex items-center justify-center ${itim.className} w-full `}
    >
      <div className="w-[100%] h-dvh overflow-y-auto md:w-[90%] bg-white/70 lg:w-[75%] rounded-2xl pt-6 px-7">
        <div className="w-full flex  py-2  items-center">
          <div className="text-black text-4xl font-extrabold  w-[40%]">
            Upcoming
          </div>
        </div>
        <div className="flex justify-between py-2 items-center">
          <input
            type="date"
            className="bg-black/50 px-2 py-1 rounded-xl outline-none text-white"
            value={tododate}
            onChange={(e) => {
              settododate(e.target.value);
            }}
          />

          <div className="py-1 px-2 rounded-xl bg-white text-black">{datestring}</div>
        </div>

        <div>
            {
                isdue?`the no of Due Todo is ${count}`:`the no Todo is ${count}`
            }
        </div>

        <div className="w-full flex flex-col gap-5 py-2">
          {todos ? (
            todos.map((todo) => (
              <UpcomingItem
                key={todo._id}
                task={todo.task}
                iscompleted={todo.iscompleted}
                todoid={todo._id}
                priority={todo.priority}
                projectname={todo.projectname}
                projectid={todo.project}
              />
            ))
          ) : (
            <div className="text-black">No todos available.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default page;
