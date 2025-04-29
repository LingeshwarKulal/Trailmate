import React, { useState } from 'react';
import { QuizAnswers } from '../../types';
import { useApp } from '../../context/AppContext';

const Quiz: React.FC = () => {
  const { generateRecommendations } = useApp();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<QuizAnswers>({
    activity: '',
    location: '',
    season: '',
    experienceLevel: '',
    budget: 0
  });

  const activities = ['Camping', 'Hiking', 'Trekking', 'Climbing'];
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
  const experienceLevels = ['Beginner', 'Intermediate', 'Advanced'];

  const handleInputChange = (field: keyof QuizAnswers, value: string | number) => {
    setAnswers(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateRecommendations(answers);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">What activity are you planning?</h2>
            <div className="grid grid-cols-2 gap-4">
              {activities.map(activity => (
                <button
                  key={activity}
                  onClick={() => handleInputChange('activity', activity)}
                  className={`p-4 rounded-lg border ${
                    answers.activity === activity
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  {activity}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Where are you going?</h2>
            <input
              type="text"
              value={answers.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter location"
              className="w-full p-2 border rounded-lg"
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">What season is it?</h2>
            <div className="grid grid-cols-2 gap-4">
              {seasons.map(season => (
                <button
                  key={season}
                  onClick={() => handleInputChange('season', season)}
                  className={`p-4 rounded-lg border ${
                    answers.season === season
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  {season}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">What's your experience level?</h2>
            <div className="grid grid-cols-1 gap-4">
              {experienceLevels.map(level => (
                <button
                  key={level}
                  onClick={() => handleInputChange('experienceLevel', level)}
                  className={`p-4 rounded-lg border ${
                    answers.experienceLevel === level
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">What's your budget?</h2>
            <input
              type="number"
              value={answers.budget}
              onChange={(e) => handleInputChange('budget', Number(e.target.value))}
              placeholder="Enter your budget"
              className="w-full p-2 border rounded-lg"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {renderStep()}
        <div className="flex justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Back
            </button>
          )}
          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev + 1)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg ml-auto"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-lg ml-auto"
            >
              Get Recommendations
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Quiz; 