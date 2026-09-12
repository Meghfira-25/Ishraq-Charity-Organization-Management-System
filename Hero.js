import React from 'react'
import './hero.css'

function Hero() {
  return (
    <div className='hero-container'>
        <p className='hero-title'>TOGETHER, WE CAN <br/> <span>BRING HOPE ,<br/> EMPOWER LIVES</span></p>
        <p className='hero-text'>Ishraq charity organization is dedicated to suporting<br/>
        vurnerable communities through education, healthcare, <br/>
        humanitarian aid, and sustainable development programs.
        </p>

        <button className='btn1'>BECOME A MEMBER <i class="fa-regular fa-heart"></i></button>
        <button className='btn2'>LEARN MORE <i class="fa-solid fa-arrow-right"></i></button>
    </div>


    
  )
}

export default Hero
