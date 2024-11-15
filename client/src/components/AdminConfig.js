import React, { useState } from 'react';
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';

const AdminConfig = () => {
  const { config, updateConfig } = useConfig();

  const handleTitleChange = (sectionId, newTitle) => {
    updateConfig(sectionId, null, {
      ...config[sectionId],
      name: newTitle,
      title: newTitle
    });
  };

  const handleMoveUp = (sectionId) => {
    const sections = Object.entries(config);
    const currentIndex = sections.findIndex(([id]) => id === sectionId);
    
    if (currentIndex > 0) {
      const prevSection = sections[currentIndex - 1];
      const currentOrder = config[sectionId].order || currentIndex;
      const prevOrder = config[prevSection[0]].order || (currentIndex - 1);
      
      // Swap orders
      updateConfig(sectionId, null, {
        ...config[sectionId],
        order: prevOrder
      });
      updateConfig(prevSection[0], null, {
        ...config[prevSection[0]],
        order: currentOrder
      });
    }
  };

  const handleMoveDown = (sectionId) => {
    const sections = Object.entries(config);
    const currentIndex = sections.findIndex(([id]) => id === sectionId);
    
    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];
      const currentOrder = config[sectionId].order || currentIndex;
      const nextOrder = config[nextSection[0]].order || (currentIndex + 1);
      
      // Swap orders
      updateConfig(sectionId, null, {
        ...config[sectionId],
        order: nextOrder
      });
      updateConfig(nextSection[0], null, {
        ...config[nextSection[0]],
        order: currentOrder
      });
    }
  };

  // Sort sections by order
  const sortedSections = Object.entries(config)
    .map(([id, section]) => ({
      id,
      ...section,
      order: section.order || 0
    }))
    .sort((a, b) => a.order - b.order);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-2 text-[#2c5282]">Admin Configuration</h1>
      <p className="text-xl text-gray-600 mb-8">
        Customize the sections that appear in meeting summaries
      </p>

      <div className="space-y-4">
        {sortedSections.map((section, index) => (
          <div key={section.id} className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <Input
                value={section.name || ''}
                onChange={(e) => handleTitleChange(section.id, e.target.value)}
                className="text-lg font-medium max-w-[300px]"
                placeholder="Section Title"
              />
              <div className="flex items-center gap-4">
                <Input
                  value={section.icon || ''}
                  className="w-24 text-center"
                  placeholder="Icon"
                />
                <div className="flex items-center gap-2">
                  <Switch
                    checked={section.enabled}
                    onCheckedChange={(checked) => 
                      updateConfig(section.id, null, { ...section, enabled: checked })
                    }
                  />
                  <span className="text-sm font-medium">
                    {section.enabled ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleMoveUp(section.id)}
                disabled={index === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  index === 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ChevronUp className="w-4 h-4" />
                Move Up
              </button>
              <button
                onClick={() => handleMoveDown(section.id)}
                disabled={index === sortedSections.length - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  index === sortedSections.length - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ChevronDown className="w-4 h-4" />
                Move Down
              </button>
              <button
                onClick={() => updateConfig(section.id, null, { ...section, enabled: false })}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
              >
                <Trash2 className="w-4 h-4" />
                Remove Section
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminConfig; 