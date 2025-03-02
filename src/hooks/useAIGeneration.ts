import { useState } from 'react';
import { generateContent, AIModelResponse } from '../services/aiModels';

interface UseAIGenerationReturn {
  loading: boolean;
  error: string | null;
  response: AIModelResponse | null;
  generateRaceCommentary: (modelId: string, raceProgress: number, performance: any, raceStatus?: string) => Promise<void>;
}

const useAIGeneration = (): UseAIGenerationReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AIModelResponse | null>(null);

  const generateRaceCommentary = async (
    modelId: string, 
    raceProgress: number, 
    performance: any,
    raceStatus: string = 'neck-and-neck'
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Create a prompt based on race progress and performance metrics
      const prompt = createRacePrompt(modelId, raceProgress, performance, raceStatus);
      
      // Generate content from the selected AI model
      const result = await generateContent(prompt, modelId);
      
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error generating AI content:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to create a prompt based on race state
  const createRacePrompt = (
    modelId: string, 
    raceProgress: number, 
    performance: any,
    raceStatus: string
  ): string => {
    const progressPercentage = Math.round(raceProgress * 100);
    const raceStage = progressPercentage < 33 ? 'early' : progressPercentage < 66 ? 'middle' : 'final';
    
    const modelName = modelId === 'dbrx' ? 'Rat (DBRX)' : 'Pigeon (Mistral)';
    const opponentName = modelId === 'dbrx' ? 'Pigeon (Mistral)' : 'Rat (DBRX)';
    const modelCharacteristics = modelId === 'dbrx' 
      ? 'analytical, precise, calculation-focused' 
      : 'intuitive, adaptive, instinct-driven';
    const { speed = 50, accuracy = 50, adaptability = 50 } = performance;

    return `You are an AI race commentator for the AI Rat Race competition. 
    
Current race status:
- Your racer: ${modelName}
- Opponent: ${opponentName}
- Racer characteristics: ${modelCharacteristics}
- Race progress: ${progressPercentage}% (${raceStage} stage)
- Race position: ${raceStatus} (your racer is ${raceStatus} compared to the opponent)
- Speed rating: ${speed}%
- Accuracy rating: ${accuracy}%
- Adaptability rating: ${adaptability}%

Provide a brief, exciting commentary (2-3 sentences) about the current state of the race, mentioning both racers. 
Be creative and entertaining, using racing terminology and metaphors related to AI and machine learning.
${modelId === 'dbrx' ? 'For the Rat racer, emphasize its algorithmic precision and calculation abilities.' : 'For the Pigeon racer, emphasize its intuitive decision-making and adaptability.'}
If the race is nearly complete (>90%), comment on the final push to the finish line.
Include a comparison between the two racers based on their current position (${raceStatus}).

Also include specific commentary about how the racer's performance metrics are affecting their race:
- If speed is high (>70%), mention how this is helping them move quickly
- If accuracy is high (>70%), mention how this is helping them stay on the optimal path
- If adaptability is high (>70%), mention how this is helping them navigate obstacles
- If any metric is low (<30%), mention how this might be hindering their performance`;
  };

  return {
    loading,
    error,
    response,
    generateRaceCommentary
  };
};

export default useAIGeneration;