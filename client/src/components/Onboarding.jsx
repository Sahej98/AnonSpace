import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Ghost, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

const SLIDES = [
  {
    icon: Ghost,
    title: 'Welcome to The Void',
    text: 'A place where you can speak your mind freely. No names, no profiles, just thoughts.',
  },
  {
    icon: ShieldCheck,
    title: 'Stay Anonymous',
    text: "We don't track who you are. Your identity is a random key. Don't lose it.",
  },
  {
    icon: Zap,
    title: 'Be Respectful',
    text: 'Anonymity is a shield, not a weapon. Hate speech and bullying are not tolerated.',
  },
];

const Onboarding = () => {
  const { completeOnboarding } = useUser();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      completeOnboarding();
    }
  };

  return (
    <div
      className='centered-page-container'
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <div
        className='chat-page-wrapper small-container'
        style={{ maxWidth: '400px' }}>
        <div
          style={{
            height: '320px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          {SLIDES.map(
            (slide, index) =>
              currentSlide === index && (
                <div key={index} style={{ animation: 'fadeIn 0.5s ease' }}>
                  <div
                    className='icon-wrapper'
                    style={{ margin: '0 auto 2rem' }}>
                    <slide.icon size={48} color='var(--primary)' />
                  </div>
                  <h1 className='chat-page-title'>{slide.title}</h1>
                  <p
                    className='chat-page-subtitle'
                    style={{ marginTop: '1rem' }}>
                    {slide.text}
                  </p>
                </div>
              ),
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'center',
            margin: '2rem 0',
          }}>
          {SLIDES.map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background:
                  i === currentSlide ? 'var(--primary)' : 'var(--glass-border)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        <button className='confess-button' onClick={handleNext}>
          <span>
            {currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
