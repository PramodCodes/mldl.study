import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navbar from './Navbar';
import categorizedVideos from '../../categorizedPrerequisiteContent';
import Modal from './Modal';
import ReactGA from 'react-ga4';

const topics = [
  { id: 1, name: 'Linear Algebra', x: 25, y: 30, color: '#10b981' },
  { id: 2, name: 'Calculus', x: 50, y: 30, color: '#10b981' },
  { id: 3, name: 'Probability and Statistics', x: 75, y: 30, color: '#10b981' },
  { id: 4, name: 'Matrices', x: 25, y: 50, color: '#34d399' },
  { id: 5, name: 'Python', x: 50, y: 50, color: '#34d399' }
];

const connections = [
  { from: 1, to: 4 },
  { from: 2, to: 4 },
  { from: 3, to: 4 },
  { from: 4, to: 5 }
];

const PrerequisiteRoadmap = () => {
  // Track page view
  ReactGA.send({ hitType: 'pageview', page: window.location.pathname });

  // Primary states for roadmap and dark mode
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [hoveredTopic, setHoveredTopic] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [topicProgress, setTopicProgress] = useState({});
  const containerRef = useRef(null);

  // Load progress and dark mode states on mount; adjust for mobile view
  useEffect(() => {
    const savedProgress = JSON.parse(localStorage.getItem('prerequisiteRoadmapProgress')) || {};
    setTopicProgress(savedProgress);

    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    document.documentElement.classList.toggle('dark', savedDarkMode);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Toggle dark mode and persist in localStorage
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
  };

  const calculateOverallProgress = () => {
    if (Object.keys(topicProgress).length === 0) return 0;
    const totalProgress = topics.reduce((acc, topic) => {
      const topicVideos = categorizedVideos[topic.name] || [];
      if (topicVideos.length === 0) return acc;
      const completedVideos = topicVideos.filter(video =>
        topicProgress[`${topic.name}_${video.url}`] === true
      ).length;
      return acc + (completedVideos / topicVideos.length);
    }, 0);
    return Math.round((totalProgress / topics.length) * 100);
  };

  const overallProgress = calculateOverallProgress();

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
  };

  const closeModal = () => {
    setSelectedTopic(null);
  };

  const updateTopicProgress = (topicName, videoUrl, completed) => {
    const progressKey = `${topicName}_${videoUrl}`;
    const newProgress = { ...topicProgress, [progressKey]: completed };
    setTopicProgress(newProgress);
    localStorage.setItem('prerequisiteRoadmapProgress', JSON.stringify(newProgress));
  };

  const getConnectionColor = (from, to) => {
    if (hoveredTopic) {
      if (from === hoveredTopic.id || to === hoveredTopic.id) {
        return darkMode ? '#60a5fa' : '#3b82f6';
      }
      return darkMode ? '#333333' : '#e5e7eb';
    }
    return darkMode ? '#4B5563' : '#d1d5db';
  };

  const MobileView = () => (
    <div className="w-full max-w-lg px-4">
      <div className="space-y-3">
        {topics.map((topic) => {
          const topicVideos = categorizedVideos[topic.name] || [];
          const completedVideos = topicVideos.filter(video =>
            topicProgress[`${topic.name}_${video.url}`] === true
          ).length;
          const progressPercentage = topicVideos.length > 0 
            ? Math.round((completedVideos / topicVideos.length) * 100)
            : 0;
          return (
            <div key={topic.id} className="w-full rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
              <button
                className="w-full p-3 rounded-lg text-white shadow-sm transition-all duration-300 flex items-center space-x-3"
                style={{ backgroundColor: topic.color }}
                onClick={() => handleTopicClick(topic)}
              >
                <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-sm font-medium shrink-0">
                  {topic.id}
                </div>
                <span className="text-sm text-left flex-grow">{topic.name}</span>
                <div className="w-16 bg-white/30 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <svg className="w-4 h-4 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const DesktopView = () => (
    <div ref={containerRef} className="relative w-full max-w-6xl h-[600px] rounded-lg overflow-hidden p-4">
      <svg className="absolute top-0 left-0 w-full h-full">
        {connections.map((conn, index) => {
          const from = topics.find(t => t.id === conn.from);
          const to = topics.find(t => t.id === conn.to);
          return (
            <line
              key={index}
              x1={`${from.x}%`}
              y1={`${from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke={getConnectionColor(conn.from, conn.to)}
              strokeWidth="1.5"
              className="transition-all duration-300"
            />
          );
        })}
      </svg>
      {topics.map((topic) => {
        const topicVideos = categorizedVideos[topic.name] || [];
        const completedVideos = topicVideos.filter(video =>
          topicProgress[`${topic.name}_${video.url}`] === true
        ).length;
        const progressPercentage = topicVideos.length > 0 
          ? Math.round((completedVideos / topicVideos.length) * 100)
          : 0;
        return (
          <div
            key={topic.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${topic.x}%`, top: `${topic.y}%` }}
          >
            <button
              className={`relative px-3 py-2 rounded-md text-white shadow-sm transform transition-all duration-300 hover:scale-105 hover:shadow-md ${hoveredTopic && hoveredTopic.id !== topic.id ? 'opacity-60' : 'opacity-100'}`}
              style={{ backgroundColor: topic.color, maxWidth: '180px' }}
              onClick={() => handleTopicClick(topic)}
              onMouseEnter={() => setHoveredTopic(topic)}
              onMouseLeave={() => setHoveredTopic(null)}
            >
              <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-medium">
                {topic.id}
              </div>
              <span className="text-xs sm:text-sm whitespace-normal leading-tight block mb-1">{topic.name}</span>
              <div className="w-full bg-white/30 rounded-full h-1">
                <div className="bg-white h-1 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Prerequisites Roadmap | Your Roadmap to AI Mastery</title>
        <meta name="description" content="Kickstart your Machine Learning journey with our comprehensive Prerequisites Roadmap. Master essential math topics and Python skills to prepare for the ML Roadmap." />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://mldl.study/prerequisites" />
      </Helmet>

      {/* Navbar with active dark mode toggle */}
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center px-4 mt-4">
          Machine Learning Prerequisites Roadmap
        </h1>

        <div className="w-full px-4 mt-4 mb-8 sm:mt-8">
          <div className="max-w-xl mx-auto bg-emerald-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center transition-all duration-300 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-emerald-800 dark:text-white mb-3 flex items-center justify-center">
              <span className="mr-2">🚀</span> Prerequisites Roadmap Guide <span className="ml-2">📚</span>
            </h2>
            <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 space-y-3">
              <p>
                <strong>👉 For Learners with Basic Math Knowledge:</strong> If you're comfortable with fundamental math concepts, feel free to <strong>skip directly to the ML Roadmap</strong>. Come back to these prerequisite videos only if you encounter challenges along the way.
              </p>
              <p>
                <strong>🌱 For Beginners:</strong> Start here! These foundational videos will help you build a solid understanding of the mathematical concepts crucial for machine learning.
              </p>
              <p>
                <strong>💡 Python Learning Tip:</strong> No need to complete every single video. Choose the resources that best suit your learning style and current knowledge level.
              </p>
              <p>
                <strong>👉 General Tip:</strong> For The Mathematics for Machine Learning Book, read it in parts. Refer to the book when you stumble across a new topic and then refer to the corresponding chapter.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-xl px-4 mb-4">
          <div className="bg-green-100 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-green-800 dark:text-white">Overall Progress</span>
              <span className="text-sm font-bold text-green-800 dark:text-white">{overallProgress}%</span>
            </div>
            <div className="w-full bg-green-200 dark:bg-gray-700 rounded-full h-2.5">
              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${overallProgress}%` }}></div>
            </div>
          </div>
        </div>

        <p className="text-sm mb-6 text-gray-600 dark:text-gray-400 text-center px-4">
          {isMobile
            ? 'Follow the sequence to master prerequisites'
            : 'Follow the numbered path to master ML prerequisites'}
        </p>

        {isMobile ? <MobileView /> : <DesktopView />}

        {selectedTopic && (
          <Modal
            topic={selectedTopic}
            onClose={closeModal}
            videoSource={categorizedVideos}
            existingProgress={topicProgress}
            onProgressUpdate={updateTopicProgress}
            darkMode={darkMode}
          />
        )}

        <div className="pb-8"></div>
      </div>
    </>
  );
};

export default PrerequisiteRoadmap;
