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
import { List } from "./Story";
import { storyCount } from "./Story";

export default function Popular({ onChildValue }) {
  const [displayTopics, setDisplayTopics] = useState([]);
  const [hasFavouriteTopics, setHasFavouriteTopics] = useState(false);

  // List of popular topics
  const popularTopics = [
    "TRAVELLING",
    "BANGALORE STORIES",
    "GOA DIARIES",
    "NITK STUFFS",
    "IIM THINGS",
    "VIKAS MEENA",
  ];

  useEffect(() => {
    const fetchDisplayTopics = async () => {
      try {
        const savedCategory = JSON.parse(localStorage.getItem("starClicked")) || {};
        const favouriteTopics = Object.keys(savedCategory).filter((category) => savedCategory[category]);
        const hasFavouriteTopics = favouriteTopics.length > 0;
          setHasFavouriteTopics(hasFavouriteTopics);
        let topicsToShow = [...popularTopics];
        if (hasFavouriteTopics) {
          const favouriteTopicsWithCounts = await Promise.all(
            favouriteTopics.map(async (category) => {
              const snapshot = await get(ref(database, `List/${category.toUpperCase()}`));
              if (snapshot.exists()) {
                return { category, storyCount: Object.keys(snapshot.val()).length };
              } else {
                return { category, storyCount: 0 }; // Set storyCount to 0 if snapshot doesn't exist
              }
            })
          );
          // Sort favourite topics by story count in descending order
          favouriteTopicsWithCounts.sort((a, b) => b.storyCount - a.storyCount);
          // Limit favourite topics to a maximum of 6
          topicsToShow = favouriteTopicsWithCounts.slice(0, 6).map(({ category }) => category);
        } else {
          // No favourite topics, show the first 6 popular topics
          topicsToShow = popularTopics.slice(0, 6);
        }
        // Fill remaining slots with popular topics if needed
        if (topicsToShow.length < 6) {
          const remainingPopularTopics = popularTopics.filter((topic) => !topicsToShow.includes(topic));
          const remainingSlots = 6 - topicsToShow.length;
          topicsToShow.push(...remainingPopularTopics.slice(0, remainingSlots));
        }
        setDisplayTopics([...topicsToShow]);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error fetching data: " + error.message);
      }
    };
    fetchDisplayTopics();
  }, [localStorage.getItem("starClicked")]);

  // Component to render each list item
  function ListItem({ value }) {
    const handleClick = () => {
      onChildValue(value);
      // navigate(`/${value}`);
    };
    return <li onClick={handleClick}>{value}</li>;
  }

  return (
    <div className="popular">
      <h1>{hasFavouriteTopics ? "Categories for you " : "Popular Categories"}</h1>
      <div className="list">
        <ul className="list-items">
          {displayTopics.map((topic, index) => (
            <ListItem key={index} value={topic} />
          ))}
        </ul>
      </div>
    </div>
  );
}

