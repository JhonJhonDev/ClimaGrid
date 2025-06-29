import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about-container">
      <nav className="navbar">
        <Link to="/" className="nav-logo">ClimaGrid</Link>
        <div className="nav-links">
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/vision" className="nav-link">Vision</Link>
          <Link to="/builder" className="nav-cta">Start Building</Link>
        </div>
      </nav>
      <main className="about-main">
        <div className="about-header">
          <h1 className="about-title">We are the architects of a better tomorrow.</h1>
        </div>
        <div className="about-content">
          <div className="about-mission">
            <h2>Our Mission</h2>
            <p>
              At ClimaGrid, our mission is to democratize climate science and empower urban planners, architects, and visionaries to design cities that are not only aesthetically pleasing but also environmentally sustainable. We believe that the most powerful tool for change is knowledge, and we're committed to providing it in the most accessible and intuitive way possible.
            </p>
          </div>
          <div className="about-team">
            <h2>The Team</h2>
            <p>Our team is composed of visionary urban planners, data scientists, and software engineers dedicated to making a difference. We believe in the power of technology to solve real-world problems and are passionate about creating a sustainable future for all.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
