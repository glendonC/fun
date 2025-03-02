import { generateContent } from './aiModels';
import { generateRouteVariations, RouteVariation } from './mapboxService';

// Interface for route points
export interface RoutePoint {
  longitude: number;
  latitude: number;
  altitude: number;
}

// San Francisco coordinates - fixed start and end points
// Start point at Union Square in San Francisco
const START_POINT = {
  longitude: -122.4954, // Further west in Sunset District
  latitude: 37.7604,    // Near Golden Gate Park
  altitude: 0
};

// NASDAQ MarketSite building in San Francisco (One Market Street)
const FINISH_POINT = {
  longitude: -122.3944,
  latitude: 37.7937,
  altitude: 0
};

// Cache for route variations to avoid repeated API calls
let cachedRatRoutes: RouteVariation[] | null = null;
let cachedPigeonRoutes: RouteVariation[] | null = null;

// Function to get route variations with caching
const getRouteVariations = async (modelId: string): Promise<RouteVariation[]> => {
  const isRat = modelId === 'dbrx';
  
  // Check if we have cached routes
  if (isRat && cachedRatRoutes) {
    return cachedRatRoutes;
  } else if (!isRat && cachedPigeonRoutes) {
    return cachedPigeonRoutes;
  }
  
  // Generate new route variations
  try {
    const variations = await generateRouteVariations(START_POINT, FINISH_POINT, !isRat);
    
    // Cache the results
    if (isRat) {
      cachedRatRoutes = variations;
    } else {
      cachedPigeonRoutes = variations;
    }
    
    return variations;
  } catch (error) {
    console.error('Error getting route variations:', error);
    
    // Return fallback routes if API fails
    return getFallbackRoutes(modelId);
  }
};

// Update getFallbackRoutes to match the race module routes
const getFallbackRoutes = (modelId: string): RouteVariation[] => {
  const isRat = modelId === 'dbrx';
  const variations: RouteVariation[] = [];

  // Direct route
  variations.push({
    name: isRat ? 'Direct Route' : 'Direct Flight Path',
    description: isRat 
      ? 'The most direct path to the NASDAQ building. Efficient but potentially challenging.'
      : 'A direct aerial route flying straight to the NASDAQ building.',
    points: generateSimpleRoute(START_POINT, FINISH_POINT),
    characteristics: {
      efficiency: 90,
      complexity: 30,
      risk: 40
    }
  });

  // Chinatown route
  const chinatownPoints = [
    { longitude: -122.4059, latitude: 37.7957, altitude: 0 }, // Near Chinatown
    { longitude: -122.4022, latitude: 37.7952, altitude: 0 }  // Another point in Chinatown
  ];
  variations.push({
    name: isRat ? 'Chinatown Route' : 'Chinatown Flight Path',
    description: 'A challenging path through Chinatown with many turns and decision points.',
    points: generateSimpleRoute(START_POINT, FINISH_POINT, chinatownPoints),
    characteristics: {
      efficiency: 40,
      complexity: 90,
      risk: 70
    }
  });

  // Financial District route
  const financialPoints = [
    { longitude: -122.4038, latitude: 37.7873, altitude: 0 }, // Union Square
    { longitude: -122.4010, latitude: 37.7914, altitude: 0 }  // Financial District
  ];
  variations.push({
    name: isRat ? 'Financial District Route' : 'Financial District Flight',
    description: 'A scenic path through the Financial District with less traffic and complexity.',
    points: generateSimpleRoute(START_POINT, FINISH_POINT, financialPoints),
    characteristics: {
      efficiency: 60,
      complexity: 20,
      risk: 20
    }
  });

  // Risky route
  const riskyPoints = [
    { longitude: -122.4020, latitude: 37.7900, altitude: 0 }, // Narrow street
    { longitude: -122.3980, latitude: 37.7920, altitude: 0 }  // Another narrow passage
  ];
  variations.push({
    name: isRat ? 'Risky Shortcut' : 'Risky Shortcut Flight',
    description: 'A potentially faster but riskier path with challenging terrain and narrow streets.',
    points: generateSimpleRoute(START_POINT, FINISH_POINT, riskyPoints),
    characteristics: {
      efficiency: 80,
      complexity: 50,
      risk: 90
    }
  });

  // Add the thermal riding path for flying routes
  if (!isRat) {
    const thermalPoints = [
      { longitude: -122.4050, latitude: 37.7920, altitude: 0 },
      { longitude: -122.3990, latitude: 37.7890, altitude: 0 }
    ];
    variations.push({
      name: 'Thermal Riding Path',
      description: 'A path that takes advantage of thermal updrafts between skyscrapers.',
      points: generateSimpleRoute(START_POINT, FINISH_POINT, thermalPoints, true),
      characteristics: {
        efficiency: 80,
        complexity: 60,
        risk: 40
      }
    });
  }

  return variations;
};

// Helper function to generate route points through waypoints
const generateSimpleRoute = (
  start: RoutePoint, 
  end: RoutePoint, 
  waypoints: RoutePoint[] = [],
  isThermal: boolean = false
): RoutePoint[] => {
  const allPoints = [start, ...waypoints, end];
  const points: RoutePoint[] = [];
  const steps = 10;

  for (let i = 0; i < allPoints.length - 1; i++) {
    const from = allPoints[i];
    const to = allPoints[i + 1];
    
    for (let j = 0; j <= steps; j++) {
      const fraction = j / steps;
      const longitude = from.longitude + fraction * (to.longitude - from.longitude);
      const latitude = from.latitude + fraction * (to.latitude - from.latitude);
      
      let altitude = 0;
      if (isThermal) {
        const phase = ((i * steps + j) / (steps * (allPoints.length - 1))) * Math.PI * 4;
        altitude = 20 + (Math.sin(phase) + 1) / 2 * 50;
      }
      
      points.push({ longitude, latitude, altitude });
    }
  }

  return points;
};

// Function to select a route using AI
export const selectRouteWithAI = async (
  modelId: string,
  parameters: any
): Promise<{ 
  selectedRoute: RoutePoint[]; 
  routeName: string;
  routeExplanation: string;
}> => {
  try {
    // Get route variations for this model
    const routeVariations = await getRouteVariations(modelId);
    console.log('Available Route Variations:', routeVariations.map(r => ({
      name: r.name,
      description: r.description,
      characteristics: r.characteristics,
      pointCount: r.points.length
    })));
    
    // Ensure parameters and performance exist, with defaults if not
    const performance = parameters?.performance || { speed: 50, accuracy: 50, adaptability: 50 };
    const { speed = 50, accuracy = 50, adaptability = 50 } = performance;
    
    // Create a prompt for the AI
    const prompt = `You are an AI route planner for the AI Rat Race competition.
    
Current racer: ${modelId === 'dbrx' ? 'Rat (DBRX)' : 'Pigeon (Mistral)'}
Racer characteristics: ${modelId === 'dbrx' ? 'analytical, precise, calculation-focused' : 'intuitive, adaptive, instinct-driven'}
Speed rating: ${speed}%
Accuracy rating: ${accuracy}%
Adaptability rating: ${adaptability}%

Available routes:
${routeVariations.map((route, index) => `
Route ${index + 1}: ${route.name}
Description: ${route.description}
Characteristics:
- Efficiency: ${route.characteristics.efficiency}/100
- Complexity: ${route.characteristics.complexity}/100
- Risk: ${route.characteristics.risk}/100
`).join('\n')}

Based on the racer's characteristics and performance metrics, select the most appropriate route.
${modelId === 'dbrx' 
  ? 'For the Rat racer, prioritize routes that align with its analytical, calculation-focused nature. Consider how its speed vs. accuracy balance affects route choice.' 
  : 'For the Pigeon racer, prioritize routes that align with its intuitive, adaptive nature. Consider how its adaptability affects route choice.'}

Respond with ONLY the route number (1-${routeVariations.length}) of your selection and a brief explanation (2-3 sentences) of why this route is optimal for this racer with these specific performance metrics.
Format your response exactly like this:
ROUTE_NUMBER: [selected route number]
EXPLANATION: [your brief explanation]`;
    
    try {
      // Get the AI's response
      const response = await generateContent(prompt, modelId);
      
      // Parse the response to get the selected route number
      const routeNumberMatch = response.content.match(/ROUTE_NUMBER:\s*(\d+)/i);
      const explanationMatch = response.content.match(/EXPLANATION:\s*(.*?)(?:\n|$)/is);
      
      if (routeNumberMatch) {
        const routeNumber = parseInt(routeNumberMatch[1].trim(), 10);
        console.log('Selected Route Number:', routeNumber);
        console.log('Available Routes:', routeVariations.length);
        const explanation = explanationMatch 
          ? explanationMatch[1].trim() 
          : 'Route selected based on racer characteristics.';
        
        // Ensure the route number is valid
        const routeIndex = Math.max(0, Math.min(routeNumber - 1, routeVariations.length - 1));
        const selectedRouteVariation = routeVariations[routeIndex];
        
        // Replace placeholders in the explanation with actual values
        const formattedExplanation = explanation
          .replace(/{speed}/g, speed.toString())
          .replace(/{accuracy}/g, accuracy.toString())
          .replace(/{adaptability}/g, adaptability.toString());
        
        return {
          selectedRoute: selectedRouteVariation.points,
          routeName: selectedRouteVariation.name,
          routeExplanation: formattedExplanation
        };
      }
      
      // If we couldn't parse the AI response properly, fall back to metrics-based selection
      return selectRouteBasedOnMetrics(modelId, parameters, routeVariations);
    } catch (error) {
      console.error('Error getting AI response:', error);
      return selectRouteBasedOnMetrics(modelId, parameters, routeVariations);
    }
  } catch (error) {
    console.error('Error selecting route with AI:', error);
    
    // Fallback to a default route if there's an error
    const fallbackRoutes = getFallbackRoutes(modelId);
    const defaultRoute = fallbackRoutes[0];
    
    return {
      selectedRoute: defaultRoute.points,
      routeName: defaultRoute.name,
      routeExplanation: 'Default route selected due to processing error.'
    };
  }
};

// Function to select a route based on performance metrics without using AI
const selectRouteBasedOnMetrics = (
  modelId: string,
  parameters: any,
  routeVariations: RouteVariation[]
): { 
  selectedRoute: RoutePoint[]; 
  routeName: string;
  routeExplanation: string;
} => {
  // Ensure parameters and performance exist, with defaults if not
  const performance = parameters?.performance || { speed: 50, accuracy: 50, adaptability: 50 };
  const { speed = 50, accuracy = 50, adaptability = 50 } = performance;
  
  // Calculate scores for each route based on performance metrics
  const routeScores = routeVariations.map(route => {
    let score = 0;
    
    // For DBRX (Rat) - prioritize efficiency and accuracy
    if (modelId === 'dbrx') {
      // Higher accuracy -> prefer more complex routes
      score += (accuracy / 100) * route.characteristics.complexity * 0.4;
      
      // Higher speed -> prefer more efficient routes
      score += (speed / 100) * route.characteristics.efficiency * 0.4;
      
      // Lower adaptability -> avoid risky routes
      score += (1 - (adaptability / 100)) * (100 - route.characteristics.risk) * 0.2;
    } 
    // For Mistral (Pigeon) - prioritize adaptability and risk-taking
    else {
      // Higher adaptability -> can handle complex routes
      score += (adaptability / 100) * route.characteristics.complexity * 0.4;
      
      // Higher speed -> prefer more efficient routes
      score += (speed / 100) * route.characteristics.efficiency * 0.3;
      
      // Higher adaptability -> can handle risky routes
      score += (adaptability / 100) * route.characteristics.risk * 0.3;
    }
    
    return { route, score };
  });
  
  // Sort routes by score and select the best one
  routeScores.sort((a, b) => b.score - a.score);
  const selectedRouteOption = routeScores[0].route;
  
  // Generate explanation based on the selected route and performance metrics
  let explanation = '';
  
  if (modelId === 'dbrx') {
    if (accuracy > 70) {
      explanation = `The Rat's high accuracy (${accuracy}%) allows it to navigate the ${selectedRouteOption.name.toLowerCase()} with precision, making optimal decisions at each turn.`;
    } else if (speed > 70) {
      explanation = `With its high speed optimization (${speed}%), the Rat calculates the most efficient path through the ${selectedRouteOption.name.toLowerCase()}.`;
    } else if (adaptability > 70) {
      explanation = `The Rat's adaptability (${adaptability}%) enables it to process multiple variables along the ${selectedRouteOption.name.toLowerCase()}.`;
    } else {
      explanation = `The Rat's balanced performance metrics make the ${selectedRouteOption.name.toLowerCase()} an optimal choice for its algorithmic decision-making.`;
    }
  } else {
    if (adaptability > 70) {
      explanation = `The Pigeon's high adaptability (${adaptability}%) allows it to intuitively navigate the changing conditions of the ${selectedRouteOption.name.toLowerCase()}.`;
    } else if (speed > 70) {
      explanation = `With its speed-focused parameters (${speed}%), the Pigeon instinctively chooses the ${selectedRouteOption.name.toLowerCase()} for rapid progress.`;
    } else if (accuracy > 70) {
      explanation = `The Pigeon's accuracy (${accuracy}%) guides its intuition through the precise maneuvers required by the ${selectedRouteOption.name.toLowerCase()}.`;
    } else {
      explanation = `The Pigeon's balanced capabilities make the ${selectedRouteOption.name.toLowerCase()} a natural choice for its adaptive flying style.`;
    }
  }
  
  return {
    selectedRoute: selectedRouteOption.points,
    routeName: selectedRouteOption.name,
    routeExplanation: explanation
  };
};

// Function to convert route points to the format expected by the race visualization
export const convertRouteToRaceFormat = (route: RoutePoint[]): number[][] => {
  return route.map(point => [point.longitude, point.latitude, point.altitude]);
};

// Export the start and finish points for reference
export const getFixedPoints = () => ({
  startPoint: START_POINT,
  finishPoint: FINISH_POINT
});