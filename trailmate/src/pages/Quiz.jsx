import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const questions = [
  {
    id: 1,
    question: "What's your hiking experience level?",
    options: ["Beginner", "Intermediate", "Advanced", "Expert"],
  },
  {
    id: 2,
    question: "What type of terrain do you prefer?",
    options: ["Flat trails", "Moderate hills", "Steep mountains", "Mixed terrain"],
  },
  {
    id: 3,
    question: "How long do you typically hike?",
    options: ["1-2 hours", "2-4 hours", "4-6 hours", "6+ hours"],
  },
  {
    id: 4,
    question: "What's your preferred hiking season?",
    options: ["Spring", "Summer", "Fall", "Winter"],
  },
];

const Quiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (answer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
  };

  const handleViewTrails = () => {
    navigate('/trails');
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-900 py-20 px-4">
        <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-white mb-6">Your Hiking Profile</h2>
          <div className="space-y-4">
            {questions.map((q, index) => (
              <div key={q.id} className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-300 mb-2">{q.question}</p>
                <p className="text-teal-400 font-semibold">Your answer: {answers[index]}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleRestart}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
              Retake Quiz
            </button>
            <button
              onClick={handleViewTrails}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              View Recommended Trails
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-20 px-4">
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-white">Trail Quiz</h2>
            <span className="text-gray-400">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl text-white">{questions[currentQuestion].question}</h3>
          <div className="grid gap-4">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="p-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-left"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz; 