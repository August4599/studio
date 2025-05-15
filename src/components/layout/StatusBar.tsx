
"use client";
import React from 'react';

const StatusBar: React.FC = () => {
  // In a real app, these would come from context or state
  const cursorCoords = "X: 0.00 Y: 0.00 Z: 0.00";
  const selectionInfo = "No object selected";
  const systemMessage = "Ready";

  return (
    <div className="flex items-center justify-between border-t bg-card h-8 px-4 text-xs text-muted-foreground flex-none">
      <div className="flex items-center gap-4">
        <span>{systemMessage}</span>
      </div>
      <div className="flex items-center gap-4">
        <span>{selectionInfo} (WIP)</span>
        <span>{cursorCoords} (WIP)</span>
      </div>
    </div>
  );
};

export default StatusBar;
