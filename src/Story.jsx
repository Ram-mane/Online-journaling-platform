import React, { useEffect, useState, useRef } from "react";
import { AiFillStar, AiOutlineClose, AiOutlineSearch } from "react-icons/ai";
import { BiChevronDown, BiStar } from "react-icons/bi";
import { BsPen, BsArrowLeft } from "react-icons/bs";
import { FaShare, FaStar } from "react-icons/fa";

import Popular from "./Popular";
import { CgArrowsExchangeAltV } from "react-icons/cg";

import SwiperCore, { EffectCoverflow } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import "swiper/components/effect-coverflow/effect-coverflow.min.css";

SwiperCore.use([EffectCoverflow]);

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  update,
  onValue,
  get,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { Card, CardBody, CardHeader, Container } from "reactstrap";
import { toast } from "react-toastify";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import LatestStories from "./LatestStories";

const appSetting = {
  databaseURL: "https://sysu-9d83f-default-rtdb.asia-southeast1.firebasedatabase.app/"

};

export const app = initializeApp(appSetting);
export const database = getDatabase(app);
export const List = ref(database, "List");

const cat = ref(database, "Category");

export const storyCount = ref(database, "StoryCount");

let initialCategories = [
  "FIGMA",
  "FOOD",
  "ENGINEERING",
  "ENGINEERING DAYS",
  "CINEMA",
  "JOURNALISM",
  "MUSIC",
  "SPORTS",
];

export default function Story() {
  // get the category from the url
  const { category } = useParams();
  const [swiper, setSwiper] = useState(null);
  const [subject, setSubject] = useState("");
  const [describe, setDescribe] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // initiliazed the search state with the category from the url
  const [search, setSearch] = useState(category ? category.toUpperCase() : "");
  const [searchResults2, setSearchResults2] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);

  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState([]);
  const [randomCat, setRandom] = useState([]);
  const [mappable, setMappable] = useState([]);

  const [show, setShow] = useState(false);
  const [show3, setShow3] = useState(false);
  const [show4, setShow4] = useState(false);
  const [menu, setMenu] = useState(false);
  const [flipped, setFlipped] = useState(true);
  const [content, setContent] = useState(false);

  const [check, setCheck] = useState("");

  // if url has category then set the category to selected value
  const [selectedValue, setSelectedValue] = useState(
    category ? category.toUpperCase() : ""
  );

  const [stories, setStories] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});
  const [reveal, setReveal] = useState({});

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // added the state to store the and use the category from the url
  const [categoryParam, setCategoryParam] = useState(category ? category : "");
  const [copySuccess, setCopySuccess] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [readCatOn, setReadCatOn] = useState(category ? category : "");

  const [storyCounts, setStoryCounts] = useState({});

  // story count ref
  useEffect(() => {
    onValue(storyCount, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Update the state with the fetched storyCounts
        setStoryCounts(data);
      } else {
        console.error("No data available");
      }
    });

    // Clean up the listener when the component unmounts
    return () => {
      // Detach the listener
      onValue(storyCount, null);
    };
  }, []);

  // used useNavigate to navigate to the selected category
  const navigate = useNavigate();
  const categoryURL = category
    ? `${window.location.origin}/${category.toLowerCase()}`
    : `${window.location.origin}/${readCatOn.toLowerCase()}`;

  // handle share to generate the path url of current category
  const handleCopyUrl = () => {
    const categoryURL = category
      ? `${window.location.origin}/${category.toLowerCase()}`
      : `${window.location.origin}/${readCatOn.toLowerCase()}`;
    navigator.clipboard.writeText(categoryURL);
    // setShowPopup(true);
    {
      copySuccess
        ? toast.success(`Link copied to clipboard ${categoryURL}`)
        : toast.error("Failed to copy link tru again !");
    }
  };

  // Add the new categories to the initialCategories array
  // Use a Set to filter out duplicates
  const uniqueCategoriesSet = new Set([...initialCategories, ...newCat]);
  // Convert the Set back to an array
  initialCategories = [...uniqueCategoriesSet];

  // handled share icon click to show the popup
  const handleOpenPopup = () => {
    setShowPopup(true);
    setCopySuccess(true); // Optional: Set state to show a success message
  };

  // SharePopup component
  const SharePopup = (categoryURL, onClose) => {
    return (
      <div className="share-popup">
        <Card className="popup-card">
          <CardHeader className="popup-header">
            <h2 className="pop-head">Share your story link</h2>
          </CardHeader>
          <CardBody className="popup-link">
            <a href={categoryURL} target="_blank" rel="noopener noreferrer">
              {categoryURL}
            </a>
            <button className="copy-btn" onClick={handleCopyUrl}>
              <img
                src={"https://www.svgrepo.com/show/524469/copy.svg"}
                alt="copy image"
                style={{ width: "20px", cursor: "pointer" }}
              />
            </button>
          </CardBody>

          <button className="close-button" onClick={onClose}>
            <img
              src="https://www.svgrepo.com/show/522506/close.svg"
              alt="close button"
              width="20px"
            />
          </button>
        </Card>
      </div>
    );
  };

  // close the popup
  const closePopup = () => {
    setShowPopup(false);
  };


  // Retrieve the user's previous actions from localStorage
  const savedActions = JSON.parse(localStorage.getItem("starClicked")) || {};


  // Set the initial state based on the saved actions
  const [isStarClicked, setIsStarClicked] = useState();

  useEffect(()=>{

  // Set the initial state based on the saved actions
  const initialStarClicked = savedActions[category?.toUpperCase()] || false;

  // Set the initial state based on the saved actions
  setIsStarClicked(initialStarClicked);


  }, [readCatOn])
  // Click handler for the star icon
  const handleStarClick = () => {
    // if(search.length == 0){
    //   setSearch('RAM')
    // }

    const newSearch =  readCatOn.toUpperCase();
    console.log("Star clicked for category:", newSearch);
    // Toggle the star's color
    setIsStarClicked((prev) => !prev);

    // Saved the user's action locally
    localStorage.setItem(
      "starClicked",
      JSON.stringify({
        ...savedActions,
        [newSearch]: !isStarClicked,
      })
    );
  };

  // handled  the droopdown closing when clicked somewhere outside in te screen
  const dropdownRef = useRef(null);
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      // Clicked outside the dropdown, close it
      setShow4(false);
      setShow3(false);
    }
  };

  // handle dropdown closing for select category arrow
  const dropdownRef2 = useRef(null);
  const handleClickOutside2 = (event)=>{
    if (dropdownRef2.current && !dropdownRef2.current.contains(event.target)) {
      // Clicked outside the dropdown, close it
setShow(false)    
}
  }

  useEffect(() => {
    // Attached the event listener when the component mounts
    document.addEventListener("click", handleClickOutside);

    // Cleaned up the event listener when the component unmounts
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
    
  }, []);
  useEffect(() => {
   
    // Attached the event listener when the component mounts
    document.addEventListener("click", handleClickOutside2);

    // Cleaned up the event listener when the component unmounts
    return () => {
      document.removeEventListener("click", handleClickOutside2);
    };
  }, []);

  useEffect(() => {
    onValue(cat, function (snapshot) {
      if (snapshot.exists()) {
        const entries = Object.entries(snapshot.val());
        setCategories(entries.map((item) => item[1]));
        setNewCat(entries.map((item) => item[1]));
        setRandom(entries.map((item) => item[1]));
      }
    });
  }, []);

  useEffect(() => {
    if (randomCat.length > 0) {
      const random = Math.floor(Math.random() * categories.length);

      // if url contains category then set the displaying to category else set to random category
      category ? setCheck(category) : setCheck(randomCat[random]);
      category ? setReadCatOn(category) : setReadCatOn(randomCat[random]);
    }
  }, [randomCat]);

  function getCurrentDateTime() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear());
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year}-${hours}-${minutes}-${seconds}`;
  }

  function handleValue(e) {
    const name = e.target.name;
    const value = e.target.value;

    if (name === "subject") {
      setSubject(value);
    } else if (name === "description") {
      setDescribe(value);
    }
  }

  function handleSearch(e) {
    const searchValue = e.target.value;
    setSearchText(searchValue);

    const results = performSearch(searchValue);
    setSearchResults(results);
  }

  function handleSearch2(e) {
    setSearch(e.target.value);
    setCurrentCategory(null);
    setMenu(false);
    setShow3(true);

    const results = performSearch2(e.target.value);
    setSearchResults2(results);
  }

  function handleCategorySelect(category) {
    setSelectedCategory(category.toUpperCase());
    setSearchText("");
    setSearchResults([]);
    setShow(false);
  }

  // updated the handleCategorySelect2 function to update the favourite category and navigating to selected category
  function handleCategorySelect2(category) {
    setCategoryParam(category);
    setSearch(category);
    setCurrentCategory(null);
    setSelectedValue("");
    setSearchResults2([]);
    searchBar(category);
    navigate(`/${category?.toLowerCase()}`);

    // get the saved actions from localStorage
    const savedActions = JSON.parse(localStorage.getItem("starClicked")) || {};

    // Set the initial state based on the saved actions
    const initialStarClicked = savedActions[category] || false;

    // Set the initial state based on the saved actions
    setIsStarClicked(initialStarClicked);
    window.location.reload();
  }

  function performSearch(searchValue) {
    const filteredCategories =
      categories &&
      categories.filter((category) =>
        category.toLowerCase().startsWith(searchValue.toLowerCase())
      );

    return filteredCategories;
  }

  function performSearch2(searchValue) {
    const filteredCategories =
      randomCat &&
      randomCat.filter((category) =>
        category.toLowerCase().startsWith(searchValue.toLowerCase())
      );

    return filteredCategories;
  }

  function clear() {
    setSubject("");
    setDescribe("");
    setSearchText("");
    setSelectedCategory("");
  }

  function handleSubmit(e) {
    const random = Math.random() * 4;
    e.preventDefault();
    const Data = {
      subject: subject,
      description: describe,
      category: selectedCategory,
      timeStamp: getCurrentDateTime(),
      id: random,
    };

    if (subject && describe && selectedCategory) {
      push(ref(database, `List/${selectedCategory}`), Data);

      toast.success("Story published successfully");

      if (selectedCategory) {
        if (
          newCat &&
          !newCat.some(
            (item) => item.toLowerCase() === selectedCategory.toLowerCase()
          )
        ) {
          push(cat, selectedCategory);
        }
        clear();
      }

      // updating the story count for the published category

      const updatedCounts = { ...storyCounts };
      if (updatedCounts[selectedCategory]) {
        // If the category already exists, increment the count
        updatedCounts[selectedCategory]++;
      } else {
        // If the category doesn't exist, add it with count 1
        updatedCounts[selectedCategory] = 1;
      }

      // Update the storyCount node in the database
      update(ref(database, "StoryCount"), updatedCounts)
        .then(() => {})
        .catch((error) => {
          console.error("Error updating story count:", error);
        });

      // navigate to the selected/published category
      setTimeout(() => {
        navigate(`/${selectedCategory.toLowerCase()}`);
        window.location.reload();
      }, 2000);
    }

    else {
      toast.error("Please fill all the fields");
    }

    // setContent(false)
  }

  function handleShow() {
    setShow((prev) => !prev);
  }

  function handleAdd() {
    setSelectedCategory(searchText.toUpperCase());
    setSearchText("");
    setSearchResults([]);
    setShow(false);

    if (searchText) {
      if (
        initialCategories &&
        !initialCategories.some(
          (item) => item.toLowerCase() === searchText.toLowerCase()
        )
      ) {
        setCategories((prevCategories) => [...prevCategories, searchText]);
        initialCategories.push(searchText.toUpperCase());
      }
    }
  }

  function searchBar(cat) {
    cat && setMenu(true);
    setShow3(false);
    setShow4(false);
  }

  function handleClick() {
    setShow3((prev) => !prev);
    setShow4(false);
  }

  function handleClick2() {
    setShow4((prev) => !prev);
    setShow3(false);
  }

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    windowWidth > 435 ? setContent(true) : setContent(false);
  }, [windowWidth]);

  function handleflip() {
    setFlipped((prev) => !prev);
  }

  // updated the handleChildValue function to navigate to the selected category from the popular topics
  function handleChildValue(value) {
    setSelectedValue(value);

    // navigate to the selected category from the popular topics
    navigate(`/${value.toLowerCase()}`);
    setSearch("");
    window.location.reload();
  }

  function formattedDate(dateTimeString) {
    const dateTimeParts = dateTimeString.split("-");

    const day = dateTimeParts[0];
    const month = dateTimeParts[1];
    const year = dateTimeParts[2];

    return `${day}-${month}-${year}`;
  }

  function formattedDate2(dateTimeString) {
    const dateTimeParts = dateTimeString.split("-");

    const day = dateTimeParts[0];
    const month = dateTimeParts[1];
    const year = dateTimeParts[2];

    return `${month}-${day}-${year}`;
  }

  function formattedTime(dateTimeString) {
    const dateTimeParts = dateTimeString.split("-");

    const hours = dateTimeParts[3];
    const minutes = dateTimeParts[4];
    const seconds = dateTimeParts[5];

    return `${hours}-${minutes}-${seconds}`;
  }

  useEffect(() => {
    if (windowWidth > 435) {
      setReveal({});
    } else if (windowWidth <= 428) {
      setShow4(false);
      setShow(false);
    }
  }, [windowWidth]);

  function togglePara(itemId) {
    console.log("Read more...", expandedSections);

    windowWidth > 435
      ? setExpandedSections((prevExpandedSections) => ({
          ...prevExpandedSections,
          [itemId]: !prevExpandedSections[itemId],
        }))
      : setReveal((prevReveal) => ({
          ...prevReveal,
          [itemId]: !prevReveal[itemId],
        }));
  }

  const revealMain = {
    position: "absolute",
    top: "10px",
    left: windowWidth > 375 ? "-60%" : windowWidth > 320 ? "-69%" : "-49%",
    width: windowWidth > 320 ? "265%" : "310%",
    height: "287px",
    boxShadow: "1px 1px 0px #000000",
  };

  

  const revealhead = {
    alignSelf: "center",
    width: "194px",
    marginBottom: "8px",
  };

  const revealPara = {
    marginTop: "initial",
    width: "215px",
    overflowY: reveal ? "auto" : "hidden",
    maxHeight: "112px",
    fontSize: "0.625rem",
  };

  function goback() {
    setReveal({});
  }

  useEffect(() => {
    if (selectedValue) {
      onValue(
        ref(database, `List/${selectedValue.toUpperCase()}`),
        function (snapshot) {
          if (snapshot.exists()) {
            setStories(Object.entries(snapshot.val()).length);
            setMappable(Object.entries(snapshot.val()));
          }
        }
      );
    }
    setReveal({});
  }, [selectedValue]);

  useEffect(() => {
    if (check) {
      onValue(
        ref(database, `List/${check.toUpperCase()}`),
        function (snapshot) {
          if (snapshot.exists()) {
            setStories(Object.entries(snapshot.val()).length);
            setMappable(Object.entries(snapshot.val()));
          }
        }
      );
    }

    setReveal({});
  }, [check]);

  useEffect(() => {
    if (search) {
      onValue(
        ref(database, `List/${search.toUpperCase()}`),
        function (snapshot) {
          if (snapshot.exists()) {
            setStories(Object.entries(snapshot.val()).length);
            setMappable(Object.entries(snapshot.val()));
          }
        }
      );
    }
    setReveal({});
  }, [search]);

  function showContent() {
    setContent((prev) => !prev);
  }

  function paragraph(item) {
    if (item) {
      const words = item[1].split(" ");
      const isExpanded = expandedSections[item[2]];
      const isRevealed = reveal[item[2]];
      if (words.length > 24 && !isExpanded) {
        return (
          <div
            className="item-section"
            key={item[2]}
            style={isRevealed ? revealMain : {}}
          >
            <div className="item-category">
              <h3>{item[0]}</h3>
              <p>{formattedDate(item[4])}</p>
            </div>
            {isRevealed && (
              <BsArrowLeft className="left-arrow" onClick={goback} />
            )}
            <h2 style={isRevealed ? revealhead : {}}>{item[3]}</h2>
            <div className="show-para">
              {isRevealed ? (
                <p style={isRevealed ? revealPara : {}}>
                  {item[1].slice(0, item[1].length)}...
                </p>
              ) : (
                <p>{item[1].slice(0, 154)}...</p>
              )}
            </div>
            {windowWidth > 435 ? (
              <span className="read-more" onClick={() => togglePara([item[2]])}>
                Read more...
              </span>
            ) : (
              !isRevealed && (
                <span
                  className="read-more"
                  onClick={() => togglePara([item[2]])}
                >
                  Read more...
                </span>
              )
            )}
          </div>
        );
      } else {
        return (
          <div
            className="item-section"
            key={item[2]}
            style={isRevealed ? revealMain : {}}
          >
            <div className="item-category">
              <h3>{item[0]}</h3>
              <p>{formattedDate(item[4])}</p>
            </div>
            {isRevealed && (
              <BsArrowLeft className="left-arrow" onClick={goback} />
            )}
            <h2 style={isRevealed ? revealhead : {}}>{item[3]}</h2>
            <div className="show-para">
              <p style={isRevealed ? revealPara : {}}>{item[1]}</p>
            </div>
            {words.length > 24 && windowWidth > 435 ? (
              <span className="read-more" onClick={() => togglePara(item[2])}>
                Read less
              </span>
            ) : (
              words.length > 24 &&
              !isRevealed && (
                <span className="read-more" onClick={() => togglePara(item[2])}>
                  Read more...
                </span>
              )
            )}
          </div>
        );
      }
    }
  }

  function sorted(mappable) {
    const sortedMappable = mappable.sort((a, b) => {
      const dateA = new Date(formattedDate2(Object.values(a[1])[4]));
      const dateB = new Date(formattedDate2(Object.values(b[1])[4]));

      if (dateA < dateB) {
        return flipped ? 1 : -1;
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
    });

    return sortedMappable.map((items, index) => {
      const random = Math.random() * 4;
      return (
        <div key={random} className="single-items">
          {paragraph(Object.values(items[1]))}
        </div>
      );
    });
  }

  function handlelatestStories(story) {
    setMappable([story]);
    const currentCategory = story[1]?.category;
    const itemId = story[1]?.id;
    setReadCatOn(currentCategory);
    setCurrentCategory(currentCategory);

    const newExpandedSections = {};
    newExpandedSections[itemId] = true;
    setExpandedSections(newExpandedSections);

    // setExpandedSections((prevExpandedSections) => ({
    //   ...prevExpandedSections,
    //   [itemId]: !prevExpandedSections[itemId],
    // }))
    
  }

  return (
    <div className="flex">
      <Popular onChildValue={handleChildValue} />
      {/* <Pop onChildValue={handleChildValue}/> */}
      {windowWidth < 455 && (
        <div
          style={{
            height: "1.57px",
            marginTop: "10px",
            backgroundColor: "#3c3c3c",
            width: "100%",
          }}
        ></div>
      )}
      <div className="story-section ">
        <form className="section-1">
          <div className="section-1-head">
            <h1>Write your own story</h1>
            <BsPen className="pen" onClick={showContent} />
          </div>
          {content && (
            <div className="section-1-content">
              <div className="subject">
                <label htmlFor="subject">
                  <h3>Topic</h3>
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="Give a topic to your thoughts/story "
                  value={subject}
                  onChange={(e) => handleValue(e)}
                  required
                />
              </div>

              <div className="description">
                <label htmlFor="describe">
                  <h3>Description</h3>
                </label>
                <textarea
                  value={describe}
                  name="description"
                  id="describe"
                  placeholder="Start journaling your thoughts"
                  onChange={(e) => handleValue(e)}
                  required
                />
              </div>

              <div className="selectCategory">
                <div className="select-btn" onClick={handleShow} ref={dropdownRef2}>
                  {selectedCategory ? (
                    <span>{selectedCategory.toUpperCase()}</span>
                  ) : (
                    <span>Select a category</span>
                  )}
                  <BiChevronDown className="down" />
                </div>

                {show && (
                  <div className="content">
                    <div className="search" >
                      <AiOutlineSearch className="search-btn" />
                      <input
                        type="text"
                        id="category"
                        placeholder="Search"
                        value={searchText}
                        onChange={handleSearch}
                        autoFocus
                        required
                      />
                    </div>

                    {searchText.length === 0 ? (
                      <ul className="search-list">
                        {initialCategories.map((category) => (
                          <li
                            key={category}
                            onClick={() => handleCategorySelect(category)}
                          >
                            {category}
                          </li>
                        ))}
                      </ul>
                    ) : searchResults.length > 0 ? (
                      <ul className="search-list">
                        {searchResults.map((category) => (
                          <li
                            key={category}
                            onClick={() => handleCategorySelect(category)}
                          >
                            {category}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="search-list">
                        <li onClick={handleAdd}>Add new category</li>
                      </ul>
                    )}
                  </div>
                )}
                <button
                  type="submit"
                  className="submit-btn"
                  onClick={handleSubmit}
                >
                  PUBLISH YOUR STORY
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="middle-line" />

        <div className="container-fluid">
          <section className="section-2">
            <div className="section-2-head">
              {/* updated the story section */}
              <h1>
                Read stories on{" "}
                <div
                  style={{
                    height: "2px",
                    width: "55%",
                    background: "#6b5027",
                  }}
                ></div>
                <span style={{ display: "block" }}>
                  “
                  {readCatOn[0]?.toUpperCase() +
                    readCatOn?.slice(1).toLowerCase()}
                  ”
                </span>
              </h1>

              <div className="looking">
                <div className="choose" ref={dropdownRef}>
                  <label htmlFor="choose">
                    <h3>What are you looking for?</h3>
                  </label>
                  <input
                    type="text"
                    id="choose"
                    placeholder="Browse a category"
                    value={currentCategory || search}
                    style={{ textDecoration: "none" }}
                    onClick={handleClick}
                    onBlur={() => handleClick2()}
                    onChange={handleSearch2}
                    required
                  />
                  <BiChevronDown className="btn-2" onClick={handleClick2} />

                  {/*  changed the position of the sort  */}
                  <div className="container-fluid">
                    <div className="mt-3">
                      <div className="flex-filter p-2 ">
                        {/*added  Star icon from the react-icons */}
                        <div className="ms-2">
                          {/* <FaStar
                            size={25}
                            color={isStarClicked ? "yellow" : "grey"}
                            onClick={handleStarClick}
                          /> */}
                          <div
                            className="star-icon"
                            style={{ width: "20px", marginRight: "15px" }}
                            onClick={handleStarClick}
                          >
                            <img className="star-icon"
                              src={
                                isStarClicked
                                  ? "https://www.svgrepo.com/show/513354/star.svg"
                                  : "https://www.svgrepo.com/show/501365/star-light.svg"
                              }
                              alt="star icon"
                              style={{ width: "100%", height: "100%" }}                            />
                          </div>
                        </div>

                        {/*added  share icon from the react-icons */}

                        <div>
                          {/* <FaShare
                            className="share-icon"
                            onClick={handleOpenPopup}
                          /> */}
                          {/* Share Popup */}
                          <div
                            className="share-btn"
                            style={{ width: "20px", marginRight: "20px" }}
                            onClick={handleOpenPopup}
                          >
                            <img
                              src={
                                showPopup
                                  ? "https://www.svgrepo.com/show/460077/share-alt.svg"
                                  : "https://www.svgrepo.com/show/521832/share-1.svg"
                              }
                              alt="share button img"
                              style={{ width: "100%" }}
                            />
                          </div>
                          {showPopup && SharePopup(categoryURL, closePopup)}
                        </div>

                        <h2 className="filter-heading ms-3">
                          Sort:
                          <span onClick={handleflip}>
                            {flipped ? `Newest to Oldest` : `Oldest to Newest`}
                          </span>
                        </h2>
                        <CgArrowsExchangeAltV
                          className="filterarrow"
                          onClick={handleflip}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {show4 ? (
                  <ul className="search-list search-list-2">
                    {initialCategories.map((category) => (
                      <li
                        key={category}
                        onClick={() => handleCategorySelect2(category)}
                      >
                        {category}
                      </li>
                    ))}
                  </ul>
                ) : show3 && search.length === 0 ? (
                  <ul className="search-list search-list-2">
                    {initialCategories.map((category) => (
                      <li
                        key={category}
                        onClick={() => handleCategorySelect2(category)}
                      >
                        {category}
                      </li>
                    ))}
                  </ul>
                ) : (
                  show3 &&
                  searchResults2.length > 0 && (
                    <ul className="search-list search-list-2">
                      {searchResults2.map((category) => (
                        <li
                          key={category}
                          onClick={() => handleCategorySelect2(category)}
                        >
                          {category}
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </div>
            </div>

            <div className="filter">
              <h1 className="total-story">
                <span>
                  {currentCategory
                    ? `${mappable?.length} Story`
                    : stories === 1
                    ? `${stories} story`
                    : stories === 0
                    ? `0 story`
                    : `${stories} stories`}
                </span>{" "}
                {
                  windowWidth > 438 && <div style={{display:'inline'}}>                for you to read
                  </div>
                }
              </h1>
            </div>

            <section className="section-3">
              <LatestStories handlelatestStories={handlelatestStories} />
            </section>

            {windowWidth > 435 ? (
              <div>
                {selectedValue && (
                  <div className="container-fluid">
                    <section className="item-section-main">
                      <div className="item-section-container">
                        {check && mappable && sorted(mappable)}
                      </div>
                    </section>
                  </div>
                )}

                {(!menu || search.length === 0) && (
                  <div className="container">
                    <section className="item-section-main">
                      <div className="item-section-container">
                        {check && mappable && sorted(mappable)}
                      </div>
                    </section>
                  </div>
                )}

                {search.length > 0 && menu && (
                  <div className="container">
                    <section className="item-section-main">
                      <div className="item-section-container">
                        {sorted(mappable)}
                      </div>
                    </section>
                  </div>
                )}
              </div>
            ) : (
              <div className="container-fluid">
                <section className="item-section-main">
                  <Swiper
                    effect="coverflow"
                    // grabCursor='true'
                    centeredSlides="true"
                    slidesPerView={3}
                    coverflowEffect={{
                      rotate: 0,
                      stretch: 0,
                      depth: 100,
                      modifier: 1,
                      slideShadows: false,
                    }}
                    // onSwiper={handleSwiperInit}
                    // onSlideChange={handleSlideChange}
                  >
                    {/* <div className="swiper-wrapper" > */}
                    {(() => {
                      const sortedMappable = mappable.sort((a, b) => {
                        const dateA = new Date(
                          formattedDate2(Object.values(a[1])[4])
                        );
                        const dateB = new Date(
                          formattedDate2(Object.values(b[1])[4])
                        );

                        if (dateA < dateB) {
                          return flipped ? 1 : -1;
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
                      });
                      return sortedMappable.map((items, index) => {
                        const random = Math.random() * 4;
                        return (
                          <SwiperSlide key={random} className="swiper-slide">
                            {paragraph(Object.values(items[1]))}
                          </SwiperSlide>
                        );
                      });
                    })()}
                    {/* </div> */}
                  </Swiper>
                </section>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
