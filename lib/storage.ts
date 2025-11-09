// Storage types and utilities for saved reports

export type StoredReport = {
  id: string; // Unique report ID (e.g., "CS-47291")
  imageUrl: string; // URL to image in Vercel Blob
  report: string; // Full report text
  caseId: string; // Display case number
  mode: string; // Preset mode used
  spice: number; // Spice level
  context?: string; // Optional context provided
  createdAt: number; // Timestamp
  telemetry?: {
    provider: string;
    model: string;
    quality: string;
    durationMs: number;
    promptTokens?: number;
    completionTokens?: number;
    estimatedCost?: number;
    fallbackUsed?: boolean;
    fallbackReason?: string;
  };
};

export type ShareData = {
  reportId: string;
  shareUrl: string; // Full URL to shareable report page
  previewImageUrl: string; // OG image for link preview
};
