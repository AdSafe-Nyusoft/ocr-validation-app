// OCR and AI Policy Detection utilities
// These are placeholder functions that can be connected to actual AI services

export interface OCRResult {
  extractedText: string;
  confidence: number;
}

export interface PolicyViolation {
  textSnippet: string;
  violationType: 'CONTENT_MODERATION' | 'COMPLIANCE' | 'PRIVACY' | 'HATE_SPEECH' | 'VIOLENCE' | 'ADULT_CONTENT' | 'SPAM';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendation: string;
  confidence: number;
}

export interface PolicyAnalysisResult {
  violations: PolicyViolation[];
  overallRiskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Placeholder OCR function - replace with actual OCR service
export async function extractTextFromFile(filePath: string, fileType: string): Promise<OCRResult> {
  // Simulate OCR processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock extracted text based on file type
  const mockTexts = {
    image: "This is sample extracted text from an image. The content appears to be a document with various information that needs to be analyzed for policy violations.",
    audio: "This is sample transcribed text from an audio file. The speaker discusses various topics that may contain policy-sensitive content.",
    video: "This is sample transcribed text from a video file. The video contains dialogue and visual text that has been extracted and transcribed."
  };
  
  const baseType = fileType.split('/')[0] as keyof typeof mockTexts;
  const extractedText = mockTexts[baseType] || mockTexts.image;
  
  return {
    extractedText,
    confidence: 0.95
  };
}

// Placeholder policy analysis function - replace with actual AI service
export async function analyzeContentForPolicyViolations(text: string): Promise<PolicyAnalysisResult> {
  // Simulate AI analysis
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const violations: PolicyViolation[] = [];
  
  // Mock policy violation detection
  if (text.toLowerCase().includes('hate') || text.toLowerCase().includes('violence')) {
    violations.push({
      textSnippet: text.substring(0, 100) + '...',
      violationType: 'HATE_SPEECH',
      description: 'Content contains language that may be considered hate speech',
      severity: 'HIGH',
      recommendation: 'Remove or modify the flagged content to comply with community guidelines',
      confidence: 0.87
    });
  }
  
  if (text.toLowerCase().includes('spam') || text.toLowerCase().includes('promotion')) {
    violations.push({
      textSnippet: text.substring(50, 150) + '...',
      violationType: 'SPAM',
      description: 'Content appears to contain promotional or spam-like material',
      severity: 'MEDIUM',
      recommendation: 'Review promotional content to ensure it meets platform guidelines',
      confidence: 0.72
    });
  }
  
  // Calculate overall risk score
  const riskScore = violations.length > 0 ? 
    Math.min(10, violations.reduce((sum, v) => sum + (v.severity === 'HIGH' ? 4 : v.severity === 'MEDIUM' ? 2 : 1), 0)) : 
    Math.floor(Math.random() * 3) + 1; // Random low score for demo
  
  const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 
    riskScore <= 3 ? 'LOW' : riskScore <= 6 ? 'MEDIUM' : 'HIGH';
  
  return {
    violations,
    overallRiskScore: riskScore,
    riskLevel
  };
}

// File validation utilities
export function validateFileType(fileType: string, userPlan: 'FREE' | 'PREMIUM'): boolean {
  const allowedTypes = {
    FREE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    PREMIUM: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'audio/mpeg', 'audio/wav', 'audio/mp3',
      'video/mp4', 'video/avi', 'video/mov'
    ]
  };
  
  return allowedTypes[userPlan].includes(fileType);
}

export function validateFileSize(fileSize: number, fileType: string): boolean {
  const maxSizes = {
    image: 10 * 1024 * 1024, // 10MB
    audio: 50 * 1024 * 1024, // 50MB
    video: 100 * 1024 * 1024 // 100MB
  };
  
  const baseType = fileType.split('/')[0] as keyof typeof maxSizes;
  return fileSize <= (maxSizes[baseType] || maxSizes.image);
}
