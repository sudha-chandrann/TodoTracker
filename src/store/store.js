import {configureStore} from '@reduxjs/toolkit';
import UserSlice from "./userSlice"
import teamSlice from './teamSlice';
const store =configureStore(
    {
        reducer:{
            user:UserSlice,
            team:teamSlice
        },
    }
)

export default store;