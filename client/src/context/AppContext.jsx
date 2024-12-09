/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContent =createContext()

export const AppContextProvider = (props)=>{
    
    axios.defaults.withCredentials = true

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const[isLoggedin , setIsLoggedin] =useState(false)
    const[userData , setUserData] =useState(false)

    //logged in user's data
    const getUserData = async ()=>{
        try {
            const {data} = await axios.get(backendUrl + '/api/user/data')
            data.success ? setUserData(data.userData) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    //checking for authentication to remove login button
    const getAuthState = async ()=>{
        try {
            const {data} = await axios.get(backendUrl + '/api/auth/is-auth')

            if(data.success){
                getUserData()
                setIsLoggedin(true)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //need to run getAuth function on every page reload , so we are using useeffect
    useEffect(()=>{
        getAuthState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    const value ={
        backendUrl,
        isLoggedin , setIsLoggedin,
        userData, setUserData,
        getUserData
    }

    return(
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>


    )
}