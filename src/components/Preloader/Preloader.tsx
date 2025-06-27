import React from 'react';
import { TypeAnimation } from 'react-type-animation';
import './Preloader.css';

interface PreloaderProps {
  onAnimationComplete: () => void;
  isFading: boolean;
}

const Preloader: React.FC<PreloaderProps> = ({ onAnimationComplete, isFading }) => {
  return (
    <div className={`preloader-container ${isFading ? 'fade-out' : ''}`}>
      <TypeAnimation
        sequence={[
          'Building a better tomorrow.',
          1000,
          'Visualizing climate data.',
          1000,
          'Empowering urban planners.',
          1000,
          'ClimaGrid.',
          1500,
          () => {
            onAnimationComplete();
          },
        ]}
        wrapper="span"
        cursor={true}
        repeat={0}
        className="preloader-text"
        speed={50}
        style={{ whiteSpace: 'pre-line' }}
      />
    </div>
  );
};

export default Preloader;
