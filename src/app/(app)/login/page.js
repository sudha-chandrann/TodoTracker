'use client'
import React, { useRef } from 'react'
import { useState } from 'react'
import toast from "react-hot-toast"
import axios from 'axios'
import { FaEyeSlash ,FaEye} from "react-icons/fa";
import { Dancing_Script} from 'next/font/google';
import { useRouter } from "next/navigation";

const dancingScript = Dancing_Script({
  weight: ['400', '700'], 
  subsets: ['latin'],     
});
function Login() {
    const navigate=useRouter();
    const passRef=useRef();
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

    const  handlelogincredentials=()=>{
      if((!username && !email)|| !password ){
        toast.error("Please fill all the fields");
        return false;
      }
      return true;

   }
   const  handlelogin=async(event)=>{
        event.preventDefault()
        if(handlelogincredentials()){
          try{
            const response=await axios.post('/api/users/login',{
              username,email,password
             })
             
             if(response.data.success){
              toast.success(response.data.message);
              navigate.push('/dashboard');
             }
            else{
              toast.error(response.data.message);
            }

            
          }
          catch(error){
            console.log(error)
          }
          finally{
            setEmail("")
            setPassword("");
            setUsername("");

          }
         
        }

   }


  return (
    <main className='h-dvh w-vw bg-gradient-to-br from-black/100 to-gray-800 flex justify-center items-center'>
       
         <div className=' w-[90%] h-fit bg-black/5 md:w-[60%] lg:w-[40%] shadow-custom rounded-xl backdrop-blur-2xl flex flex-col pt-12 pb-20 px-5 items-center text-white'>
           <h1 className={`text-4xl ${dancingScript.className} font-extrabold`}>SignIn</h1>
           <p className='text-white/50'>Don't have an account ? <span className='text-cyan-600 cursor-pointer' onClick={()=>(navigate.push("/register"))}>Signup</span> </p>
          
          <form className='flex flex-col w-full items-center mt-7 gap-3' onSubmit={handlelogin} >
       
          <input type="text" placeholder='Username' value={username} className="w-[90%] lg:w-[70%] rounded-xl py-2 px-5 bg-black/50 focus:outline-none" onChange={(e)=>{setUsername(e.target.value)} }/>
          <input type="email" placeholder='Email' value={email} className="w-[90%] lg:w-[70%] rounded-xl py-2 px-5 bg-black/50 focus:outline-none" onChange={(e)=>{setEmail(e.target.value)} }/>
          <div className='w-[90%] lg:w-[70%] bg-black/50 rounded-xl flex justify-between items-center'>
            <input type={isPasswordVisible ? "text" : "password"} placeholder='Password' value={password} className="py-2 px-5 focus:outline-none bg-transparent" onChange={(e) => setPassword(e.target.value)} ref={passRef} />
            {isPasswordVisible ? 
              <FaEye className='pr-2 text-2xl text-white/50 hover:text-white' onClick={togglePasswordVisibility} /> : 
              <FaEyeSlash className='pr-2 text-2xl text-white/50 hover:text-white' onClick={togglePasswordVisibility} />
            }
          </div>
          
          <p className='text-cyan-600 cursor-pointer w-[90%] lg:w-[70%]' onClick={()=>{navigate.push("/recoverpassword")}}>Forgot Password ?</p>
           <button type="submit" className='bg-cyan-700 hover:bg-cyan-500 text-white py-2 px-5 rounded-xl mt-4'>Login</button>
          </form>
            
           
         </div>
    </main>
  )
}

export default Login
