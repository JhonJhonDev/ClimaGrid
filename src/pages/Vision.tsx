import React from 'react';
import { Link } from 'react-router-dom';
import './Vision.css';

const Vision: React.FC = () => {
  return (
    <div className="vision-container">
      <nav className="navbar">
        <Link to="/" className="nav-logo">ClimaGrid</Link>
        <div className="nav-links">
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/vision" className="nav-link">Vision</Link>
          <Link to="/builder" className="nav-cta">Start Building</Link>
        </div>
      </nav>
      <div className="vision-content">
        <blockquote className="vision-quote">
          "We see a future where every city is a testament to the harmony between human ambition and nature's wisdom."
        </blockquote>
      </div>
    </div>
  );
};

export default Vision;
