'use client'
import React, { useState, useEffect } from 'react';

function Timer2({date}) {
    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    

    let targetDate = new Date(date);
    targetDate.setHours(23, 59, 59, 999)
    useEffect(() => {
        function updateCountdown() {
            const now = new Date();
            const timeRemaining = targetDate - now;

            if (timeRemaining > 0) {
                
                const d = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                const h = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((timeRemaining % (1000 * 60)) / 1000);

                setDays(d);
                setHours(h);
                setMinutes(m);
                setSeconds(s);
            } else {
                
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

export default Timer2;
