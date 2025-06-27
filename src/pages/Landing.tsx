import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';


const Navbar: React.FC = () => (
  <nav className="navbar">
    <Link to="/" className="nav-logo">ClimaGrid</Link>
    <div className="nav-links">
      <Link to="/about" className="nav-link">About</Link>
      <Link to="/vision" className="nav-link">Vision</Link>
      <Link to="/builder" className="nav-cta">Start Building</Link>
    </div>
  </nav>
);

const Landing: React.FC = () => {
  return (
    <div className="landing-container">

      <Navbar />
      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-title-container">
              <h1 className="hero-title">ClimaGrid</h1>
              <div className="title-underline"></div>
            </div>
            <p className="hero-subtitle">Design the future. Understand its climate.</p>
            <p className="hero-description">
              A new way of thinking about urban design. We provide a simple, intuitive grid to build your city, and a powerful climate model to see the effects. For the first time, design and climate science work together, beautifully.
            </p>
            <Link to="/builder" className="cta-button">
              Start Building Now
            </Link>
          </div>
        </section>

        <section id="vision" className="comparison-section">
          <h2 className="comparison-title">Build Better Cities. Not Just Faster.</h2>
          <div className="comparison-grid">
            <div className="comparison-card">
              <h3 className="card-title">The Old Way</h3>
              <div className="image-container">
                <img src="/pollutedcity.jpg" alt="Polluted City" className="comparison-image" />
                <div className="emoji-overlay">🤢</div>
              </div>
              <p className="card-description">Rapid growth without foresight leads to environments that are unhealthy for people and the planet.</p>
            </div>
            <div className="comparison-card">
              <h3 className="card-title">The ClimaGrid Way</h3>
              <div className="image-container">
                <img src="/paris.jpg" alt="Healthy City" className="comparison-image" />
                <div className="arrow-overlay">
                  <div className="arrow-text">The city we all deserve.</div>
                </div>
              </div>
              <p className="card-description">Design with climate in mind to create cities that are not only beautiful, but also sustainable and prosperous.</p>
            </div>
          </div>
        </section>

        <section className="how-it-works-section">
          <h2 className="section-title">How It Works</h2>
          <div className="roadmap-container">
            <div className="roadmap-step">
              <div className="roadmap-number">1</div>
              <div className="roadmap-content">
                <h3>Design Your City</h3>
                <p>Use our intuitive grid-based editor to lay out your urban vision with ease.</p>
              </div>
            </div>
            <div className="roadmap-step">
              <div className="roadmap-number">2</div>
              <div className="roadmap-content">
                <h3>Simulate Climate</h3>
                <p>Run a powerful, instantaneous climate simulation to see the real-world impact.</p>
              </div>
            </div>
            <div className="roadmap-step">
              <div className="roadmap-number">3</div>
              <div className="roadmap-content">
                <h3>Analyze & Iterate</h3>
                <p>Understand the results, refine your design, and build a sustainable future.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="final-cta-section">
            <h2 className="final-cta-title">What if your city breathed with you?</h2>
            <p className="final-cta-description">The blueprint of tomorrow is in your hands. Don't just build. Create.</p>
            <Link to="/builder" className="cta-button large">
              Begin Your Design
            </Link>
        </section>

      </main>

      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} ClimaGrid. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
