// Global type definitions for the Quiz Application

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  vendor: string;
  product_type: string;
  tags: string[];
  images: Array<{
    id: string;
    src: string;
    alt?: string;
  }>;
  variants: Array<{
    id: string;
    title: string;
    price: string;
  }>;
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: {
    id: string;
    src: string;
    alt?: string;
  };
}

export interface ShopifyMetafield {
  id: string;
  namespace: string;
  key: string;
  value: string;
  type: string;
  description?: string;
}

export interface ShopifyMedia {
  id: string;
  alt?: string;
  media_content_type: string;
  preview?: {
    image?: {
      url: string;
    };
  };
}

export interface MediaFile {
  id: string;
  url: string;
  alt?: string;
  type: 'image' | 'video';
}

export interface AnswerCondition {
  metafield?: ShopifyMetafield;
  operator: 'equals' | 'not_equals';
  value: string;
}

export interface Answer {
  id: string;
  text: string;
  answer_media?: string | null;
  redirect_to_link?: boolean;
  redirect_url?: string | null;
  collections: ShopifyCollection[];
  categories: string[];
  products: ShopifyProduct[];
  tags: string[];
  conditions?: AnswerCondition[];
}

export interface Question {
  id: string;
  text: string;
  question_media?: string | null;
  show_answers: boolean;
  allow_multiple_selection: boolean;
  answers: Answer[];
}

export interface StyleSettings {
  fontFamily: string;
  animations: boolean;
  
  // Intro Screen
  introBackgroundColor: string;
  introStartButtonColor: string;
  introStartButtonTextColor: string;
  introQuestionTextColor: string;
  introDescriptionTextColor: string;
  introStartButtonBorderColor: string;
  introImageBorderColor: string;
  introButtonBorderWidth: number;
  introButtonBorderRadius: number;
  introButtonBorderType: string;
  introImageBorderWidth: number;
  introImageBorderRadius: number;
  introImageBorderType: string;
  introTitleSize: number;
  introDescriptionSize: number;
  introButtonTextSize: number;
  introIconSize: number;
  introImageHeight: number;
  
  // Question Screen
  questionBackgroundColor: string;
  questionOptionBackgroundColor: string;
  questionOptionBorderColor: string;
  questionTextColor: string;
  questionOptionTextColor: string;
  questionImageBorderColor: string;
  questionSelectedOptionBackgroundColor: string;
  questionSelectedOptionTextColor: string;
  questionSelectedOptionBorderColor: string;
  questionOptionBorderWidth: number;
  questionOptionBorderRadius: number;
  questionOptionBorderType: string;
  questionImageBorderWidth: number;
  questionImageBorderRadius: number;
  questionImageBorderType: string;
  questionTextSize: number;
  questionImageHeight: number;
  questionOptionTextSize: number;
  questionOptionImageSize: number;
  
  // Navigation
  navButtonBorderWidth: number;
  navButtonBorderColor: string;
  navButtonBorderType: string;
  navButtonBorderRadius: number;
  navButtonTextSize: number;
  navButtonTextType: string;
  navPrevButtonColor: string;
  navPrevButtonTextColor: string;
  navOkIconColor: string;
  
  // Counter
  counterBackgroundColor: string;
  counterBorderColor: string;
  counterTextColor: string;
  counterBorderWidth: number;
  counterBorderRadius: number;
  counterBorderType: string;
  counterTextSize: number;
  counterTextStyle: string;
  
  // Result Screen
  resultBackgroundColor: string;
  resultTextColor: string;
  resultButtonColor: string;
  resultButtonTextColor: string;
  
  // Custom CSS
  customCSS: string;
}

export interface Quiz {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  internal_quiz_title?: string | null;
  internal_quiz_description?: string | null;
  quiz_image?: string | null;
  is_active: boolean;
  auto_transition: boolean;
  selected_collections: ShopifyCollection[];
  shop_domain: string;
  styles: StyleSettings;
  questions: Question[];
  created_at: string;
  updated_at: string;
}

export interface QuizFormData {
  title: string;
  description?: string | null;
  internalTitle?: string | null;
  internalDescription?: string | null;
  quizImage?: string | null;
  isActive: boolean;
  styles: StyleSettings;
  questions: Question[];
  answers?: Answer[];
}

export interface ShopData {
  shop_domain: string;
  access_token: string;
  scope: string;
  installed_at: string;
  updated_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface QuizListResponse extends ApiResponse {
  data?: Quiz[];
}

export interface QuizResponse extends ApiResponse {
  data?: Quiz;
}

// API Response interfaces for data transformation
export interface ApiQuestion {
  id: string;
  text: string;
  question_media?: string | null;
  questionMedia?: string | null;  // camelCase version from API
  show_answers?: boolean;
  showAnswers?: boolean;  // camelCase version from API
  allow_multiple_selection?: boolean;
  allowMultipleSelection?: boolean;  // camelCase version from API
}

export interface ApiAnswer {
  id: string;
  text: string;
  answer_media?: string | null;
  answerMedia?: string | null;  // camelCase version from API
  redirect_to_link?: boolean;
  redirectToLink?: boolean;  // camelCase version from API
  redirect_url?: string | null;
  redirectUrl?: string | null;  // camelCase version from API
  collections?: ShopifyCollection[];
  relatedCollections?: ShopifyCollection[];  // camelCase version from API
  categories?: string[];
  relatedCategories?: string[];  // camelCase version from API
  products?: ShopifyProduct[];
  relatedProducts?: ShopifyProduct[];  // camelCase version from API
  tags?: string[];
  relatedTags?: string[];  // camelCase version from API
  conditions?: AnswerCondition[];
  metafieldConditions?: AnswerCondition[];  // camelCase version from API
  questionId?: string;
}

export interface ApiQuiz extends Omit<Quiz, 'questions'> {
  questions?: ApiQuestion[];
  answers?: ApiAnswer[];
}

export interface ValidationResponse extends ApiResponse {
  valid: boolean;
  shop?: string;
  accessToken?: string;
  error?: string;
}

// Component Props Types
export interface QuizBuilderProps {
  quiz?: Quiz;
  onSave?: (quiz: QuizFormData) => Promise<void>;
  onCancel?: () => void;
}

export interface QuizPreviewProps {
  questions: Question[];
  styles: StyleSettings;
  quizTitle?: string;
  quizDescription?: string;
  internalQuizTitle?: string;
  internalQuizDescription?: string;
  quizImage?: string;
  selectedQuestionId?: string;
  selectedAnswerId?: string;
  activeTab?: string;
  onQuestionSelect?: (questionId: string) => void;
  onAnswerSelect?: (answerId: string) => void;
  onTabChange?: (tab: string) => void;
}

export interface StyleSettingsProps {
  styles?: StyleSettings;
  onStyleChange?: (styles: StyleSettings) => void;
}

// Form Handler Types
export type StyleChangeHandler = (key: keyof StyleSettings, value: string | number | boolean) => void;
export type QuestionChangeHandler = (questionId: string, field: keyof Question, value: unknown) => void;
export type AnswerChangeHandler = (questionId: string, answerId: string, field: keyof Answer, value: unknown) => void;

// Event Handler Types
export interface FormEvent extends Event {
  target: HTMLFormElement;
}

export interface ChangeEvent extends Event {
  target: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Template Types
export interface TemplateStyle {
  name: string;
  description: string;
  styles: Partial<StyleSettings>;
}

export interface TemplateCollection {
  [key: string]: TemplateStyle;
}