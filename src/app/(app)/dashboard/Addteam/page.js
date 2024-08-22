"use client";

import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Itim } from 'next/font/google';


const itim = Itim({
  weight: ['400'],
  subsets: ['latin'],
});

export default function Page() {
  const [isConnected, setIsConnected] = useState(false);
  const [name, setName] = useState('');
  const router = useRouter();

  return (
    <div className={`h-full w-full bg-slate-400 flex items-center justify-center ${itim.className}`}>
      <div className='bg-white/70 rounded-2xl px-6 py-10 w-[80%] md:w-[60%] lg:w-[50%]'>
        <div className='w-full'>
          <label htmlFor='name' className='font-bold text-xl'>Team Name :</label>
          <input
            id="name"
            className='bg-black/10 rounded-lg text-black w-full py-2 px-3 outline-none focus:outline-none text-xl'
            onChange={(e) => setName(e.target.value)}
            value={name}
            placeholder='Enter the name for the Team'
          />
        </div>

        <div className='w-full mt-6 flex justify-between items-center py-2 px-2'>
          <button
            className='bg-black/5 px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-black/10'
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button
            className='bg-cyan-600 px-6 py-1 text-white font-bold rounded-3xl hover:bg-cyan-400'
            // onClick={handleTeamFormation}
          >
            Add Team
          </button>
        </div>
      </div>
    </div>
  );
}
