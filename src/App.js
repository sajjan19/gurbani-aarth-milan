import './App.css';
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Logo from './components/Logo';
import Navigation from './components/Navigation';
import SearchBar from './components/SearchBar';
import Contact from './components/Contact';
import Footer from './components/Footer';
import GuruGranthImage from './assets/guru-granth.png'; // Import the image

function Home() {
  const [searchResults, setSearchResults] = useState('');

  const handleSearch = (query) => {
    setSearchResults(`You searched for: ${query}`);
  };

  return (
    <div>
      <h1>Gurbani Aarth Milan</h1>
      <h2 style={{ color: 'orange' }}>ਗੁਰਬਾਣੀ ਅਰਥ ਮਿਲਾਨ</h2>
      <SearchBar onSearch={handleSearch} />
      {searchResults && <p>{searchResults}</p>}
    </div>
  );
}

function About() {
  return (
    <div>
      <h1>About</h1>
      <p style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'justify' }}>
        The Gurbani Arth Milaan Project aims to create a digital collection by comparing and merging fifteen translations of the Sri Guru Granth Sahib—eight in Punjabi and seven in English. Since February 2021, a team of 33 research scholars has been working on this project, which is expected to be completed by the end of 2024.
      </p>
      <img src={GuruGranthImage} alt="Guru Granth Sahib" className="responsive-image" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <header className="header">
        <Logo /> {/* Logo on the left */}
        <Navigation /> {/* Navigation on the right */}
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
