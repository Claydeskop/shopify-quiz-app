'use client';

import {
    Badge,
    Box,
    Button,
    Card,
    ChoiceList,
    Divider,
    Text
} from '@shopify/polaris';

interface QuizFormPreviewProps {
  quizTitle: string;
  quizDescription: string;
  quizType: string;
}

export default function QuizFormPreview({ 
  quizTitle, 
  quizDescription, 
  quizType 
}: QuizFormPreviewProps) {

  const getQuizTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'product-recommendation': 'Product Recommendation',
      'customer-survey': 'Customer Survey',
      'lead-generation': 'Lead Generation',
      'brand-awareness': 'Brand Awareness'
    };
    return types[type] || type;
  };

  const getQuizTypeColor = (type: string) => {
    const colors: { [key: string]: any } = {
      'product-recommendation': 'success',
      'customer-survey': 'info',
      'lead-generation': 'warning',
      'brand-awareness': 'attention'
    };
    return colors[type] || 'info';
  };

  return (
    <div>
      <Box paddingBlockEnd="400">
        <Text variant="headingMd" as="h3">
          Live Preview
        </Text>
        <Text variant="bodySm" as="p">
          See how your quiz will look
        </Text>
      </Box>
      
      {/* Quiz Preview Card */}
      <Card>
        <Box padding="400">
          <div style={{
            border: '2px dashed #c9cccf',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f6f6f7'
          }}>
            {quizTitle ? (
              <>
                <Text variant="headingSm" as="h4">
                  {quizTitle}
                </Text>
                {quizDescription && (
                  <Box paddingBlockStart="200">
                    <Text variant="bodySm" as="p">
                      {quizDescription.slice(0, 100)}
                      {quizDescription.length > 100 && '...'}
                    </Text>
                  </Box>
                )}
                <Box paddingBlockStart="300">
                  <Badge tone={getQuizTypeColor(quizType)}>
                    {getQuizTypeLabel(quizType)}
                  </Badge>
                </Box>
              </>
            ) : (
              <Text variant="bodySm" as="p">
                Your quiz preview will appear here as you fill out the form
              </Text>
            )}
          </div>
        </Box>
      </Card>

      <Divider />

      {/* Quick Settings */}
      <Box paddingBlockStart="400" paddingBlockEnd="400">
        <Text variant="headingMd" as="h3">
          Quick Settings
        </Text>
      </Box>

      <Card>
        <Box padding="300">
          <ChoiceList
            title="Visibility"
            choices={[
              { label: 'Live (visible to customers)', value: 'live' },
              { label: 'Draft (only visible to you)', value: 'draft' }
            ]}
            selected={['draft']}
            onChange={() => {}}
          />
        </Box>
      </Card>

      <Box paddingBlockStart="300">
        <Card>
          <Box padding="300">
            <ChoiceList
              title="Display Options"
              allowMultiple
              choices={[
                { label: 'Show progress bar', value: 'progress' },
                { label: 'Show question numbers', value: 'numbers' },
                { label: 'Allow back navigation', value: 'back' }
              ]}
              selected={['progress', 'numbers']}
              onChange={() => {}}
            />
          </Box>
        </Card>
      </Box>

      <Divider />

      {/* Quiz Stats */}
      <Box paddingBlockStart="400" paddingBlockEnd="300">
        <Text variant="headingMd" as="h3">
          Quiz Stats
        </Text>
      </Box>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{
          padding: '16px',
          backgroundColor: '#f0f8f4',
          borderRadius: '8px',
          border: '1px solid #c7f0d8'
        }}>
          <Text variant="headingSm" as="p">
            0
          </Text>
          <Text variant="bodySm" as="p">
            Total Responses
          </Text>
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: '#f0f8f4',
          borderRadius: '8px',
          border: '1px solid #c7f0d8'
        }}>
          <Text variant="headingSm" as="p">
            0%
          </Text>
          <Text variant="bodySm" as="p">
            Completion Rate
          </Text>
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: '#f0f8f4',
          borderRadius: '8px',
          border: '1px solid #c7f0d8'
        }}>
          <Text variant="headingSm" as="p">
            0
          </Text>
          <Text variant="bodySm" as="p">
            Conversions
          </Text>
        </div>
      </div>

      <Box paddingBlockStart="400">
        <Button variant="secondary" size="slim" fullWidth>
          📊 View Analytics
        </Button>
      </Box>
    </div>
  );
}