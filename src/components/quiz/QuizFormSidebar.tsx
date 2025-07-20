'use client';

import { Badge, Box, Button, Text } from '@shopify/polaris';

interface QuizFormSidebarProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export default function QuizFormSidebar({ currentStep, setCurrentStep }: QuizFormSidebarProps) {
  const steps = [
    {
      id: 1,
      title: 'Basic Info',
      description: 'Quiz title & description',
      icon: '📝'
    },
    {
      id: 2,
      title: 'Questions',
      description: 'Add quiz questions',
      icon: '❓'
    },
    {
      id: 3,
      title: 'Logic',
      description: 'Quiz flow & logic',
      icon: '🔀'
    },
    {
      id: 4,
      title: 'Results',
      description: 'Result pages',
      icon: '🎯'
    },
    {
      id: 5,
      title: 'Design',
      description: 'Colors & styling',
      icon: '🎨'
    }
  ];

  return (
    <div>
      <Box paddingBlockEnd="400">
        <Text variant="headingMd" as="h3">
          Quiz Builder Steps
        </Text>
      </Box>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {steps.map((step) => (
          <div
            key={step.id}
            onClick={() => setCurrentStep(step.id)}
            style={{
              padding: '16px',
              border: currentStep === step.id ? '2px solid #008060' : '1px solid #e1e3e5',
              borderRadius: '8px',
              backgroundColor: currentStep === step.id ? '#f0f8f4' : '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                fontSize: '20px',
                opacity: currentStep === step.id ? 1 : 0.6
              }}>
                {step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <Text variant="bodyMd" fontWeight="semibold" as="p">
                  {step.title}
                </Text>
                <Text variant="bodySm"  as="p">
                  {step.description}
                </Text>
              </div>
              {currentStep === step.id && (
                <Badge tone="success">Active</Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      <Box paddingBlockStart="500">
        <div style={{ 
          padding: '16px',
          backgroundColor: '#fef7f0',
          border: '1px solid #fbb040',
          borderRadius: '8px'
        }}>
          <Text variant="bodyMd" fontWeight="semibold" as="p" >
            💡 Pro Tip
          </Text>
          <Text variant="bodySm" as="p" >
            Start with basic info, then add questions to build your quiz step by step.
          </Text>
        </div>
      </Box>

      <Box paddingBlockStart="400">
        <Button variant="secondary" size="slim" fullWidth>
          📚 Browse Templates
        </Button>
      </Box>
    </div>
  );
}