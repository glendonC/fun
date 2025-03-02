import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Brain, Database, Scale, Layers, Users, Gauge, RefreshCw, Loader, MapPin } from 'lucide-react';
import PerformanceChart from './PerformanceChart';
import { selectRouteWithAI } from '../services/routeService';
import RoutePreview from './RoutePreview';

interface TuningPageProps {
  modelId: string;
  onBack: () => void;
  onStartRace: (parameters: any) => void;
  showHeader?: boolean;
}

const TuningPage: React.FC<TuningPageProps> = ({ modelId, onBack, onStartRace, showHeader = true }) => {
  const isRat = modelId === 'dbrx';
  const Icon = isRat ? Rat : Bird;
  const primaryColor = isRat ? 'amber' : 'blue';
  
  // Define parameters based on selected model
  const [parameters, setParameters] = useState<Record<string, number>>(
    isRat 
      ? {
          expertSelectionDepth: 50,
          tokenProcessingEfficiency: 50,
          knowledgeRetrievalScope: 50,
          precisionScaling: 50
        }
      : {
          transformerBlockEfficiency: 50,
          attentionHeadAllocation: 50,
          weightQuantization: 50,
          contextRefreshRate: 50
        }
  );

  // Calculate performance metrics based on parameters
  const [performance, setPerformance] = useState({
    speed: 50,
    accuracy: 50,
    adaptability: 50
  });

  // Route selection state
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [routeExplanation, setRouteExplanation] = useState<string>('');
  const [routeName, setRouteName] = useState<string>('');

  // Update performance metrics when parameters change
  useEffect(() => {
    if (isRat) {
      // DBRX (Rat) performance calculations
      const speed = 100 - (parameters.expertSelectionDepth * 0.3 + parameters.precisionScaling * 0.4 + parameters.knowledgeRetrievalScope * 0.3);
      const accuracy = (parameters.expertSelectionDepth * 0.4 + parameters.precisionScaling * 0.4 + parameters.knowledgeRetrievalScope * 0.2);
      const adaptability = (parameters.tokenProcessingEfficiency * 0.6 + parameters.knowledgeRetrievalScope * 0.4);
      
      setPerformance({
        speed: Math.min(100, Math.max(0, Math.round(speed))),
        accuracy: Math.min(100, Math.max(0, Math.round(accuracy))),
        adaptability: Math.min(100, Math.max(0, Math.round(adaptability)))
      });
    } else {
      // Mistral (Pigeon) performance calculations
      const speed = 100 - (parameters.transformerBlockEfficiency * 0.4 + parameters.weightQuantization * 0.4 + parameters.contextRefreshRate * 0.2);
      const accuracy = (parameters.transformerBlockEfficiency * 0.3 + parameters.attentionHeadAllocation * 0.4 + parameters.weightQuantization * 0.3);
      const adaptability = (parameters.attentionHeadAllocation * 0.3 + parameters.contextRefreshRate * 0.7);
      
      setPerformance({
        speed: Math.min(100, Math.max(0, Math.round(speed))),
        accuracy: Math.min(100, Math.max(0, Math.round(accuracy))),
        adaptability: Math.min(100, Math.max(0, Math.round(adaptability)))
      });
    }
  }, [parameters, isRat]);

  // Update route when performance metrics change
  useEffect(() => {
    const updateRoute = async () => {
      setIsRouteLoading(true);
      try {
        const result = await selectRouteWithAI(modelId, { performance });
        setSelectedRoute(result.selectedRoute);
        setRouteName(result.routeName);
        setRouteExplanation(result.routeExplanation);
      } catch (error) {
        console.error('Error selecting route:', error);
      } finally {
        setIsRouteLoading(false);
      }
    };

    // Debounce route updates to avoid too many API calls
    const debounceTimer = setTimeout(() => {
      updateRoute();
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [performance, modelId]);

  const handleParameterChange = (name: string, value: number) => {
    setParameters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStartRace = () => {
    onStartRace({
      modelId,
      parameters,
      performance,
      selectedRoute,
      routeName,
      routeExplanation
    });
  };

  // Get parameter config based on model
  const getParameterConfig = () => {
    if (isRat) {
      return [
        {
          name: 'expertSelectionDepth',
          label: 'Expert Selection Depth',
          icon: <Users className="h-5 w-5 text-gray-300" />,
          description: 'More experts = smarter but slower decisions',
          leftLabel: 'Fewer Experts',
          rightLabel: 'More Experts'
        },
        {
          name: 'tokenProcessingEfficiency',
          label: 'Token Processing Efficiency',
          icon: <Zap className="h-5 w-5 text-gray-300" />,
          description: 'Faster inference = riskier moves',
          leftLabel: 'Careful Processing',
          rightLabel: 'Rapid Processing'
        },
        {
          name: 'knowledgeRetrievalScope',
          label: 'Knowledge Retrieval Scope',
          icon: <Database className="h-5 w-5 text-gray-300" />,
          description: 'Short-term vs. long-term strategy',
          leftLabel: 'Short-term Focus',
          rightLabel: 'Long-term Planning'
        },
        {
          name: 'precisionScaling',
          label: 'Precision Scaling',
          icon: <Scale className="h-5 w-5 text-gray-300" />,
          description: 'FP16 = fast, FP32 = precise',
          leftLabel: 'Speed (FP16)',
          rightLabel: 'Precision (FP32)'
        }
      ];
    } else {
      return [
        {
          name: 'transformerBlockEfficiency',
          label: 'Transformer Block Efficiency',
          icon: <Layers className="h-5 w-5 text-gray-300" />,
          description: 'More depth = better reasoning, slower reaction',
          leftLabel: 'Shallow & Fast',
          rightLabel: 'Deep & Thorough'
        },
        {
          name: 'attentionHeadAllocation',
          label: 'Attention Head Allocation',
          icon: <Brain className="h-5 w-5 text-gray-300" />,
          description: 'Wide vs. focused perception',
          leftLabel: 'Broad Focus',
          rightLabel: 'Narrow Focus'
        },
        {
          name: 'weightQuantization',
          label: 'Weight Quantization',
          icon: <Gauge className="h-5 w-5 text-gray-300" />,
          description: 'Faster inference vs. precision',
          leftLabel: 'Speed Priority',
          rightLabel: 'Precision Priority'
        },
        {
          name: 'contextRefreshRate',
          label: 'Context Refresh Rate',
          icon: <RefreshCw className="h-5 w-5 text-gray-300" />,
          description: 'Frequent updates = adaptable but resource-heavy',
          leftLabel: 'Efficient Updates',
          rightLabel: 'Frequent Updates'
        }
      ];
    }
  };

  const parameterConfig = getParameterConfig();

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Back button only - more compact */}
      <div className="flex items-center mb-2">
        <motion.button
          onClick={onBack}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="h-5 w-5 text-gray-300" />
        </motion.button>
        <h2 className="ml-2 text-xl font-bold text-white">Pre-Race Tuning</h2>
      </div>

      {/* Model Info - Compact version */}
      <motion.div 
        className={`bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 mb-3 border border-gray-700 shadow-lg`}
        initial={{ y: 5 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center">
          <div className={`p-2 rounded-full bg-${primaryColor}-500/20 mr-3`}>
            <Icon className={`h-8 w-8 text-${primaryColor}-400`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{isRat ? 'Rat (DBRX)' : 'Pigeon (Mistral-Small-24B)'}</h3>
            <p className={`text-${primaryColor}-400 text-xs`}>
              {isRat 
                ? "Optimize for analytical decision-making and structured path planning."
                : "Tune for adaptive reactions and real-time decision making."}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Parameters Column - 7 columns on large screens */}
        <motion.div 
          className="lg:col-span-7"
          initial={{ x: -5, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 border border-gray-700 shadow-lg">
            <h3 className="text-base font-bold text-white mb-3">Tuning Parameters</h3>
            
            <div className="space-y-4">
              {parameterConfig.map((param) => (
                <div key={param.name} className="parameter-slider">
                  <div className="flex items-center mb-1">
                    <div className="mr-2">
                      {param.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">{param.label}</h4>
                      <p className="text-xs text-gray-400">{param.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-1">
                    <input
                      type="range"
                      id={param.name}
                      name={param.name}
                      min="0"
                      max="100"
                      value={parameters[param.name]}
                      onChange={(e) => handleParameterChange(param.name, parseInt(e.target.value))}
                      className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-${primaryColor}`}
                      style={{
                        background: `linear-gradient(to right, var(--tw-gradient-stops))`,
                        '--tw-gradient-from': `rgb(var(--${primaryColor}-500))`,
                        '--tw-gradient-to': `rgb(var(--${primaryColor}-300))`,
                        '--tw-gradient-stops': `var(--tw-gradient-from), var(--tw-gradient-to)`,
                      } as React.CSSProperties}
                    />
                    
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">{param.leftLabel}</span>
                      <span className="text-xs text-gray-400">{param.rightLabel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Route Preview - Below parameters */}
          <motion.div 
            className="mt-3 bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 border border-gray-700 shadow-lg"
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white">AI-Selected Route</h3>
              {isRouteLoading && (
                <div className="flex items-center">
                  <Loader className={`h-4 w-4 text-${primaryColor}-400 animate-spin mr-2`} />
                  <span className="text-gray-300 text-xs">Calculating route...</span>
                </div>
              )}
            </div>
            
            <div className="h-40 rounded-lg overflow-hidden mb-2 bg-gray-900/50">
              {selectedRoute ? (
                <RoutePreview 
                  route={selectedRoute} 
                  modelId={modelId} 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-gray-600 animate-pulse" />
                </div>
              )}
            </div>
            
            <div className="bg-gray-900/50 p-2 rounded-lg">
              <h4 className={`text-${primaryColor}-400 text-sm font-medium mb-1`}>{routeName || "Calculating optimal route..."}</h4>
              <p className="text-gray-300 text-xs">
                {routeExplanation || "The AI is analyzing the optimal route based on your racer's performance metrics..."}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Performance Preview Column - 5 columns on large screens */}
        <motion.div
          className="lg:col-span-5"
          initial={{ x: 5, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 border border-gray-700 shadow-lg h-full flex flex-col">
            <h3 className="text-base font-bold text-white mb-2">Performance Balance</h3>
            
            <div className="flex-grow flex items-center justify-center mb-3">
              <PerformanceChart 
                performance={performance} 
                color={primaryColor} 
              />
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Speed</span>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden mx-2 flex-grow">
                  <div 
                    className={`h-full bg-${primaryColor}-500`} 
                    style={{ width: `${performance.speed}%` }}
                  ></div>
                </div>
                <span className="text-white font-medium w-8 text-right text-sm">{performance.speed}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Accuracy</span>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden mx-2 flex-grow">
                  <div 
                    className={`h-full bg-${primaryColor}-500`} 
                    style={{ width: `${performance.accuracy}%` }}
                  ></div>
                </div>
                <span className="text-white font-medium w-8 text-right text-sm">{performance.accuracy}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Adaptability</span>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden mx-2 flex-grow">
                  <div 
                    className={`h-full bg-${primaryColor}-500`} 
                    style={{ width: `${performance.adaptability}%` }}
                  ></div>
                </div>
                <span className="text-white font-medium w-8 text-right text-sm">{performance.adaptability}%</span>
              </div>
            </div>
            
            <motion.button
              onClick={handleStartRace}
              className={`w-full py-3 px-6 bg-${primaryColor}-500 hover:bg-${primaryColor}-600 text-white text-lg font-bold rounded-lg shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-${primaryColor}-500 focus:ring-opacity-50`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isRouteLoading}
            >
              {isRouteLoading ? (
                <span className="flex items-center justify-center">
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Calculating Route...
                </span>
              ) : (
                "Start Race"
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Import the Rat and Bird icons from lucide-react
const Rat = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 16.5v-.77a2.73 2.73 0 0 1 3.27-2.68l3.02.6a1.4 1.4 0 0 0 1.5-2.08l-1.63-2.8a3 3 0 0 0-3.93-1.13l-2.46 1.1a2.73 2.73 0 0 1-3.63-2.24l-.21-1.9a2 2 0 0 0-2-1.8h-.59a2 2 0 0 0-2 2v.06a3.04 3.04 0 0 0 .67 1.9l1.33 1.77"/>
    <path d="M16 15h.01"/>
    <path d="M19 17h.01"/>
    <path d="M11.5 14.5a3.5 3.5 0 0 0-7 0"/>
    <path d="M9 11.5V11"/>
    <path d="M5 11.5V11"/>
    <path d="M8 19a2 2 0 0 1-2-2"/>
    <path d="M2 5l3 2"/>
    <path d="M19 5l-3 2"/>
  </svg>
);

const Bird = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15.5 3.5h-7l.5 3.5-3.5 3.5 3.5 3.5-.5 3.5h7l-.5-3.5 3.5-3.5-3.5-3.5.5-3.5Z"/>
    <path d="M10 8.5l-2.5 2.5 2.5 2.5"/>
    <path d="M14 8.5l2.5 2.5-2.5 2.5"/>
    <path d="M9 18.5l1.5 2.5h3l1.5-2.5"/>
  </svg>
);

export default TuningPage;