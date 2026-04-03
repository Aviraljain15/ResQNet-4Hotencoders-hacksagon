export interface AIAnalysisResult {
  imageClassification: string
  fakeDetection: string
  textClassification: string
  confidence: number
  priority: string
}

export const analyzeReport = async (imageFile: File, text: string): Promise<AIAnalysisResult> => {
  await new Promise(res => setTimeout(res, 1500))

  return {
    imageClassification: "fire",
    fakeDetection: "real",
    textClassification: "valid",
    confidence: 0.82,
    priority: "high"
  }
}
