import React from 'react'

import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
// import 'swiper/swiper.min.css';
import './Swipper.css'


const Swipper = () => {

    const slides = [
    'Slide 1',
    'Slide 2',
    'Slide 3',
        
    ];
  return (
    <div className='swipper-container'>
        <Swiper
      spaceBetween={50}
      slidesPerView={3}
      onSlideChange={() => {}}
      onSwiper={(swiper) => {}}
    >
      <SwiperSlide>Slide 1</SwiperSlide>
      <SwiperSlide>Slide 2</SwiperSlide>
      <SwiperSlide>Slide 3</SwiperSlide>
      <SwiperSlide>Slide 4</SwiperSlide>
      ...
    </Swiper>
    </div>
  )
}

export default Swipper
