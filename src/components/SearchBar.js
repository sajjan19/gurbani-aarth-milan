import React, { useState } from 'react';
import './SearchBar.css'; // CSS for styling the search bar

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
  
    if (newValue.trim() === '') {
      setErrorMessage('');
      onSearch(''); // Clear the search results when the input is empty
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim() === '') {
      setErrorMessage('Please insert a message');
      setQuery(''); // Clear the query if nothing is entered
    } else {
      setErrorMessage('');
      if (onSearch) {
        onSearch(query);
      }
      setQuery(''); // Clear the input field after a successful search
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={handleInputChange}
      />
      <button type="submit">Search</button>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </form>
  );
}

export default SearchBar;
