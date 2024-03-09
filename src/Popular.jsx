import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Popular({ onChildValue }) {

  const navigate = useNavigate();
  // Component to render each list item
  function ListItem({ value }) {
    const handleClick = () => {
      onChildValue(value);
      // navigate(`/${value}`);
      console.log('Clicked:', value);
    };

    return <li onClick={handleClick}>{value}</li>;
  }

  // List of popular topics
  const popularTopics = [
    'ENGINEERING DAYS',
    'BANGALORE STORIES',
    'GOA DIARIES',
    'NITK STUFFS',
    'IIM THINGS',
    'IIMB FACTS',
    'SHAYARI',
    'VIKAS MEENA',
  ];

  // Get the saved actions from localStorage
  const savedCategory = JSON.parse(localStorage.getItem('starClicked')) || {};
  console.log(savedCategory);

  // Filter out favourite and non-favourite topics
  const favouriteTopics = Object.keys(savedCategory).filter((category) => savedCategory[category]);
  const nonFavouriteTopics = Object.keys(savedCategory).filter((category) => !savedCategory[category]);

  console.log('favourite Topics:', favouriteTopics);
  console.log('non Favourite Topics:', nonFavouriteTopics);

  // Array to store topics to display
  var displayTopics = [...favouriteTopics];

  // Calculate the number of remaining slots
  var remainingSlots = 10 - displayTopics.length;

  // Loop to fill remaining slots with popular topics
  for (var i = 0; i < remainingSlots && i < popularTopics.length; i++) {
    displayTopics.push(popularTopics[i]);
  }

  console.log('displayTopics Topics:', displayTopics);

  return (
    <div className='popular'>
      {/* Display appropriate header based on whether there are favourite topics */}
      <h1>{favouriteTopics.length > 0 ? 'Favourite Topics' : 'Popular Topics'}</h1>
      <div className='list'>
        <ul className='list-items'>
          {/* Render the appropriate list of topics */}
          {favouriteTopics.length > 0
            ? displayTopics.map((topic) => <ListItem key={topic} value={topic}  />)
            : popularTopics.map((topic) => <ListItem key={topic} value={topic} />)}
        </ul>
      </div>
    </div>
  );
}
