import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ref,
  get,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { database } from "./Story";
import { toast } from "react-toastify";

export default function Pop({ onChildValue }) {
  const [popularCats, setPopularCats] = useState([]);
  const [sortedFavouriteTopics, setSortedFavouriteTopics] = useState([]);

  // Component to render each list item
  function ListItem({ value }) {
    const handleClick = () => {
      onChildValue(value);

      // navigate(`/${value}`);
    };

    return <li onClick={handleClick}>{value}</li>;
  }

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
          const top6Categories = categoryArray
            .slice(0, 6)
            .map(([categoryName]) => categoryName);

          // Set the state or perform any further actions with the top 10 categories
          setPopularCats(top6Categories);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    };

    popularCat();
  }, []);
  console.log("popular cats ", popularCats);

  useEffect(() => {
    const savedCategory = JSON.parse(localStorage.getItem("starClicked")) || {};
  
    const favouriteTopics = Object.keys(savedCategory).filter(
      (category) => savedCategory[category]
    );
  
    const fetchAndSortFavouriteTopics = async () => {
      try {
        // Fetch story count for each favourite topic
        const storyCounts = await Promise.all(
          favouriteTopics.map(async (category) => {
            const snapshot = await get(ref(database, `List/${category}`));
            return snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
          })
        );
  
        // Combine topics and their corresponding story counts into an array of objects
        const favouriteTopicsWithCounts = favouriteTopics.map(
          (topic, index) => ({
            topic,
            storyCount: storyCounts[index],
          })
        );
  
        // Sort the array based on story counts in descending order
        favouriteTopicsWithCounts.sort((a, b) => b.storyCount - a.storyCount);
  
        // Extract sorted topics from the sorted array
        const sortedTopics = favouriteTopicsWithCounts
          .slice(0, 6) // Limit to the first 6 entries
          .map((item) => item.topic);
  
        // Set the state with the sorted favourite topics
        setSortedFavouriteTopics(sortedTopics);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchAndSortFavouriteTopics();
  }, [localStorage.getItem("starClicked")]);
  console.log('sorted fav topics' , sortedFavouriteTopics)
  

  
    const displayTopics = Array.from(sortedFavouriteTopics);
    let remainingSlot = 7 - displayTopics.length;
    let pushedCount = 0;
    
    for (let i = 0; i < remainingSlot && i < popularCats.length; i++) {
        const currentPopularCat = popularCats[i]; // Renamed to avoid naming conflict
        console.log("popular cats", currentPopularCat);
        if (!displayTopics.includes(currentPopularCat) && pushedCount < remainingSlot) {
            displayTopics.push(currentPopularCat);
            pushedCount++; // Increment pushedCount only when a topic is pushed
        }
    }
    console.log("display topics", displayTopics);
    

    return (
      <div className="popular">
        {/* Display  header based on whether there are favourite topics or popular topics*/}
        <h1>
          {sortedFavouriteTopics.length > 0 ? "Categories for you" : "Popular Categories"}
        </h1>
        <div className="list">
          <ul className="list-items">
            {/* Render the  list of topics */}
            {sortedFavouriteTopics.length > 0
              ? displayTopics.map((topic, index) => (
                  <ListItem key={index} value={topic} />
                ))
              : popularCats.map((topic) => (
                  <ListItem key={topic} value={topic} />
                ))}
          </ul>
        </div>
      </div>
    );
}
