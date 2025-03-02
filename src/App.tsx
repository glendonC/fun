import React, { useState } from 'react';
import { Bird, Rat } from 'lucide-react';
import ModelCard from './components/ModelCard';
import Header from './components/Header';
// Import from the new module structure
import { RaceVisualization } from './modules/race';
import TuningPage from './components/TuningPage';

function App() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceParameters, setRaceParameters] = useState<any>(null);

  const models = [
    {
      id: 'dbrx',
      name: 'Rat',
      fullName: 'Rat (DBRX)',
      icon: Rat,
      description: 'A precision-optimized racer that calculates every move like a high-speed algorithm. Great at analytical turns and structured decision-making—but will it overthink itself into a corner?',
      primaryColor: 'amber-500',
      secondaryColor: 'amber-300',
      accentColor: 'amber-600',
      glowColor: 'amber-400/20',
      textColor: 'amber-100'
    },
    {
      id: 'mistral',
      name: 'Pigeon',
      fullName: 'Pigeon (Mistral-Small-24B)',
      icon: Bird,
      description: 'An adaptable and fast racer that makes gut-feeling decisions in real time. Great at reacting to new challenges, but sometimes its improvisation leads to unexpected detours!',
      primaryColor: 'blue-500',
      secondaryColor: 'blue-300',
      accentColor: 'blue-600',
      glowColor: 'blue-400/20',
      textColor: 'blue-100'
    }
  ];

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    console.log(`Selected model: ${modelId}`);
  };

  const handleStartRace = (parameters: any) => {
    setRaceParameters(parameters);
    setRaceStarted(true);
    console.log('Race started with parameters:', parameters);
  };

  const handleBackToSelection = () => {
    setRaceStarted(false);
    setSelectedModel(null);
  };

  const renderContent = () => {
    if (raceStarted) {
      return (
        <RaceVisualization 
          modelId={selectedModel!}
          parameters={raceParameters}
          onBack={handleBackToSelection}
        />
      );
    }
    
    if (selectedModel) {
      // Pre-race tuning page
      return (
        <TuningPage 
          modelId={selectedModel}
          onBack={() => setSelectedModel(null)}
          onStartRace={handleStartRace}
          showHeader={false} // Don't show header on tuning page
        />
      );
    }
    
    // Model selection page
    return (
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
        {models.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            onSelect={() => handleSelectModel(model.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800/50 via-gray-900 to-black pointer-events-none"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {!raceStarted && !selectedModel && <Header />}
        {renderContent()}
      </div>
    </div>
  );
}

export default App;