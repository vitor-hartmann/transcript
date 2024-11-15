import React from 'react';
import { useConfig } from '../context/ConfigContext';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Clock, CheckCircle2, AlertCircle, Lightbulb, Users, FileText } from 'lucide-react';

const MinutesPreview = ({ data }) => {
  const { config } = useConfig();
  if (!data) return null;

  // Get enabled sections and their order from config
  const enabledSections = Object.entries(config)
    .filter(([_, sectionConfig]) => sectionConfig.enabled)
    .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
    .map(([id, section]) => ({
      id,
      ...section
    }));

  const sectionIcons = {
    metadata: <FileText className="w-5 h-5 text-blue-500" />,
    keyPoints: <Lightbulb className="w-5 h-5 text-yellow-500" />,
    actionItems: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    timeline: <Clock className="w-5 h-5 text-purple-500" />
  };

  const renderEmptyState = (sectionId) => (
    <div className="text-gray-500 italic text-sm p-4 bg-gray-50 rounded-lg">
      No relevant information found for this section
    </div>
  );

  const renderSectionContent = (section) => {
    switch (section.id) {
      case 'metadata':
        if (!data.participants?.length) {
          return renderEmptyState('metadata');
        }
        return (
          <div className="space-y-4">
            {section.items.find(item => item.id === 'participants')?.enabled && (
              <div className="flex flex-wrap gap-2">
                {data.participants?.map((participant, index) => (
                  <Badge key={index} variant="outline" className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {participant}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
      case 'keyPoints':
        if (!data.keyPoints?.length) {
          return renderEmptyState('keyPoints');
        }
        return (
          <ul className="space-y-2">
            {data.keyPoints?.map((point, index) => (
              <li key={index} className="text-sm flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        );
      case 'actionItems':
        if (!data.actionItems?.length) {
          return renderEmptyState('actionItems');
        }
        return (
          <ul className="space-y-2">
            {data.actionItems?.map((item, index) => (
              <li key={index} className="text-sm flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>
                  <strong>{item.assignee}:</strong> {item.task}
                  {item.timing && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({item.timing})
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        );
      case 'timeline':
        if (!data.decisions?.length) {
          return renderEmptyState('timeline');
        }
        return (
          <ul className="space-y-2">
            {data.decisions?.map((decision, index) => (
              <li key={index} className="text-sm flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>{decision}</span>
              </li>
            ))}
          </ul>
        );
      default:
        return renderEmptyState(section.id);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold">{data.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {data.duration}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-6">
            {enabledSections.map(section => (
              <div key={section.id} className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold flex items-center mb-3">
                  {sectionIcons[section.id]}
                  <span className="ml-2">{section.name}</span>
                </h3>
                {renderSectionContent(section)}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default MinutesPreview; 