import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Builder from './pages/Builder';
import Vision from './pages/Vision';
import About from './pages/About';
import Results from './pages/Results';
import Preloader from './components/Preloader/Preloader';

function App() {
  const [showPreloader, setShowPreloader] = useState(true);
  const [isFading, setIsFading] = useState(false);

  const handleAnimationComplete = () => {
    setIsFading(true);
    setTimeout(() => {
      setShowPreloader(false);
    }, 500); // Match CSS transition duration
  };

  return (
    <>
      {showPreloader ? (
        <Preloader
          onAnimationComplete={handleAnimationComplete}
          isFading={isFading}
        />
      ) : (
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/builder" element={<Builder />} />
            <Route path="/vision" element={<Vision />} />
            <Route path="/about" element={<About />} />
            <Route path="/results" element={<Results />} />
          </Routes>
        </Router>
      )}
    </>
  );
}

export default App;
