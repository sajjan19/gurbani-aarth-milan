import React from 'react';
import { NavLink } from 'react-router-dom'; // Import NavLink for active link styling
import './Navigation.css'; // Import CSS for styling

function Navigation() {
  return (
    <nav className="nav-menu">
      <ul>
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}end>Home</NavLink>
        </li>
        <li>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>About</NavLink>
        </li>
        <li>
          <NavLink to="/contact"  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Contact Us</NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
