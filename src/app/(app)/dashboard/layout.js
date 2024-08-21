"use client"; 

import { Provider } from "react-redux";
import store from "@/store/store";
import { useRouter } from "next/navigation";
import Sidebar from "@/Components/Sidebar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard";
  return (
    <Provider store={store}>
      <div className="grid lg:grid-cols-[350px,1fr] md:grid-cols-[290px,1fr] h-dvh max-h-dvh bg-slate-100 text-black ">
        <section
          className={`bg-white ${isDashboard ? "block" : "hidden"} md:block h-full w-full `}
        >
          <Sidebar />
        </section>
        <section className={`${isDashboard ? "hidden" : "block"}`}>
          {children}
        </section>
        <section className={`${isDashboard ? "md:flex" : "hidden"} hidden justify-center items-center  flex-col`}>
        <img src={"/TODOTRACKER.png"} alt="" className="w-[70%] lg:w-[60%]"/>
        <img src={"/Union.png"} alt="" className="w-[70%] lg:w-[60%]"/>
        </section>
       
      </div>
    </Provider>
  );
}
