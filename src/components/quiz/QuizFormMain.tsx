'use client';

import {
    Box,
    Button,
    Card,
    ChoiceList,
    Divider,
    FormLayout,
    Select,
    Text,
    TextField
} from '@shopify/polaris';

interface QuizFormMainProps {
  quizTitle: string;
  setQuizTitle: (value: string) => void;
  quizDescription: string;
  setQuizDescription: (value: string) => void;
  quizType: string;
  setQuizType: (value: string) => void;
  currentStep: number;
}

export default function QuizFormMain({ 
  quizTitle, 
  setQuizTitle, 
  quizDescription, 
  setQuizDescription, 
  quizType, 
  setQuizType, 
  currentStep 
}: QuizFormMainProps) {

  const quizTypeOptions = [
    { label: 'Product Recommendation', value: 'product-recommendation' },
    { label: 'Customer Survey', value: 'customer-survey' },
    { label: 'Lead Generation', value: 'lead-generation' },
    { label: 'Brand Awareness', value: 'brand-awareness' }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <Box paddingBlockEnd="400">
              <Text variant="headingLg" as="h2">
                Basic Information
              </Text>
              <Text variant="bodyMd"  as="p">
                Let's start with the basics of your quiz.
              </Text>
            </Box>

            <FormLayout>
              <TextField
                label="Quiz Title"
                value={quizTitle}
                onChange={setQuizTitle}
                placeholder="Enter a catchy title for your quiz"
                autoComplete="off"
                requiredIndicator
                helpText="This will be displayed as the main heading of your quiz"
              />
              
              <TextField
                label="Quiz Description"
                value={quizDescription}
                onChange={setQuizDescription}
                placeholder="Describe what your quiz is about"
                multiline={4}
                autoComplete="off"
                helpText="Tell your customers what they'll learn or discover"
              />
              
              <Select
                label="Quiz Type"
                options={quizTypeOptions}
                value={quizType}
                onChange={setQuizType}
                helpText="Choose the type that best matches your goal"
              />
            </FormLayout>
          </div>
        );

      case 2:
        return (
          <div>
            <Box paddingBlockEnd="400">
              <Text variant="headingLg" as="h2">
                Quiz Questions
              </Text>
              <Text variant="bodyMd" as="p">
                Add questions to engage your customers.
              </Text>
            </Box>

            <Card>
              <Box padding="400">
                <Text variant="headingMd" as="h3">
                  Question 1
                </Text>
                <Box paddingBlockStart="300">
                  <FormLayout>
                    <TextField
                      label="Question Text"
                      placeholder="What's your style preference?"
                      autoComplete="off"
                    />
                    <TextField
                      label="Question Description"
                      placeholder="Help us understand your style..."
                      multiline={2}
                      autoComplete="off"
                    />
                  </FormLayout>
                </Box>
              </Box>
            </Card>

            <Box paddingBlockStart="300">
              <Button variant="secondary">
                + Add Question
              </Button>
            </Box>
          </div>
        );

      case 3:
        return (
          <div>
            <Box paddingBlockEnd="400">
              <Text variant="headingLg" as="h2">
                Quiz Logic
              </Text>
              <Text variant="bodyMd" as="p">
                Configure how your quiz flows and calculates results.
              </Text>
            </Box>

            <FormLayout>
              <ChoiceList
                title="Result Calculation"
                choices={[
                  { label: 'Score-based (points system)', value: 'score' },
                  { label: 'Category-based (personality type)', value: 'category' },
                  { label: 'Product matching', value: 'product' }
                ]}
                selected={['score']}
                onChange={() => {}}
              />
            </FormLayout>
          </div>
        );

      case 4:
        return (
          <div>
            <Box paddingBlockEnd="400">
              <Text variant="headingLg" as="h2">
                Result Pages
              </Text>
              <Text variant="bodyMd" as="p">
                Design what customers see after completing your quiz.
              </Text>
            </Box>

            <Card>
              <Box padding="400">
                <Text variant="headingMd" as="h3">
                  Result Template
                </Text>
                <Box paddingBlockStart="300">
                  <FormLayout>
                    <TextField
                      label="Result Title"
                      placeholder="You're a [Result Type]!"
                      autoComplete="off"
                    />
                    <TextField
                      label="Result Description"
                      placeholder="Based on your answers..."
                      multiline={3}
                      autoComplete="off"
                    />
                  </FormLayout>
                </Box>
              </Box>
            </Card>
          </div>
        );

      case 5:
        return (
          <div>
            <Box paddingBlockEnd="400">
              <Text variant="headingLg" as="h2">
                Design & Styling
              </Text>
              <Text variant="bodyMd" as="p">
                Customize the look and feel of your quiz.
              </Text>
            </Box>

            <FormLayout>
              <ChoiceList
                title="Color Theme"
                choices={[
                  { label: 'Default (Shopify Green)', value: 'default' },
                  { label: 'Minimal (Black & White)', value: 'minimal' },
                  { label: 'Vibrant (Colorful)', value: 'vibrant' },
                  { label: 'Custom Colors', value: 'custom' }
                ]}
                selected={['default']}
                onChange={() => {}}
              />
            </FormLayout>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {renderStepContent()}
      
      <Divider />
      
      <Box paddingBlockStart="400">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button 
            variant="secondary" 
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          <Text variant="bodyMd" as="p">
            Step {currentStep} of 5
          </Text>
          
          <Button 
            variant="primary"
            disabled={currentStep === 5}
          >
            Next Step
          </Button>
        </div>
      </Box>
    </div>
  );
}