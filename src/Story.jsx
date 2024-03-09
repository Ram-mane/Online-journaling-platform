
import React,{useEffect, useState, useRef} from 'react'
import { AiFillStar, AiOutlineSearch } from "react-icons/ai"
import { BiChevronDown, BiStar } from "react-icons/bi"
import { BsPen, BsArrowLeft } from "react-icons/bs"
import { FaShare, FaStar } from 'react-icons/fa';
import StarIcon from '@mui/icons-material/Star';

import Popular from './Popular'
import { CgArrowsExchangeAltV } from "react-icons/cg"

import SwiperCore, { EffectCoverflow } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import 'swiper/components/effect-coverflow/effect-coverflow.min.css';

SwiperCore.use([EffectCoverflow]);


import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"
import { Card, CardBody, Container } from 'reactstrap'
import { toast } from 'react-toastify'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

const appSetting = {
  databaseURL: "https://lean-platform-project-default-rtdb.asia-southeast1.firebasedatabase.app/"
}

const app = initializeApp(appSetting)
const database = getDatabase(app)
const List = ref(database, 'List')

const cat = ref(database, 'Category')

let initialCategories = ['FIGMA', 'FOOD', 'ENGINEERING','ENGINEERING DAYS', 'CINEMA', 'JOURNALISM','MUSIC','SPORTS']

export default function Story() {

  const { category } = useParams();
  console.log("category param "+category);

  const [swiper, setSwiper] = useState(null);

  const [subject, setSubject] = useState('')
  const [describe, setDescribe] = useState('')
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedCategory, setSelectedCategory] = useState( '')


  const [search, setSearch] = useState(category? category : '')
  const [searchResults2, setSearchResults2] = useState([])

  const [categories, setCategories] = useState([])
  const [newCat, setNewCat] = useState([])
  const [randomCat, setRandom] = useState([])
  const [mappable, setMappable] = useState([])

  const [show, setShow] = useState(false)
  const [show3, setShow3] = useState(false)
  const [show4, setShow4] = useState(false)
  const[menu, setMenu] = useState(false)
  const[flipped, setFlipped] = useState(false)
  const [content, setContent] = useState(false)
  
  const [check, setCheck] = useState('')

  // if url has category then set the category to selected value
  const[selectedValue, setSelectedValue] = useState(category? category : '')
  
  const[stories, setStories] = useState(0)
  const [expandedSections, setExpandedSections] = useState({})
  const [reveal, setReveal] = useState({})

  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [isStarClicked, setIsStarClicked] = useState(false);

  const [categoryParam, setCategoryParam] = useState(category? category : '');

  const [copySuccess, setCopySuccess] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // used useNavigate to navigate to the selected category
  const navigate = useNavigate();
  const categoryURL = category ? `${window.location.origin}/category/${category}`:`${window.location.origin}/`;


  // handle share to generate the path url of current category
  const handleShare = () => {
    const categoryURL = category ? `${window.location.origin}/category/${category}`:`${window.location.origin}/`;
    console.log("categoryURL : "+categoryURL);
    navigator.clipboard.writeText(categoryURL);
    // setShowPopup(true);
    setCopySuccess(true); // Optional: Set state to show a success message
    {copySuccess ? toast.success(`Link copied to clipboard ${categoryURL}`): null}
  };

  const handleShareClick = () => {
    setShowPopup(true);
  }

  const SharePopup = (categoryURL, onClose) => {
    return (
      <div className="share-popup">
        <Card className="popup-card">
          <CardBody>
            <p>{categoryURL}</p>
            <button className='popup-button-close' onClick={onClose}>Close</button>
            <button className='popup-button-close' onClick={handleShare}>Copy Link</button>
          </CardBody>
        </Card>
      </div>
    );
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  

  // // Use the 'category' value as needed (e.g., to fetch data or update state)
  // useEffect(() => {
  //   if (category) {
  //     console.log(`Selected Category: ${category}`);
  //     // Fetch data or perform actions based on the selected category
  //   }
  // }, [category]);



    // category list func
    function CategoryList() {
      return (
        <ul>
          {initialCategories.map((category) => (
            <li key={category}>
              <Link to={`/${category.toLowerCase()}`}>{category}</Link>
            </li>
          ))}
        </ul>
      );
    }

    
        // Retrieve the user's previous actions from localStorage
      const savedActions = JSON.parse(localStorage.getItem('starClicked')) || {};
      console.log(savedActions);

      // Set the initial state based on the saved actions
      const initialStarClicked = savedActions[search] || false;
      console.log(initialStarClicked);

   



// Click handler for the star icon
const handleStarClick = () => {
  // Toggle the star's color
  setIsStarClicked((prev) => !prev);

  // Saved the user's action locally
  localStorage.setItem(
    'starClicked',
    JSON.stringify({
      ...savedActions,
      [search]: !isStarClicked,
    })
  );
  console.log('starClicked' + ' ' + !isStarClicked + ' ' + 'is saved for category ' + selectedCategory);
};



  // handled  the droopdown closing when clicked somewhere outside in te screen
  const dropdownRef = useRef(null);
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      // Clicked outside the dropdown, close it
      setShow4(false);
    }
  };

  useEffect(() => {
    // Attached the event listener when the component mounts
    document.addEventListener('click', handleClickOutside);

    // Cleaned up the event listener when the component unmounts
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);


  useEffect(() => {
    onValue(cat, function(snapshot){
      if(snapshot.exists()){
        const entries = Object.entries(snapshot.val())
        setCategories(entries.map(item => item[1]))
        setNewCat(entries.map(item => item[1]))
        setRandom(entries.map(item => item[1]))
      }
    })
  }, [])
  
  useEffect(() => {
    if (randomCat.length > 0) {
      const random = Math.floor((Math.random() * categories.length))

      // on direct clicking on url of category we are setting the category

      category ? setCheck(category):setCheck(randomCat[random])
    }
  }, [randomCat])


    function getCurrentDateTime(){
      const now = new Date()
      const day = String(now.getDate()).padStart(2, '0')
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const year = String(now.getFullYear())
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
  
      return `${day}-${month}-${year}-${hours}-${minutes}-${seconds}`
    }

  function handleValue(e){
    const name = e.target.name
    const value = e.target.value
    
    if(name === 'subject'){
      setSubject(value)
    }
    
    else if(name === 'description'){
      setDescribe(value)
    }
  }
  
  function handleSearch(e){
    const searchValue = e.target.value
    setSearchText(searchValue)
    
    const results = performSearch(searchValue)
    setSearchResults(results)
    
    
  }
  
  function handleSearch2(e){
    setSearch(e.target.value)
    setMenu(false)
    setShow3(true)
    
    const results = performSearch2(e.target.value)
    setSearchResults2(results)
  }
  
  function handleCategorySelect(category){
    setSelectedCategory(category.toUpperCase())
    setSearchText('')
    setSearchResults([])
    setShow(false)
  }

  // updated the handleCategorySelect2 function to store the selected category in local storage
  function handleCategorySelect2(category){

            setCategoryParam(category);
            console.log(category);
            navigate(`/category/${category.toLowerCase()}`);
            setSearch(category)
            setSelectedValue('')
            setSearchResults2([])
            searchBar(category)

        // get the saved actions from localStorage        
        const savedActions = JSON.parse(localStorage.getItem('starClicked')) || {};
        console.log(savedActions);

        // Set the initial state based on the saved actions
        const initialStarClicked = savedActions[category] || false;
        console.log(" handle cat "+initialStarClicked);
        // Set the initial state based on the saved actions
        setIsStarClicked(initialStarClicked);
        window.location.reload();
  }

  

  function performSearch(searchValue){
    const filteredCategories = categories && categories.filter(category => 
      category.toLowerCase().startsWith(searchValue.toLowerCase()))

    return filteredCategories
  }

  function performSearch2(searchValue){
    const filteredCategories = randomCat && randomCat.filter(category => 
      category.toLowerCase().startsWith(searchValue.toLowerCase()))

    return filteredCategories
  }

  function clear(){
    setSubject('')
    setDescribe('')
    setSearchText('')
    setSelectedCategory('')
  }

  function handleSubmit(e){
    const random = ((Math.random() * 4))
    e.preventDefault()
    const Data ={
      subject: subject,
      description: describe,
      category: selectedCategory,
      timeStamp: getCurrentDateTime(),
      id: random 
    }

    if(subject && describe && selectedCategory){
      push(ref(database, `List/${selectedCategory}`), Data)

      // added the toast notification for the story published
      toast.success('Story published successfully');

      if(selectedCategory){
        if(newCat && !newCat.some((item) => (item.toLowerCase() === selectedCategory.toLowerCase()))){
          push(cat , selectedCategory)
        }
        clear()
      }
    }

    // setContent(false)
    
  }

  function handleShow(){
    setShow(prev => !prev)
  }

  function handleAdd(){
    setSelectedCategory(searchText.toUpperCase())
    setSearchText('')
    setSearchResults([])
    setShow(false)

    if(searchText){
      if(initialCategories && !initialCategories.some((item) => (item.toLowerCase() === searchText.toLowerCase()))){
        setCategories((prevCategories) => [...prevCategories, searchText])
        initialCategories.push(searchText)
      }
    }
  }

  function searchBar(cat){
    cat && setMenu(true)
    setShow3(false)
    setShow4(false)
  }



  function handleClick(){
    setShow3(prev => !prev)
    setShow4(false)
  }

  function handleClick2(){
    setShow4(prev => !prev)
    setShow3(false)
  }
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    windowWidth >425 ? setContent(true) : setContent(false)
  }, [windowWidth])

  function handleflip(){
    setFlipped(prev => !prev)
  }

  
  function handleChildValue(value){
    setSelectedValue(value)

    // navigate to the selected category
    navigate(`/category/${value.toLowerCase()}`)
    console.log( "child val"+value)
    setSearch('')
    window.location.reload();

  }

  
  
  function formattedDate(dateTimeString){
    const dateTimeParts = dateTimeString.split('-')
    
    const day = dateTimeParts[0]
    const month = dateTimeParts[1]
    const year = dateTimeParts[2]
    
    return `${day}-${month}-${year}`
    
  }
  
  function formattedDate2(dateTimeString){
    const dateTimeParts = dateTimeString.split('-')
    
    const day = dateTimeParts[0]
    const month = dateTimeParts[1]
    const year = dateTimeParts[2]
    
    return `${month}-${day}-${year}`
    
  }
  
  function formattedTime(dateTimeString){
    const dateTimeParts = dateTimeString.split('-')
    
    const hours = dateTimeParts[3]
    const minutes = dateTimeParts[4]
    const seconds = dateTimeParts[5]
    
    return `${hours}-${minutes}-${seconds}`
    
  }

  useEffect(() => {
    if(windowWidth>425){
      setReveal({})
    }

    else if(windowWidth<=425){
        setShow4(false)
        setShow(false)
    }
  }, [windowWidth])

  function togglePara(itemId) {
   windowWidth > 425 ?  
   (setExpandedSections((prevExpandedSections) => ({
     ...prevExpandedSections,
     [itemId]: !prevExpandedSections[itemId],
   }))) : 

   (setReveal((prevReveal) => ({
    ...prevReveal,
    [itemId]: !prevReveal[itemId],
  })))
  }

  const revealMain = {
    position: 'absolute',
    top: '0px',
    left: windowWidth > 375 ? '-75px' : windowWidth > 320 ?  '-90px' : '-80px',
    width:  windowWidth > 320 ? '283px' : '250px',
    height: '257px',
    boxShadow: '1px 1px 0px #000000',
  }
  
  const revealhead = {
    alignSelf: 'center',
    width: '194px',
    marginBottom: '8px',
  }

  const revealPara = {
    marginTop: 'initial',
    width: '215px',
    overflowY: reveal ? 'auto' : 'hidden',
    maxHeight: '112px',
    fontSize: '0.625rem'
  }

  function goback(){
    setReveal({})
  }


  useEffect(() => {
    if(selectedValue){
      onValue(ref(database, `List/${selectedValue.toUpperCase()}`), function(snapshot) {
        if (snapshot.exists()) {
          setStories(Object.entries(snapshot.val()).length)
          setMappable(Object.entries(snapshot.val()))
        }
      })
    }
    setReveal({})
    
  }, [selectedValue])
  
  useEffect(() => {
     if(check){
      onValue(ref(database, `List/${check.toUpperCase()}`), function(snapshot) {
        if (snapshot.exists()) {
          setStories(Object.entries(snapshot.val()).length)
          setMappable(Object.entries(snapshot.val()))
        }
      })
    }

    setReveal({})

  }, [check])

  
  useEffect(() => {
    if(search){
      onValue(ref(database, `List/${search.toUpperCase()}`), function(snapshot) {
        if (snapshot.exists()) {
          setStories(Object.entries(snapshot.val()).length)
          setMappable(Object.entries(snapshot.val()))
        }
      })      
    }
    setReveal({})
  }, [search])


  function showContent(){
    setContent(prev => !prev)
  }


  function paragraph(item){

    if(item){
      const words = item[1].split(' ')
      const isExpanded = expandedSections[item[2]]
      const isRevealed = reveal[item[2]]
  
      if (words.length > 24 && !isExpanded) {
        return (
          <div className='item-section' key={item[2]} style={isRevealed ? revealMain : {}}>
            <div className='item-category'>
              <h3>{item[0]}</h3>
              <p>{formattedDate(item[4])}</p>
            </div>
            {isRevealed && <BsArrowLeft className='left-arrow' onClick={goback}/>}
            <h2 style={isRevealed ? revealhead : {}}>{item[3]}</h2>
            <div className='show-para'>
              {isRevealed ? <p style={isRevealed ? revealPara : {}}>{item[1].slice(0, item[1].length)}...</p> : 
              <p>{item[1].slice(0, 154)}...</p>}
            </div>
              {windowWidth > 425 ? <span className='read-more' onClick={() => togglePara([item[2]])}>
                Read more...
              </span> :

              !isRevealed && <span className='read-more' onClick={() => togglePara([item[2]])}>
              Read more...
            </span>}
          </div>
        )
      }
  
      else{
        return (
          <div className='item-section' key={item[2]} style={isRevealed ? revealMain : {}}>
            <div className='item-category'>
              <h3>{item[0]}</h3>
              <p>{formattedDate(item[4])}</p>
            </div>
            {isRevealed && <BsArrowLeft className='left-arrow' onClick={goback}/>}
            <h2 style={isRevealed ? revealhead : {}}>{item[3]}</h2>
            <div className='show-para'>
              <p style={isRevealed ? revealPara : {}}>{item[1]}</p>
            </div>
              {words.length > 24 && windowWidth > 425 ? (
                <span className='read-more' onClick={() => togglePara(item[2])}>
                  Read less
                </span>
              ) :

             (words.length > 24 && !isRevealed) && <span className='read-more' onClick={() => togglePara(item[2])}>
              Read more...
            </span>}
          </div>
        )
      }
    }
  }

  function sorted(mappable){
    const sortedMappable = mappable.sort((a, b) => {
      const dateA = new Date(formattedDate2(Object.values(a[1])[4]))
      const dateB = new Date(formattedDate2(Object.values(b[1])[4]))

      if(dateA < dateB){
        return flipped ? 1 : -1
      }

      if (dateA > dateB) {
        return flipped ? -1 : 1;
      }

      const timeA = formattedTime(Object.values(a[1])[4]);
      const timeB = formattedTime(Object.values(b[1])[4]);

      if (timeA < timeB) {
        return flipped ? 1 : -1;
      }
      if (timeA > timeB) {
        return flipped ? -1 : 1;
      }
     })

    return sortedMappable.map((items, index) => {
      const random = ((Math.random() * 4))
      return (
        <div key={random} className='single-items'>
          {paragraph(Object.values(items[1]))}
        </div>
      )
    })
  }

  return (
    <div className='flex'>
      <Popular onChildValue={handleChildValue}  />
      <div className='story-section '>

        <Container>
        <form className='section-1' >
            <div className='section-1-head'>
              <h1>Write your own story</h1>
              <BsPen className='pen' onClick={showContent}/>
            </div>
            { content && <div className='section-1-content' >
              <div className="subject">
                  <label htmlFor="subject"><h3>Topic</h3></label>
                  <input id="subject"
                      name="subject" 
                      type='text'
                      placeholder='write the topic for your story ' 
                      value={subject}
                      onChange={(e) => handleValue(e)} required/>
              </div>

              <div className="description">
                  <label htmlFor="describe"><h3>Description</h3></label>
                  <textarea 
                    value={describe} 
                    name='description'
                    id='describe'
                    placeholder='write what your story is about here'
                    onChange={(e) => handleValue(e)} required/>
              </div>

              <div className='selectCategory'>

                <div className='select-btn' onClick={handleShow} >
                  {selectedCategory ? <span>{selectedCategory.toUpperCase()}</span> : 
                  <span>Select a category</span>}
                  <BiChevronDown className='down'/>
                </div>
                
                {show && <div className='content' >
                  <div className='search'>
                    <AiOutlineSearch className='search-btn'/>
                    <input
                      type="text"
                      id='category'
                      placeholder="Search"
                      value={searchText}
                      onChange={handleSearch} required/>
                  </div>


                  {searchText.length === 0 ? 
                    (<ul className='search-list'>
                    {initialCategories.map(category => (
                      <li key={category} onClick={() => handleCategorySelect(category)}>
                        {category}
                        </li>
                    ))}
                    </ul>) :
                    searchResults.length > 0 ? (
                    <ul className='search-list'>
                        {searchResults.map(category => (
                          <li key={category} onClick={() => handleCategorySelect(category)}>
                            {category}
                            </li>
                        ))}
                        </ul>
                    ) :
                    <ul className='search-list'>
                      <li onClick={handleAdd}>Add new category</li>
                    </ul>}

                  </div>}
              </div>

              <button type='submit' className='submit-btn' onClick={handleSubmit}>
                  PUBLISH YOUR STORY
              </button>
            </div>}
        </form>
        </Container>

        <div className='middle-line'/>

        <container className="container-fluid">
          
              <section className='section-2'>

                <container className='container-fluid'>
                      <div className='section-2-head'>

                        {/* updated the story section */}
                        <h1>Read  stories</h1>

                        <div className='looking'>
                          <div className='choose' ref={dropdownRef}>
                            <label htmlFor='choose'><h3>What are you looking for?</h3></label>
                            <input
                                type="text"
                                id='choose'
                                placeholder="Browse a Category"
                                value={search}
                                onClick={handleClick}
                                onBlur={() => handleClick2() }
                                onChange={handleSearch2} required/>
                            <BiChevronDown className='btn-2' onClick={handleClick2}/>


                                {/*  changed the position of the sort  */}
                                <container className="container-fluid">
                                <div className='mt-3'>

                                      <div className='flex-filter p-2 '>
                                        

                                          {/*added  Star icon from the react-icons */}
                                          <div className='ms-2'>
                                            <FaStar size={25} color={ isStarClicked ? 'yellow' : 'grey' }
                                            onClick={handleStarClick} />
                                          </div>

                                          {/*added  share icon from the react-icons */}

                                          <div> 
                                            {/* ... Other content */}
                                            <FaShare className="share-icon" onClick={handleShareClick} />
                                            {/* Share Popup */}
                                            {showPopup && SharePopup(categoryURL, closePopup)}
                                          </div>

                                        <h2 className='filter-heading ms-3'>Sort: 
                                          <span onClick={handleflip}>
                                            {flipped ? `Newest to Oldest` : `Oldest to Newest`}
                                            </span>
                                        </h2>
                                        <CgArrowsExchangeAltV  className='filterarrow' onClick={handleflip}/>


                                      </div>
                                  </div>
                                </container>
                          </div>
                          

                          {(show4) ? (
                            <ul className='search-list search-list-2'>
                            {initialCategories.map(category => (
                              <li key={category} onClick={() => handleCategorySelect2(category)}>
                                {category}
                                </li>
                            ))}
                            </ul>
                          ) :
                          (show3 && search.length === 0) ? (
                            <ul className='search-list search-list-2'>
                            {initialCategories.map(category => (
                              <li key={category} onClick={() => handleCategorySelect2(category)}>
                                {category}
                                </li>
                            ))}
                            </ul>
                          ) :         
                          ((show3 && searchResults2.length > 0)) && (
                            <ul className='search-list search-list-2'>
                                {searchResults2.map(category => (
                                  <li key={category} onClick={() => handleCategorySelect2(category)}>
                                    {category}
                                    </li>
                                ))}
                                </ul>
                            )}
                        </div>          
                      </div>
                </container>

                <div className='filter'>
                  <h1 className='total-story'><span>{stories === 1 ? `${stories} story` : stories === 0 ? `0 story` : `${stories} stories`}</span> for you to read</h1>
                  
                </div>

                { windowWidth > 425 ? <div>
                  {selectedValue &&  (
                    <div className='container-fluid'>
                      <section className='item-section-main'>
                        <div className='item-section-container'>
                          {(check && mappable) && sorted(mappable)}
                      </div>
                    </section>
                    </div>
                  )}

                    {(!menu || search.length === 0) &&  (<div className='container'>
                      <section className='item-section-main'>
                        <div className='item-section-container'>
                          {(check && mappable) && sorted(mappable)}
                        </div>
                      </section>
                    </div>) 
                    }

                    {(search.length > 0 && menu) &&  (<div className='container'>
                      <section className='item-section-main'>
                        <div className='item-section-container'>
                          {sorted(mappable)}
                        </div>
                      </section>
                  </div>) 
                  }
                </div>
                : 
                (<div className='container-fluid'>
                  <section className='item-section-main'>
                      <Swiper 
                        effect="coverflow"
                        // grabCursor='true'
                        centeredSlides='true'
                        slidesPerView={3}
                        coverflowEffect={{
                          rotate: 0,
                          stretch: 0,
                          depth: 200,
                          modifier: 1,
                          slideShadows: false,
                        }}
                        // onSwiper={handleSwiperInit}
                        // onSlideChange={handleSlideChange}
                      >
                        <div className='swiper-wrapper'>
                          {(() => { const sortedMappable = mappable.sort((a, b) => {
                            const dateA = new Date(formattedDate2(Object.values(a[1])[4]))
                            const dateB = new Date(formattedDate2(Object.values(b[1])[4]))

                            if(dateA < dateB){
                              return flipped ? 1 : -1
                            }

                            if (dateA > dateB) {
                              return flipped ? -1 : 1;
                            }

                            const timeA = formattedTime(Object.values(a[1])[4]);
                            const timeB = formattedTime(Object.values(b[1])[4]);

                            if (timeA < timeB) {
                              return flipped ? 1 : -1;
                            }
                            if (timeA > timeB) {
                              return flipped ? -1 : 1;
                            }
                          })

                          return sortedMappable.map((items, index) => {
                            const random = ((Math.random() * 4))
                            return (
                              <SwiperSlide key={random} className='swiper-slide'>
                                {paragraph(Object.values(items[1]))}
                              </SwiperSlide>
                            )
                          })
                          })()}
                        </div>
                      </Swiper>
                  </section>
                </div>)}
                </section> 
          </container>      
      </div>
    </div>
  )
}