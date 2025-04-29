import React, { useState } from 'react';
import { GearItem } from '../../types';
import { useApp } from '../../context/AppContext';

interface GearRecommendationsProps {
  items: GearItem[];
}

const GearRecommendations: React.FC<GearRecommendationsProps> = ({ items }) => {
  const { user, saveChecklist } = useApp();
  const [selectedItems, setSelectedItems] = useState<GearItem[]>([]);
  const [checklistName, setChecklistName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  const categories = [...new Set(items.map(item => item.category))];

  const handleAddToChecklist = (item: GearItem) => {
    if (selectedItems.some(i => i.id === item.id)) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleSaveChecklist = async () => {
    if (!user) {
      alert('Please sign in to save your checklist');
      return;
    }

    if (!checklistName) {
      alert('Please enter a name for your checklist');
      return;
    }

    if (selectedItems.length === 0) {
      alert('Please select at least one item for your checklist');
      return;
    }

    const checklist = {
      id: Date.now().toString(),
      userId: user.id,
      name: checklistName,
      items: selectedItems,
      activity: items[0]?.activity || '',
      location: '',
      season: items[0]?.season || '',
      experienceLevel: items[0]?.experienceLevel || '',
      budget: items.reduce((sum, item) => sum + item.price, 0),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await saveChecklist(checklist);
    setShowSaveModal(false);
    setChecklistName('');
    setSelectedItems([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Recommended Gear</h2>
        {selectedItems.length > 0 && (
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Save Checklist ({selectedItems.length} items)
          </button>
        )}
      </div>

      {categories.map(category => (
        <div key={category} className="mb-8">
          <h3 className="text-xl font-semibold mb-4 capitalize">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items
              .filter(item => item.category === category)
              .map(item => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h4 className="font-semibold">{item.name}</h4>
                  <p className="text-gray-600 text-sm mb-2">{item.brand}</p>
                  <p className="text-sm mb-2">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">${item.price}</span>
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1">{item.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAddToChecklist(item)}
                    className={`w-full mt-4 px-4 py-2 ${
                      selectedItems.some(i => i.id === item.id)
                        ? 'bg-green-700'
                        : 'bg-green-500'
                    } text-white rounded-lg`}
                  >
                    {selectedItems.some(i => i.id === item.id) ? 'Added' : 'Add to Checklist'}
                  </button>
                </div>
              ))}
          </div>
        </div>
      ))}

      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Save Your Checklist</h3>
            <input
              type="text"
              value={checklistName}
              onChange={(e) => setChecklistName(e.target.value)}
              placeholder="Enter checklist name"
              className="w-full p-2 border rounded-lg mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChecklist}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GearRecommendations; 