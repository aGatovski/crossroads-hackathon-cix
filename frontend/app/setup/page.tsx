'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FrontPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [choosingOther, setChoosingOther] = useState(false);

  const languages = [
    'English', 'Bulgarian', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Dutch', 'Swedish', 
    'Norwegian', 'Danish', 'Finnish', 'Polish', 'Czech', 'Hungarian', 'Greek', 
    'Turkish','Thai', 'Vietnamese', 'Indonesian', 'Malay'
  ];
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  // Remove duplicate categories
  const categories = Array.from(new Set([
    'General', 'Science', 'Technology', 'History', 'Art', 'Culture', 'Food', 'Animals'
  ]));

  const handleLanguageSubmit = () => {
    if (language.trim()) {
      setStep(2);
    }
  };

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    setStep(3);
  };

  const handleDifficultySelect = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    setStep(4);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setStep(5);
  };

  const handleOtherCategory = () => {
    setChoosingOther(true);
    setCustomCategory('');
  };

  const handleCustomCategorySubmit = () => {
    if (customCategory.trim()) {
      setSelectedCategory(customCategory.trim());
      setStep(5);
      setChoosingOther(false);
    }
  };

  const handleStartGame = () => {
    // Save configuration to localStorage
    const config = {
      language,
      level: selectedLevel,
      difficulty: selectedDifficulty,
      category: selectedCategory,
    };
    localStorage.setItem('gameConfig', JSON.stringify(config));
    console.log('Starting game with:', config);
    router.push('/cix');
  };

  // Generate stars
  useEffect(() => {
    const createStars = () => {
      const starsContainer = document.getElementById('stars-container');
      if (!starsContainer) return;
      
      starsContainer.innerHTML = '';
      
      for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        starsContainer.appendChild(star);
      }
    };
    
    createStars();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-8 bg-black relative overflow-hidden font-mono">     
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{ backgroundImage: 'url(/images/default_bg.jpg)' }}
      ></div>
      <div className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center z-10">
        {/* Step 1: Language Input */}
        {step === 1 && (
          <div className="w-full text-center flex flex-col justify-center items-center">
            <h1 className="text-5xl md:text-5xl font-black text-white mb-8 tracking-wider">
              &gt; SELECT LANGUAGE_
            </h1>
            <div className="w-3/4 backdrop-blur-sm border-2 border-white/30 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.15)] p-6">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="custom-select w-full px-3 py-4 text-md rounded-md border-2 border-white/40 bg-transparent backdrop-blur-sm text-white focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all mb-4 font-mono"
              >
                <option value="">Select a language</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <button
                onClick={handleLanguageSubmit}
                disabled={!language.trim()}
                className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 border-2 border-white/50 hover:border-white text-white text-md font-semibold rounded-md shadow-[0_0_8px_rgba(255,255,255,0.15)] hover:shadow-[0_0_12px_rgba(255,255,255,0.25)] transform hover:scale-101 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                [ CONTINUE ]
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Level Selection */}
        {step === 2 && (
          <div className="w-full text-center flex flex-col justify-center items-center">
            <h1 className="text-5xl md:text-5xl font-black text-white mb-8 tracking-wider">
              &gt; SELECT LEVEL_
            </h1>
            <div className="w-3/4 backdrop-blur-sm border-2 border-white/30 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.15)] p-6">
              <p className="text-base text-white/70 mb-4">
                LANGUAGE: <span className="font-bold text-white">[{language}]</span>
              </p>
              <div className="grid grid-cols-5 gap-3">
                {levels.map((level) => (
                  <button
                    key={level}
                    onClick={() => handleLevelSelect(level)}
                    className="px-3 py-2 text-xl font-bold bg-white/10 hover:bg-white/20 border-2 border-white/50 hover:border-white text-white rounded-lg shadow-[0_0_6px_rgba(255,255,255,0.15)] hover:shadow-[0_0_10px_rgba(255,255,255,0.25)] transform hover:scale-101 transition-all cursor-pointer"
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Difficulty Selection */}
        {step === 3 && (
          <div className="w-full text-center flex flex-col justify-center items-center">
            <h1 className="text-5xl md:text-5xl font-black text-white mb-8 tracking-wider">
              &gt; SELECT DIFFICULTY_
            </h1>
            <div className="w-3/4 backdrop-blur-sm border-2 border-white/30 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.15)] p-6">
              <p className="text-base text-white/70 mb-4">
                [{language}] - <span className="font-bold text-white">[{selectedLevel}]</span>
              </p>
              <div className="grid grid-cols-3 gap-3">
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => handleDifficultySelect(difficulty)}
                    className="px-4 py-2 text-xl font-bold bg-white/10 hover:bg-white/20 border-2 border-white/50 hover:border-white text-white rounded-lg shadow-[0_0_6px_rgba(255,255,255,0.15)] hover:shadow-[0_0_10px_rgba(255,255,255,0.25)] transform hover:scale-101 transition-all cursor-pointer uppercase"
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Category Selection */}
        {step === 4 && (
          <div className="w-full text-center flex flex-col justify-center items-center">
            <h1 className="text-5xl md:text-5xl font-black text-white mb-8 tracking-wider">
              &gt; SELECT CATEGORY_
            </h1>
            <div className="w-3/4 backdrop-blur-sm border-2 border-white/30 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.15)] p-6">
              <p className="text-base text-white/70 mb-4">
                [{language}] - [{selectedLevel}] - <span className="font-bold text-white">[{selectedDifficulty}]</span>
              </p>
              {!choosingOther ? (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-4 max-h-60 overflow-auto p-0.5">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategorySelect(category)}
                        className={`px-4 py-2 text-md md:text-xl font-bold bg-white/10 hover:bg-white/20 border-2 border-white/50 hover:border-white text-white rounded-lg shadow-[0_0_6px_rgba(255,255,255,0.15)] hover:shadow-[0_0_10px_rgba(255,255,255,0.25)] transform hover:scale-101 transition-all cursor-pointer uppercase`}
                      >
                        {category}
                      </button>
                    ))}
                    <button
                      onClick={handleOtherCategory}
                      className="px-4 py-2 text-md md:text-xl font-bold bg-white/10 hover:bg-white/20 border-2 border-yellow-400/60 hover:border-yellow-200 text-yellow-200 rounded-lg shadow-[0_0_6px_rgba(255,255,0,0.12)] hover:shadow-[0_0_10px_rgba(255,255,0,0.18)] transform hover:scale-101 transition-all cursor-pointer uppercase"
                    >
                      Other...
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <input
                    type="text"
                    value={customCategory}
                    autoFocus
                    maxLength={40}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Type your category..."
                    className="w-full px-3 py-3 text-md rounded-md border-2 border-white/40 text-white placeholder-white/50 focus:border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-100 transition-all font-mono bg-transparent"
                  />
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={handleCustomCategorySubmit}
                      disabled={!customCategory.trim()}
                      className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 border-2 border-white/50 hover:border-white text-white font-semibold rounded-md shadow-[0_0_8px_rgba(255,255,255,0.15)] hover:shadow-[0_0_12px_rgba(255,255,255,0.25)] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      [ CONFIRM ]
                    </button>
                    <button
                      onClick={() => {
                        setChoosingOther(false);
                        setCustomCategory('');
                      }}
                      className="px-4 py-2 border-2 border-yellow-200 hover:bg-yellow-800/20 text-yellow-200 font-semibold rounded-md transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Start Game */}
        {step === 5 && (
          <div className="w-full text-center flex flex-col justify-center items-center">
            <h1 className="text-5xl md:text-5xl font-black text-white mb-8 tracking-wider">
              &gt; SYSTEM READY_
            </h1>
            <div className="w-3/4 backdrop-blur-sm border-2 border-white/30 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.15)] p-6">
              <p className="text-base text-white/70 mb-4">
                [{language}] - [{selectedLevel}] - [{selectedDifficulty}] - <span className="font-bold text-white">[{selectedCategory}]</span>
              </p>
              <button
                onClick={handleStartGame}
                className="w-full px-4 py-2 text-xl bg-white/10 hover:bg-white/20 border-2 border-white/50 hover:border-white text-white font-bold rounded-lg shadow-[0_0_8px_rgba(255,255,255,0.15)] hover:shadow-[0_0_12px_rgba(255,255,255,0.25)] transform hover:scale-101 transition-all cursor-pointer"
              >
                [ INITIALIZE GAME ]
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
