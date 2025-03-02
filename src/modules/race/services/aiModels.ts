import axios from 'axios';
import { AIModelResponse } from '../types';

// Mock AI responses for development
const mockResponses = {
  dbrx: {
    routeSelection: [
      "ROUTE_NUMBER: 1\nEXPLANATION: The Direct Route aligns with the Rat's high efficiency preference (speed: {speed}%) while still maintaining sufficient accuracy ({accuracy}%) for optimal path calculation.",
      "ROUTE_NUMBER: 2\nEXPLANATION: The Complex Route leverages the Rat's strong analytical capabilities (accuracy: {accuracy}%) to navigate multiple decision points with precision.",
      "ROUTE_NUMBER: 5\nEXPLANATION: The Balanced Route provides an optimal compromise between efficiency ({speed}%) and complexity, allowing the Rat to maintain consistent performance.",
      "ROUTE_NUMBER: 4\nEXPLANATION: The Risky Shortcut capitalizes on the Rat's speed optimization ({speed}%) and adaptability ({adaptability}%) to calculate the most efficient path."
    ],
    commentary: [
      "The algorithmic speedster is calculating optimal trajectories with {accuracy}% precision, maintaining a steady pace through the course. Meanwhile, the Pigeon is {race_status}, relying on intuition rather than computation.",
      "DBRX is processing the route with remarkable efficiency, its {speed}% speed rating allowing it to execute turns with mathematical precision. The Rat is now {race_status} the Pigeon, whose flight patterns seem less structured.",
      "The Rat's neural pathways are firing at {adaptability}% adaptability, recalculating optimal paths as it encounters each new segment. It's {race_status} the Pigeon, which is taking a more instinctive approach to navigation.",
      "With {accuracy}% accuracy, the Rat is demonstrating superior analytical capabilities, breaking down complex route segments into computable variables. The race is tight with the Pigeon {race_status} by a narrow margin!",
      "The algorithmic racer is now approaching the finish line, its distributed expert system making final optimizations to maximize performance! The Pigeon is {race_status}, making this final stretch a true test of calculation versus intuition!"
    ]
  },
  mistral: {
    routeSelection: [
      "ROUTE_NUMBER: 1\nEXPLANATION: The Direct Flight Path suits the Pigeon's intuitive flying style, allowing it to leverage its {speed}% speed rating while adapting quickly to changing conditions.",
      "ROUTE_NUMBER: 6\nEXPLANATION: The Thermal Riding Path perfectly complements the Pigeon's {adaptability}% adaptability, allowing it to intuitively sense and utilize thermal updrafts for efficient flight.",
      "ROUTE_NUMBER: 3\nEXPLANATION: The Scenic Flight Path provides a balanced challenge that plays to the Pigeon's strengths in adaptability ({adaptability}%) while not demanding excessive precision.",
      "ROUTE_NUMBER: 4\nEXPLANATION: The Risky Flight Path leverages the Pigeon's impressive adaptability ({adaptability}%) and speed ({speed}%), allowing for rapid course corrections and intuitive navigation."
    ],
    commentary: [
      "The instinctive flyer is soaring through the course, its {adaptability}% adaptability allowing it to make split-second adjustments to its flight path. The Rat is {race_status}, relying on calculations rather than natural instinct.",
      "Mistral is demonstrating remarkable intuition, using its {speed}% speed rating to navigate the course with fluid, natural movements. The Pigeon is now {race_status} the Rat, whose algorithmic approach seems more rigid.",
      "The Pigeon's attention mechanisms are working at {accuracy}% accuracy, focusing on the most relevant environmental cues to guide its flight. It's {race_status} the Rat, which is taking a more computational approach to navigation.",
      "With {adaptability}% adaptability, the Pigeon is reading the air currents masterfully, making micro-adjustments that optimize its trajectory. The race is tight with the Rat {race_status} by a narrow margin!",
      "The instinctive flyer is approaching the finish line with confidence, its neural architecture making final intuitive decisions to complete the race! The Rat is {race_status}, making this final stretch a true test of intuition versus calculation!"
    ]
  }
};

// Function to generate content from DBRX model
export const generateFromDBRX = async (prompt: string): Promise<AIModelResponse> => {
  try {
    // For development, use mock responses instead of actual API calls
    if (prompt.includes("route planner")) {
      // This is a route selection prompt
      const randomIndex = Math.floor(Math.random() * mockResponses.dbrx.routeSelection.length);
      let response = mockResponses.dbrx.routeSelection[randomIndex];
      
      // Replace placeholders with actual values from the prompt
      const speedMatch = prompt.match(/Speed rating: (\d+)%/);
      const accuracyMatch = prompt.match(/Accuracy rating: (\d+)%/);
      const adaptabilityMatch = prompt.match(/Adaptability rating: (\d+)%/);
      const raceStatusMatch = prompt.match(/Race position: ([a-z-]+)/);
      
      if (speedMatch) response = response.replace(/{speed}/g, speedMatch[1]);
      if (accuracyMatch) response = response.replace(/{accuracy}/g, accuracyMatch[1]);
      if (adaptabilityMatch) response = response.replace(/{adaptability}/g, adaptabilityMatch[1]);
      if (raceStatusMatch) response = response.replace(/{race_status}/g, raceStatusMatch[1]);
      
      return {
        content: response,
        modelId: 'dbrx'
      };
    } else if (prompt.includes("race commentator")) {
      // This is a race commentary prompt
      const randomIndex = Math.floor(Math.random() * mockResponses.dbrx.commentary.length);
      let response = mockResponses.dbrx.commentary[randomIndex];
      
      // Replace placeholders with actual values from the prompt
      const speedMatch = prompt.match(/Speed rating: (\d+)%/);
      const accuracyMatch = prompt.match(/Accuracy rating: (\d+)%/);
      const adaptabilityMatch = prompt.match(/Adaptability rating: (\d+)%/);
      const raceStatusMatch = prompt.match(/Race position: ([a-z-]+)/);
      
      if (speedMatch) response = response.replace(/{speed}/g, speedMatch[1]);
      if (accuracyMatch) response = response.replace(/{accuracy}/g, accuracyMatch[1]);
      if (adaptabilityMatch) response = response.replace(/{adaptability}/g, adaptabilityMatch[1]);
      if (raceStatusMatch) response = response.replace(/{race_status}/g, raceStatusMatch[1]);
      
      return {
        content: response,
        modelId: 'dbrx'
      };
    }

    // Fallback response
    return {
      content: 'The algorithmic speedster is calculating its next move...',
      modelId: 'dbrx'
    };
  } catch (error) {
    console.error('Error generating content from DBRX:', error);
    // Return a fallback response
    return {
      content: 'The algorithmic speedster is calculating its next move...',
      modelId: 'dbrx'
    };
  }
};

// Function to generate content from Mistral model
export const generateFromMistral = async (prompt: string): Promise<AIModelResponse> => {
  try {
    // For development, use mock responses instead of actual API calls
    if (prompt.includes("route planner")) {
      // This is a route selection prompt
      const randomIndex = Math.floor(Math.random() * mockResponses.mistral.routeSelection.length);
      let response = mockResponses.mistral.routeSelection[randomIndex];
      
      // Replace placeholders with actual values from the prompt
      const speedMatch = prompt.match(/Speed rating: (\d+)%/);
      const accuracyMatch = prompt.match(/Accuracy rating: (\d+)%/);
      const adaptabilityMatch = prompt.match(/Adaptability rating: (\d+)%/);
      const raceStatusMatch = prompt.match(/Race position: ([a-z-]+)/);
      
      if (speedMatch) response = response.replace(/{speed}/g, speedMatch[1]);
      if (accuracyMatch) response = response.replace(/{accuracy}/g, accuracyMatch[1]);
      if (adaptabilityMatch) response = response.replace(/{adaptability}/g, adaptabilityMatch[1]);
      if (raceStatusMatch) response = response.replace(/{race_status}/g, raceStatusMatch[1]);
      
      return {
        content: response,
        modelId: 'mistral'
      };
    } else if (prompt.includes("race commentator")) {
      // This is a race commentary prompt
      const randomIndex = Math.floor(Math.random() * mockResponses.mistral.commentary.length);
      let response = mockResponses.mistral.commentary[randomIndex];
      
      // Replace placeholders with actual values from the prompt
      const speedMatch = prompt.match(/Speed rating: (\d+)%/);
      const accuracyMatch = prompt.match(/Accuracy rating: (\d+)%/);
      const adaptabilityMatch = prompt.match(/Adaptability rating: (\d+)%/);
      const raceStatusMatch = prompt.match(/Race position: ([a-z-]+)/);
      
      if (speedMatch) response = response.replace(/{speed}/g, speedMatch[1]);
      if (accuracyMatch) response = response.replace(/{accuracy}/g, accuracyMatch[1]);
      if (adaptabilityMatch) response = response.replace(/{adaptability}/g, adaptabilityMatch[1]);
      if (raceStatusMatch) response = response.replace(/{race_status}/g, raceStatusMatch[1]);
      
      return {
        content: response,
        modelId: 'mistral'
      };
    }

    // Fallback response
    return {
      content: 'The instinctive flyer is adapting to the current conditions...',
      modelId: 'mistral'
    };
  } catch (error) {
    console.error('Error generating content from Mistral:', error);
    // Return a fallback response
    return {
      content: 'The instinctive flyer is adapting to the current conditions...',
      modelId: 'mistral'
    };
  }
};

// Function to generate content based on selected model
export const generateContent = async (prompt: string, modelId: string): Promise<AIModelResponse> => {
  if (modelId === 'dbrx') {
    return generateFromDBRX(prompt);
  } else if (modelId === 'mistral') {
    return generateFromMistral(prompt);
  } else {
    throw new Error(`Unknown model ID: ${modelId}`);
  }
};