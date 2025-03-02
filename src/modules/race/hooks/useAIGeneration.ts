import { useState } from 'react';
import { generateContent } from '../services/aiModels';
import { AIModelResponse } from '../types';

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
    const { speed = 50, accuracy = 50, adaptability = 50 } = performance || { speed: 50, accuracy: 50, adaptability: 50 };

    // Check if this is an obstruction-related commentary
    const isObstruction = raceStatus.includes('-blocked') || 
                          raceStatus.includes('-rerouting') || 
                          raceStatus.includes('-evading');
    
    let obstructionType = '';
    let baseRaceStatus = raceStatus;
    
    if (isObstruction) {
      // Extract the obstruction type and base race status
      const parts = raceStatus.split('-');
      baseRaceStatus = parts[0];
      obstructionType = parts[1];
    }

    let prompt = `You are an AI race commentator for the AI Rat Race competition. 
    
Current race status:
- Your racer: ${modelName}
- Opponent: ${opponentName}
- Racer characteristics: ${modelCharacteristics}
- Race progress: ${progressPercentage}% (${raceStage} stage)
- Race position: ${baseRaceStatus} (your racer is ${baseRaceStatus} compared to the opponent)
- Speed rating: ${speed}%
- Accuracy rating: ${accuracy}%
- Adaptability rating: ${adaptability}%
`;

    if (isObstruction) {
      // Add obstruction-specific context
      prompt += `
IMPORTANT: The racer is currently experiencing a path interference! 
Obstruction type: ${obstructionType}
${obstructionType === 'blocked' 
  ? `The opponent is blocking the racer's path, forcing a slowdown and recalculation.` 
  : obstructionType === 'rerouting' 
    ? `The racer needs to reroute around the opponent's trajectory.` 
    : `The racer needs to make evasive maneuvers as the opponent is crossing its path.`}

Provide a brief, exciting commentary (2-3 sentences) about how the racer is handling this obstruction.
Focus on how the racer's adaptability (${adaptability}%) affects its ability to handle this interference.
${modelId === 'dbrx' 
  ? 'For the Rat racer, emphasize how its algorithmic nature is recalculating and adapting to the obstruction.' 
  : 'For the Pigeon racer, emphasize how its intuitive nature is helping it react to and navigate around the obstruction.'}
`;
    } else {
      // Standard race commentary
      prompt += `
Provide a brief, exciting commentary (2-3 sentences) about the current state of the race, mentioning both racers. 
Be creative and entertaining, using racing terminology and metaphors related to AI and machine learning.
${modelId === 'dbrx' ? 'For the Rat racer, emphasize its algorithmic precision and calculation abilities.' : 'For the Pigeon racer, emphasize its intuitive decision-making and adaptability.'}
If the race is nearly complete (>90%), comment on the final push to the finish line.
Include a comparison between the two racers based on their current position (${baseRaceStatus}).
`;
    }

    prompt += `
Also include specific commentary about how the racer's performance metrics are affecting their race:
- If speed is high (>70%), mention how this is helping them move quickly
- If accuracy is high (>70%), mention how this is helping them stay on the optimal path
- If adaptability is high (>70%), mention how this is helping them navigate obstacles
- If any metric is low (<30%), mention how this might be hindering their performance`;

    return prompt;
  };

  return {
    loading,
    error,
    response,
    generateRaceCommentary
  };
};

export default useAIGeneration;