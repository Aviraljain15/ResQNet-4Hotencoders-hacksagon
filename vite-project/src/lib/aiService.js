export const analyzeReport = async (imageFile, text) => {
  await new Promise(res => setTimeout(res, 1500))

  return {
    imageClassification: "fire",
    fakeDetection: "real",
    textClassification: "valid",
    confidence: 0.82,
    priority: "high"
  }
}
