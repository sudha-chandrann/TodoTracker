"use client";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { FaCommentAlt } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { useRouter } from "next/navigation";

function UpcomingItem({
  iscompleted,
  task,
  priority,
  todoid,
  projectid,
  projectname,
}) {
    

    const router=useRouter();
    const gototodo=()=>{
      router.push(`/dashboard/${projectid}/${todoid}`)
    }

  return (
    <div className="w-full bg-black/5 rounded-2xl px-2 py-2">

      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-3  w-[70%] ">
          <div
            className="h-5 w-5 rounded-full bg-white flex justify-center items-center"
          >
            {iscompleted ? <FaCheck className="text-green-700" /> : <div></div>}
          </div>
          <div
            className={
                iscompleted
                ? "text-black/50 text-2xl line-through w-[90%] overflow-hidden"
                : "text-black text-2xl w-[90%] overflow-hidden"
            }
          >
            {task}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <CiEdit
            className="text-2xl text-black/50 hover:text-black"
            title="Edit the Todo"
            onClick={() => {
              gototodo();
            }}
          />

          <FaCommentAlt
            className="text-xl text-black/50 hover:text-black"
            title="Comment on the Todo"
            onClick={() => {
              gototodo();
            }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between  px-4">
        <div className="text-black/50 text-lg"> Project: {projectname}</div>
        <div className="text-black/50 text-lg"> Priority: {priority}</div>
      </div>
    </div>
  );
}

export default UpcomingItem;
