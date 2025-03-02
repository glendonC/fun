import React, { useEffect, useRef } from 'react';

interface PerformanceChartProps {
  performance: {
    speed: number;
    accuracy: number;
    adaptability: number;
  };
  color: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ performance, color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set dimensions
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    // Draw background
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(30, 30, 30, 0.5)';
    ctx.fill();
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
    ctx.lineWidth = 1;
    
    // Draw concentric circles
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * i / 3, 0, 2 * Math.PI);
      ctx.stroke();
    }
    
    // Draw axis lines
    const angles = [0, 2 * Math.PI / 3, 4 * Math.PI / 3];
    const labels = ['Speed', 'Accuracy', 'Adaptability'];
    
    angles.forEach((angle, i) => {
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // Draw labels
      const labelX = centerX + (radius + 15) * Math.cos(angle);
      const labelY = centerY + (radius + 15) * Math.sin(angle);
      
      ctx.fillStyle = 'white';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labels[i], labelX, labelY);
    });
    
    // Calculate points for the performance triangle
    const points = angles.map((angle, i) => {
      const value = Object.values(performance)[i] / 100;
      const x = centerX + radius * value * Math.cos(angle);
      const y = centerY + radius * value * Math.sin(angle);
      return { x, y };
    });
    
    // Draw performance area
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    
    // Fill with gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    
    if (color === 'amber') {
      gradient.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
      gradient.addColorStop(1, 'rgba(217, 119, 6, 0.4)');
    } else {
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
      gradient.addColorStop(1, 'rgba(37, 99, 235, 0.4)');
    }
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw outline
    ctx.strokeStyle = color === 'amber' ? '#F59E0B' : '#3B82F6';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw points
    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.strokeStyle = color === 'amber' ? '#F59E0B' : '#3B82F6';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    
  }, [performance, color]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={200} 
      height={200} 
      className="max-w-full"
    />
  );
};

export default PerformanceChart;