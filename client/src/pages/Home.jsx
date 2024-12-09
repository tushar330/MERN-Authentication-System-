/* eslint-disable no-unused-vars */
import React from 'react'
import Navbar from '../components/Navbar'
import Header from '../components/Header'

const Home = () => {
  return (
    <div className='flex flex-col items-center judtify-center min-h-screen bg-[url("/bg_img.png")] bg-cover bg-center'>
        <Navbar/>
        <Header/>
    </div>
  )
}

export default Home