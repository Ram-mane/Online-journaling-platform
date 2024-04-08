import React, { useEffect, useState } from "react";

import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { database } from "./Story";

import { List } from "./Story";
import "./LatestStories.css";
import { Card } from "reactstrap";
import { useNavigate } from "react-router-dom";

const LatestStories = ({ handlelatestStories }) => {
  const [popularCats, setPopularCats] = useState([]);
  const [popularCatDetails, setPopularCatDetails] = useState([]);
  const [clickedCatDesc, setClickedCatDesc] = useState([]);
  const [randomCatDesc, setRandomCatDesc] = useState([]);
  const [catClicked, setCatClicked] = useState(false);
  const [clickedCat, setClickedCat] = useState("");

  const navigate = useNavigate();
  useEffect(() => {
    const popularCat = async () => {
      try {
        const snapshot = await get(ref(database, `List`));
        if (snapshot.exists()) {
          const categoryData = snapshot.val();
          const categoryArray = Object.entries(categoryData);

          // Sort categories by number of stories in descending order
          categoryArray.sort(
            ([, a], [, b]) => Object.keys(b).length - Object.keys(a).length
          );

          // Extract the names of the first 10 categories
          const top10Categories = categoryArray
            .slice(0, 10)
            .map(([categoryName]) => categoryName);

          // Set the state or perform any further actions with the top 10 categories
          setPopularCats(top10Categories);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    };

    popularCat();
  }, []);

  const categoryDetails = async (category) => {
    try {
      const snapshot = await get(
        ref(database, `List/${category?.toUpperCase()}`)
      );

      if (snapshot.exists()) {
        const noOfStories = Object.entries(snapshot.val());
        return noOfStories;
      } else {
        return 0;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchCatDetails = async () => {
      const catDetails = await Promise.all(
        popularCats.map((cat) => categoryDetails(cat))
      );
      setPopularCatDetails(catDetails);
    };

    fetchCatDetails();
  }, []);

  useEffect(() => {
    const getRandomDescription = async () => {
      const randomIndex = Math.floor(Math.random() * popularCats.length);

      const randomCat = popularCats[randomIndex];

      setClickedCat(randomCat);
      try {
        const catD = await categoryDetails(randomCat);
        if (catD === 0) {
          return;
        }
        const descriptions = catD.map((item) => item);
        setRandomCatDesc(descriptions);
      } catch (error) {
        console.error("Error fetching category details:", error);
      }
    };
    getRandomDescription();
  }, [popularCats]);

  const handleCatClick = async (cat) => {
    setClickedCat(cat);
    try {
      const catD = await categoryDetails(cat);
      const descriptions = catD.map((item) => item);
      setClickedCatDesc(descriptions);
      setCatClicked(true);
    } catch (error) {
      console.error("Error fetching category details:", error);
    }
  };
  const handleDescClicked = (catClicked) => {
    let lowercaseCatClicked = catClicked?.[1]?.category?.toLowerCase();
   

    let subject = catClicked?.[1]?.subject?.toLowerCase();


    handlelatestStories(catClicked);
    navigate(`/${lowercaseCatClicked}`);
    // window.location.reload();
  };

  return (
    <div className="container-latest">
      <h3>Top Searches</h3>
      <div className="latest-stories">
        {popularCats.map((cat, index) => (
          <div className="cat-name" key={index}>
            <span onClick={() => handleCatClick(cat)}>{cat}</span>
          </div>
        ))}
      </div>
      <h3 style={{ marginTop: "-8%" }}>Trending Stories On Sysu</h3>

      <div className="latest-stories-container">
        <h4 style={{ position: "relative", left: "2%" , fontFamily:'var(--ff-lato)' , fontWeight:'600'}}>{clickedCat}</h4>
        {catClicked
          ? clickedCatDesc.map((desc, index) => {
              return (
                <div
                  className="story-container"
                  key={index}
                  onClick={() => handleDescClicked(desc)}
                  
                >
                  <div
                    style={{
                      fontFamily: "var(--ff-lancelot)",
                      fontWeight: "400",
                      fontSize: "2rem",
                    }}
                  >
                    {desc?.[1]?.subject}{" "}
                  </div>
                  <span style={{ cursor: "pointer" }}>
                    {desc?.[1]?.description}
                  </span>
                </div>
              );
            })
          : randomCatDesc.map((desc, index) => {
              return (
                <div
                  className="story-container"
                  key={index}
                  onClick={() => handleDescClicked(desc)}
                >
                  <div
                    style={{
                      fontFamily: "var(--ff-lancelot)",
                      fontWeight: "400",
                      fontSize: "2rem",
                    }}
                  >
                    {desc?.[1]?.subject}{" "}
                  </div>

                  <span style={{ cursor: "pointer" }}>
                    {desc?.[1]?.description}
                  </span>
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default LatestStories;
