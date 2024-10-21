import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import gniLogo from '../assets/gni-logo.png'; // Import the logo
import './Logo.css'; // Optional: Custom CSS for the logo

// Reusable Logo component
function Logo() {
  return (
    <div className="logo-container">
            <Link to="/"> {/* Link to the homepage */}
        <img src={gniLogo} alt="GNI Logo" className="logo" />
      </Link>
    </div>
  );
}

export default Logo;
