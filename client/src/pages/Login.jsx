 /* eslint-disable no-unused-vars */
import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from 'axios'
import { toast } from "react-toastify";

const Login = () => {

  const navigate = useNavigate()  

  const {backendUrl, setIsLoggedIn, getUserData} = useContext(AppContent)

  const [state, setState] = useState("Sign Up");

  //state variables to store data entered in the field
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')

  const onSubmitHandler = async (e)=>{
    try {
        e.preventDefault(); //prevents from reloding on submission

        //sends cookies with details also , Frontend Request: The Sign Up function sends user details (name, email, password) to the server.
        // Backend Response:
        // Stores user data.
        // Sets an authentication token in an HTTP-only cookie.
        axios.defaults.withCredentials = true 

        if(state === 'Sign Up'){

            const {data} = await axios.post(backendUrl + '/api/auth/register' , {name,email,password})

            if(data.success){
                getUserData()
                navigate('/')
                setIsLoggedIn(true)
                
            }else{
                toast.error(data.message)
            }

        }else{
            const {data} = await axios.post(backendUrl + '/api/auth/login' , {email,password})

            if(data.success){
                getUserData()
                navigate('/')
                setIsLoggedIn(true)
                
            }else{
                toast.error(data.message)
            }
        }

    } catch (error) {
        toast.error(error)
    }
  }


  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to purple-400">
      <img
      onClick={()=>navigate('/')}
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:32 cursor-pointer"
      />

      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-small">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>

        <p className="text-center text-sm mb-6">
          {state === "Sign Up"
            ? "Create your account"
            : "Login to your account!"}
        </p>

        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && 
          (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.person_icon} alt="" />
              <input
                onChange={e=>setName(e.target.value)}
                value={name}
                type="text"
                placeholder="Full Name"
                required
                className="outline-none bg-transparent"
              />
            </div>
          )}

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" />
            <input
              onChange={e=>setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email Id"
              required
              className="outline-none bg-transparent"
            />
          </div>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" />
            <input
              onChange={e=>setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              required
              className="outline-none bg-transparent"
            />
          </div>

          {state === 'Login' && (
          <p 
            onClick={()=>navigate('/reset-password')}
            className="mb-4 text-indigo-500 cursor-pointer">
            Forgot password?
          </p>
          )}

          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium">
            {state}
          </button>
        </form>

        {state === "Sign Up" ? 
        (
          <p className="text-gray-400 text-center text-xs mt-4">
            Already have an acount?{"  "}
            <span 
              onClick = {()=> setState('Login')}
              className="text-blue-400 cursor-pointer underline">
              Login here
            </span>
          </p>
        ) 
        : 
        (
          <p className="text-gray-400 text-center text-xs mt-4">
            Don&apos;t have an acount?{"  "}
            <span
              onClick = {()=> setState('Sign Up')}
              className="text-blue-400 cursor-pointer underline">
              Sign up
            </span>
          </p>
        )}

      </div>
    </div>
  );
};

export default Login;
