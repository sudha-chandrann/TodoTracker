'use client'
import React, { useState, useEffect } from 'react';

function Timer({date,iscompleted=true,fun}) {
    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [isdeadlinend,setisdeadlineend]=useState(false);

    let targetDate = new Date(date);
    targetDate.setHours(23, 59, 59, 999)
    useEffect(() => {
        function updateCountdown() {
            const now = new Date();
            const timeRemaining = targetDate - now;

            if (timeRemaining > 0) {
                setisdeadlineend(false)
                const d = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                const h = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((timeRemaining % (1000 * 60)) / 1000);

                setDays(d);
                setHours(h);
                setMinutes(m);
                setSeconds(s);
            } else {
                setisdeadlineend(true)
                setDays(0);
                setHours(0);
                setMinutes(0);
                setSeconds(0);
            }
        }

        const timerInterval = setInterval(updateCountdown, 1000);
        
        // Initial call to display the countdown immediately
        updateCountdown();
        
        // Clean up interval on component unmount
        return () => clearInterval(timerInterval);
    }, [targetDate]);

    return (
        <div className='w-full bg-white/25 p-4  rounded-xl flex justify-between z-10 '>
     {
         (isdeadlinend && !iscompleted)?<div className='fixed top-[25%] left-[40%] bg-gray-400 px-6 py-6 rounded-lg  w-[60%] md:w-[40%] z-10'>
          <div className='w-full text-center my-3 text-black text-3xl font-semibold z-10'>
            Please Complete your target work<br/>Its deadline is already ended and extend your dealinedate to complete your work
          </div>

       <div className='w-full mt-6  flex justify-center items-center py-2 px-2'>
          <button className='bg-white px-6 py-1 text-cyan-600 font-bold rounded-3xl hover:bg-white/50' onClick={()=>{  
            setisdeadlineend(false)
            fun();
          }}> Ok</button>
        
       </div>
      </div>:<div></div>
  
      } 
            <div>
                <div className='bg-white px-2 rounded-xl text-black text-xl flex justify-center items-center'>
                    {days}
                </div>
                <div>Days</div>
            </div>
            :
            <div>
                <div className='bg-white px-2 rounded-xl text-black text-xl flex justify-center items-center'>
                    {hours}
                </div>
                <div>Hours</div>
            </div>
            :
            <div>
                <div className='bg-white px-2 rounded-xl text-black text-xl flex justify-center items-center'>
                    {minutes}
                </div>
                <div>Minutes</div>
            </div>
            :
            <div>
                <div className='bg-white px-2 rounded-xl text-black text-xl flex justify-center items-center'>
                    {seconds}
                </div>
                <div>Seconds</div>
            </div>
        </div>
    );
}

export default Timer;
