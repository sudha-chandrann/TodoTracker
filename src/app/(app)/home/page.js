"use client"
import { IoBook } from "react-icons/io5";
import { FaWhiskeyGlass } from "react-icons/fa6";
import { FaStarOfLife } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { Dancing_Script} from 'next/font/google';
import { useRouter } from "next/navigation";


const dancingScript = Dancing_Script({
  weight: ['400', '700'], 
  subsets: ['latin'],     
});
export default function Home() {
  const router = useRouter();
  return (
    <>
      <div className="min-h-dvh bg-gradient-to-r from-slate-400 via-slate-500 to-slate-800 relative">
      <div className="fixed left-0 top-3 z-10 w-full">
        <nav className="w-[90%] mx-auto bg-black flex items-center rounded-full h-16  justify-between shadow-custom">
          <h1 className={`${dancingScript.className} text-white  text-2xl md:text-4xl ml-9`}>
            ToDo Tracker
          </h1>
          <div className="mr-9">
            <button
              className={`text-cyan-700 font-semibold text-2xl ${dancingScript.className} cursor-pointer`}
              onClick={() => {
                router.push("/login");
              }}
            >
              Login
            </button>
            <span className="text-white mx-3 tetx-3xl">/</span>
            <button
              className={`text-cyan-700 font-semibold text-2xl ${dancingScript.className}  cursor-pointer`}
              onClick={() => {
               router.push("/register");
              }}
            >
              Signup
            </button>
          </div>
        </nav>
      </div>
      <main className=" min-h-dvh bg-transparent w-[90%] mx-auto flex items-center justify-center flex-wrap  gap-1 lg:gap-10 ">
        <article className="w-[100%] lg:w-[50%]  mt-24 lg:mt-12">
          <h1 className="text-3xl sm:text-5xl text-white font-extrabold lg:text-7xl px-2">
            Enhance Organization and Boost Productivity
          </h1>
          <p className="text-white/65 px-2 mt-5 text-sm lg:text-xl">
            Discover an intuitive way to manage your team and personal tasks.
            Our tool helps you stay on track and achieve your goals seamlessly.
            Perfect for both teams and individuals.{" "}
          </p>
          <button
            className="bg-cyan-700 hover:bg-cyan-600 text-white font-dancing rounded-full px-1 py-1 sm:px-3 sm:py-2 ml-2 mt-4 font-semibold"
            onClick={() => {
              router.push("/register");
            }}
          >
            Get Started
          </button>
        

        </article>
        <div className="w-[100%] lg:w-[40%] flex justify-center items-center overflow-hidden rounded-3xl h-[40%] lg:h-[60%]">
          <img
            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt=""
            className="object-cover h-[80%]"
          />
        </div>
      </main>
      <section className="bg-customBlue min-h-dvh pb-9">
        <div className="min-h-dvh w-[90%] bg-transparent  mx-auto py-3">
          <div className="text-white/55 text-lg mt-28 text-center lg:text-2xl">
            Trusted and relied upon by teams and freelancers worldwide.{" "}
          </div>
          <div className="flex justify-evenly items-center flex-wrap gap-x-9 w-[80%] mx-auto text-white  mt-6 text-2xl md:text-4xl">
            <span className={`${dancingScript.className} font-semibold`}>Task</span>
            <span className={`${dancingScript.className} font-semibold`}>Todo</span>
            <span className={`${dancingScript.className} font-semibold`}>Track</span>
            <span className={`${dancingScript.className} font-semibold`}>Team</span>
            <span className={`${dancingScript.className} font-semibold`}>Focus</span>
          </div>
          <div className="flex flex-col w-[60%] items-center mt-10 mx-auto">
            <h1 className="text-4xl  font-extrabold text-center text-white">Key Features for Enhanced Productivity </h1>
            <p className="text-white/60 mt-4 text-lg">Discover features designed to boost team efficiency and transform your project management. </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 px-3 mt-11">
            <div className="flex items-center w-full justify-center flex-col bg-black/35 px-6 py-16 rounded-xl ">
              <FaStarOfLife className="bg-cyan-500 px-4 mb-2 py-2 rounded-full text-white text-7xl"/>
              <h1 className="text-2xl font-semibold text-white">
                Progress Tracking Simplified{" "}
              </h1>
              <p className="text-white/60  text-center mt-2">
                Monitor team progress with intuitive dashboards, ensuring timely
                completion of tasks.{" "}
              </p>
            </div>
            <div className="flex items-center w-full justify-center flex-col bg-black/35 px-6 py-16 rounded-xl ">
            <FaWhiskeyGlass className="bg-cyan-500 px-4 mb-2 py-2 rounded-full text-white text-7xl"/>
              <h1 className="text-2xl font-semibold text-white">
                Streamlined Task Allocation{" "}
              </h1>
              <p className="text-white/60 text-center mt-2">
                Assign tasks efficiently, ensuring each team member knows their
                responsibilities and deadlines.{" "}
              </p>
            </div>
            <div className="flex items-center w-full justify-center flex-col bg-black/35 px-6 py-16 rounded-xl ">
              <IoBook className="bg-cyan-500 px-4 mb-2 py-2 rounded-full text-white text-7xl"/>
              <h1 className="text-2xl font-semibold text-white">
                Real-Time Collaboration{" "}
              </h1>
              <p className="text-white/60 text-center mt-2">
                Collaborate with your team in real-time, ensuring everyone is on
                the same page and work progresses smoothly.{" "}
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="relative flex flex-col justify-center items-center bg-gradient-to-br from-black/65 to-black/75 h-96 overflow-hidden">
          <img src={"/pngegg.png"} alt=""
          className="h-full w-full object-cover absolute top-0 left-0 z-1" />
          <h1 className=" relative text-3xl lg:5xl text-center text-white font-extrabold">Celebrating Our Achievements and Progress</h1>
          <div className="mt-5 w-[60%] mx-auto flex justify-between items-center gap-4 relative text-white">
              <div>
                <p className=" text-3xl md:text-4xl text-cyan-600 font-extrabold">100+</p>
                <span>Users</span>
              </div>
              <div>
                <p className="text-3xl md:text-4xl text-cyan-600 font-extrabold">4.8</p>
                <span>Rating</span>
              </div>
              <div>
                <p className="text-3xl md:text-4xl text-cyan-600 font-extrabold">99%</p>
                <span>Users</span>
              </div>
          </div>
      </section>
      <section className=" bg-customBlue py-20 border-b-2 border-b-black/50">
        <div className="w-[90%] mx-auto flex justify-between items-center flex-wrap">
            <h1 className="text-5xl font-extrabold text-white  w-[60%] md:w-[45%] lg:w-[35%]">
            Join the Millions Transforming Their Productivity with Todo Tracker
            </h1>
            <div className=" text-2xl text-white font-semibold font-eduAustralia">
                <div className="w-1 h-7 bg-black rounded-t-full relative left-4 top-1"></div>
                <div className="flex gap-2"><div className="w-10 h-10 rounded-full bg-black flex justify-center items-center ">  <FaCircleCheck className="text-green-900 h-full w-full z-2 relative"/></div><h1>Signup</h1></div>
                <div className="w-1 h-12 bg-black  relative left-4 "></div>
                <div className="flex gap-2"><div className="w-10 h-10 rounded-full bg-black"></div><h1>Add Todo</h1></div>
                <div className="w-1 h-12 bg-black  relative left-4 "></div>
                <div className="flex gap-2"><div className="w-10 h-10 rounded-full bg-black"></div><h1>Track Your Work Progress</h1></div>
                
            </div>
        </div>
      </section>
      <footer className="bg-customBlue py-20">
        <div className="w-[90%] mx-auto gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <div className="w-full py-4 h-full ">
                <h1 className="text-center lg:text-left text-4xl font-extrabold   text-cyan-300 py-2">Todo Tracker</h1>
                <p className="text-center lg:text-left w-full  text-lg text-white/45">Maintain organization, enhance productivity, and accomplish your objectives.</p>
            </div>
            <div className="w-full py-2 h-full px-8 flex flex-col items-center lg:items-start ">
                <h1 className="text-lg text-semibold text-white ">Company</h1>
                <h2 className="text-white/35">About</h2>
                <h2 className="text-white/35">Team</h2>
                <h2 className="text-white/35">Blog</h2>
                <h2 className="text-white/35">Careers</h2>
            </div>
            <div className="w-full py-2 h-full px-8 flex flex-col items-center lg:items-start">
                <h1 className="text-lg text-semibold text-white ">Contact</h1>
                <h2 className="text-white/35">123 Task Ave, Suite 100, City </h2>
                <h2 className="text-white/35">1234567890 </h2>
                <h2 className="text-white/35">contact@example.com </h2>
                
            </div>
            <div className="w-full py-2 h-full px-8 flex flex-col items-center lg:items-start  ">
                <h1 className="text-lg text-semibold text-white ">Support</h1>
                <h2 className="text-white/35">Help</h2>
                <h2 className="text-white/35">Contact</h2>
                <h2 className="text-white/35">Privacy</h2>
                <h2 className="text-white/35">Terms</h2>
            </div>
        </div>
      </footer>
      </div>
    </>
  );
}
