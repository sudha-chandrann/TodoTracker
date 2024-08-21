"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaInbox } from "react-icons/fa6";
import { IoCalendarNumber } from "react-icons/io5";
import { IoCalendar } from "react-icons/io5";
import { TbFilters } from "react-icons/tb";
import { GoPlus } from "react-icons/go";
import { FaAngleDown } from "react-icons/fa6";
import Link from "next/link";
import { usePathname } from "next/navigation";
import axios from "axios";
import { BiLogOutCircle } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { login, logout as Authlogout } from "@/store/userSlice";
import Avatar from "./Avatar";

function Sidebar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (name) =>
    pathname.startsWith(name) && pathname.endsWith(name);
  const username = useSelector((state) => state.user.username);
  const projects = useSelector((state) => state.user.projects);
  const getuser = async () => {
    try {
      const response = await axios.get("/api/users/currentuser");
      if (response.data.success) {
        // console.log(response.data.data.user)
        dispatch(login(response.data.data.user));
      }
    } catch (error) {
      console.log(error);
    }
  };
  const logout = async () => {
    try {
      const response = await axios.get("/api/users/logout");
      if (response.data.success) {
        dispatch(Authlogout());
        router.push("/login");
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getuser();
  }, []);

  return (
    <div className="w-full h-full overflow-y-auto bg-white">
      <div className="py-3 px-6 flex justify-between items-center border-b-2 border-black/10">
        <Link href={"/dashboard/Users"} className="flex items-center gap-2">
          <Avatar name={username} />
          <div>{username}</div>
        </Link>
        <BiLogOutCircle className="text-customRed text-xl" onClick={logout} />
      </div>
      <nav className="w-full  border-b-2 border-black/20">
        <Link
          href="/dashboard/inbox"
          className={
            isActive("/dashboard/inbox")
              ? "flex text-customRed px-7 py-2 items-center bg-cyan-200"
              : "py-2 hover:bg-slate-300 flex px-7 text-black/50 hover:text-black"
          }
        >
          <FaInbox className="text-2xl" />
          <div className="ml-2 font-semibold">Inbox</div>
        </Link>
        <Link
          href="/dashboard"
          className={
            isActive("/dashboard/today")
              ? "flex text-customRed px-7 py-2 items-center bg-gray-50"
              : "py-2 hover:bg-slate-300 flex px-7 text-black/50 hover:text-black"
          }
        >
          <IoCalendarNumber className="text-2xl" />
          <div className="ml-2 font-semibold">Today</div>
        </Link>
        <Link
          href="/dashboard/filters"
          className={
            isActive("/dashboard/upcoming")
              ? "flex text-customRed px-7 py-2 items-center bg-cyan-200"
              : "py-2 hover:bg-slate-300 flex px-7 text-black/50 hover:text-black"
          }
        >
          <IoCalendar className="text-2xl" />
          <div className="ml-2 font-semibold">Upcoming</div>
        </Link>
        <Link
          href="/dashboard/filters"
          className={
            isActive("/dashboard/filters")
              ? "flex text-customRed px-7 py-2 items-center bg-cyan-200"
              : "py-2 hover:bg-slate-300 flex px-7 text-black/50 hover:text-black"
          }
        >
          <TbFilters className="text-2xl" />
          <div className="ml-2 font-semibold">Filters</div>
        </Link>
      </nav>
      <div className="py-3">
        <div className="flex pb-2 items-center px-6 justify-between">
          <div className="flex items-center">
            <Avatar name={username} height={5} width={5} />
            <div className="ml-3 text-lg font-semibold text-black/70">
              My projects
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GoPlus
              className="text-2xl text-customRed hover:text-black"
              onClick={() => {
                router.push("/dashboard/Addproject");
              }}
            />
            <FaAngleDown className="text-xl text-black/75 hover:text-black" />
          </div>
        </div>
        <nav className="">
          {projects?.map((project) => (
            <div
              key={project._id}
              className={
                isActive(`/dashboard/${project._id}`)
                  ? "flex px-7 py-1 text-black bg-gray-50 text-2xl gap-2 items-center  cursor-pointer"
                  : "flex px-7 py-1 text-black/50 hover:text-black hover:bg-slate-300 text-2xl gap-2 items-center  cursor-pointer"
              }
              onClick={() => router.push(`/dashboard/${project._id}`)}
            >
              #{" "}
              <span className="text-lg whitespace-nowrap overflow-x-hidden">
                {project.name}
              </span>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
