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
  const [sortedDisplayTopics, setSortedDisplayTopics] = useState([]);
  const [storyCounts, setStoryCounts] = useState({});

  useEffect(() => {
    const storyCountRef = ref(database, "StoryCount");

    onValue(storyCountRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log(`data`, data);
        // Update the state with the fetched storyCounts
        setStoryCounts(data);
      } else {
        console.log("No data available");
      }
    });

    // Clean up the listener when the component unmounts
    return () => {
      // Detach the listener
      onValue(storyCountRef, null);
    };
  }, []);

 



  // Hook to navigate to different pages
  const navigate = useNavigate();

  // Component to render each list item
  function ListItem({ value }) {
    const handleClick = () => {
      onChildValue(value);

      // navigate(`/${value}`);
    };

    return <li onClick={handleClick}>{value}</li>;
  }

  // List of popular topics
  const popularTopics = [
    "TRAVELLING",
    "BANGALORE STORIES",
    "GOA DIARIES",
    "NITK STUFFS",
    "IIM THINGS",
    "IIMB FACTS",
    "SHAYARI",
    "VIKAS MEENA",
  ];





 
  const savedCategory = JSON.parse(localStorage.getItem("starClicked")) || {};

  // Filter out favourite and non-favourite topics based on starClicked by user
  // starClicked true means favourite, false means non-favourite
  const favouriteTopics = Object.keys(savedCategory).filter(
    (category) => savedCategory[category]
  );
  const nonFavouriteTopics = Object.keys(savedCategory).filter(
    (category) => !savedCategory[category]
  );

  // Set to store topics to display the sorted list of topics based on favourite and popular
  // Using a Set to avoid duplication
  const displayTopicsSet = new Set([...favouriteTopics]);
  // console.log(displayTopicsSet.values());

  // Calculate the number of remaining slots as we have to display 10 topics in the list
  var remainingSlots = 8 - displayTopicsSet.size;

  // Loop to fill remaining slots with popular topics
  for (var i = 0; i < remainingSlots && i < popularTopics.length; i++) {
    displayTopicsSet.add(popularTopics[i]);
    // console.log(displayTopicsSet.values());
  }

  // Convert Set back to Array if needed
  const displayTopics = Array.from(displayTopicsSet);
  
  // Function to fetch the number of stories in each category
  const noOfStoriesInEachCategory = async (category) => {
    console.log(`category`, category);
    try {

      


      // Fetch the number of stories in the category
      const snapshot = await get(
        ref(database, `List/${category?.toUpperCase()}`)
      );

      if (snapshot.exists()) {
        const noOfStories = Object.entries(snapshot.val()).length;
        console.log(`no of stories`, noOfStories);
        return noOfStories;
      } else {
        return 0;
      }
    } catch (error) {
      console.error("Error fetching data:");
      throw error; // Propagate the error
    }
  };

  // Using Promise.all to fetch the number of stories for each category concurrently
  const fetchStoriesPromises = displayTopics.map((cat) =>
    noOfStoriesInEachCategory(cat),
    // console.log(`no of stories`, noOfStoriesInEachCategory(cat))

  );

  console.log('featch cat : ',fetchStoriesPromises);

  useEffect(() => {
    Promise.all(fetchStoriesPromises)
      .then((noOfStoriesArray) => {
        // Combine categories and their corresponding story counts into an array of objects
        const categoryStoryCounts = displayTopics.map((category, index) => ({
          category,
          storyCount: noOfStoriesArray[index],
        }));
        console.log(`categoryStoryCounts`, categoryStoryCounts);

        // Sort the array based on story counts in descending order
        categoryStoryCounts.sort((a, b) => b.storyCount - a.storyCount);

        // Extract sorted categories from the sorted array
        const sortedDisplayTopics = categoryStoryCounts.map(
          (item) => item.category
        );
        setSortedDisplayTopics(sortedDisplayTopics);
      })
      .catch((error) => {
        toast.error("Error fetching data" + error);
      });
  }, [localStorage.getItem("starClicked")]);

  return (
    <div className="popular">
      {/* Display  header based on whether there are favourite topics or popular topics*/}
      <h1>
        {favouriteTopics.length > 0 ? "Favourite Topics" : "Popular Topics"}
      </h1>
      <div className="list">
        <ul className="list-items">
          {/* Render the  list of topics */}
          {favouriteTopics.length > 0
            ? sortedDisplayTopics.map((topic) => (
                <ListItem key={topic} value={topic} />
              ))
            : popularTopics.map((topic) => (
                <ListItem key={topic} value={topic} />
              ))}
        </ul>
      </div>
    </div>
  );
}
