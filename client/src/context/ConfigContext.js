import React, { createContext, useContext, useState, useEffect } from 'react';

const ConfigContext = createContext();

const defaultConfig = {
  metadata: {
    name: 'Meeting Metadata',
    enabled: true,
    items: [
      { id: 'title', description: 'Show title in summary', enabled: true },
      { id: 'dateTime', description: 'Show date & time in summary', enabled: true },
      { id: 'participants', description: 'Show participants in summary', enabled: true }
    ]
  },
  keyPoints: {
    name: 'Key Points',
    enabled: true,
    items: [
      { id: 'projectOverview', description: 'Show project overview in summary', enabled: true },
      { id: 'creativeDirection', description: 'Show creative direction in summary', enabled: true }
    ]
  },
  actionItems: {
    name: 'Action Items',
    enabled: true,
    items: [
      { id: 'tasks', description: 'Show tasks in summary', enabled: true },
      { id: 'assignees', description: 'Show assignees in summary', enabled: true },
      { id: 'timing', description: 'Show timing in summary', enabled: true }
    ]
  },
  timeline: {
    name: 'Project Timeline',
    enabled: true,
    items: [
      { id: 'phases', description: 'Show project phases in summary', enabled: true },
      { id: 'milestones', description: 'Show key milestones in summary', enabled: true }
    ]
  }
};

export function ConfigProvider({ children }) {
  // Load config from localStorage or use default
  const [config, setConfig] = useState(() => {
    const savedConfig = localStorage.getItem('minutesConfig');
    return savedConfig ? JSON.parse(savedConfig) : defaultConfig;
  });

  // Save config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('minutesConfig', JSON.stringify(config));
  }, [config]);

  const updateConfig = (sectionId, field, value) => {
    setConfig(prev => {
      if (typeof value === 'object') {
        // Handle full section update
        const newConfig = {
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            ...value
          }
        };
        localStorage.setItem('minutesConfig', JSON.stringify(newConfig));
        return newConfig;
      } else {
        // Handle single field update
        const newConfig = {
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            [field]: value
          }
        };
        localStorage.setItem('minutesConfig', JSON.stringify(newConfig));
        return newConfig;
      }
    });
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    localStorage.setItem('minutesConfig', JSON.stringify(defaultConfig));
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
} 