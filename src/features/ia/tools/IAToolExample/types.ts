export interface SuggestedBookmark {
  title: string;
  url: string;
  description: string;
  category: string;
  tags?: string[];
}

export interface SuggestionResponse {
  suggestions: SuggestedBookmark[];
  summary?: string;
}
