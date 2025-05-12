"use client";

import React, { useCallback } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// import { Button } from "@/components/ui/button"; // No longer needed for AI button
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
// import { Textarea } from "@/components/ui/textarea"; // No longer needed for AI description
import { Checkbox } from "@/components/ui/checkbox";
import { useScene } from "@/context/scene-context";
import type { AmbientLightProps, DirectionalLightProps } from "@/types";
import { Lightbulb } from "lucide-react"; // Sparkles icon no longer needed
// import { useToast } from "@/hooks/use-toast"; // Toast no longer used here


const LightingPanel = () => {
  const { ambientLight, directionalLight, updateAmbientLight, updateDirectionalLight } = useScene();
  // const [aiDescription, setAiDescription] = useState(""); // AI state removed
  // const [isLoadingAi, setIsLoadingAi] = useState(false); // AI state removed
  // const { toast } = useToast(); // Toast no longer used here

  const handleAmbientChange = useCallback((property: keyof AmbientLightProps, value: any) => {
    updateAmbientLight({ [property]: value });
  }, [updateAmbientLight]);

  const handleDirectionalChange = useCallback((property: keyof DirectionalLightProps | `position.${number}`, value: any) => {
    if (typeof property === 'string' && property.startsWith('position.')) {
        const index = parseInt(property.split('.')[1]);
        const newPosition = [...directionalLight.position] as [number, number, number];
        newPosition[index] = parseFloat(value) || 0;
        updateDirectionalLight({ position: newPosition });
    } else {
        updateDirectionalLight({ [property as keyof DirectionalLightProps]: value });
    }
  }, [directionalLight.position, updateDirectionalLight]);

  // handleApplyAiLighting function removed
  
  const VectorInput: React.FC<{label: string; value: [number,number,number]; onChange: (idx: number, val: string) => void; step?: number}> = ({label, value, onChange, step = 0.1}) => (
    <div>
        <Label className="text-xs font-medium">{label}</Label>
        <div className="grid grid-cols-3 gap-2 mt-1">
            {['X', 'Y', 'Z'].map((axis, idx) => (
                <div key={axis}>
                    <Label htmlFor={`${label}-${axis}`} className="text-xs">{axis}</Label>
                    <Input id={`${label}-${axis}`} type="number" value={value[idx]} onChange={e => onChange(idx, e.target.value)} className="h-8 text-xs" step={step} />
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <AccordionItem value="item-lighting">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Lightbulb size={18} /> Lighting
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 p-2">
        {/* Ambient Light Controls */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Ambient Light</h4>
          <div className="space-y-1">
            <Label htmlFor="ambient-color" className="text-xs">Color</Label>
            <Input
              id="ambient-color"
              type="color"
              value={ambientLight.color}
              onChange={(e) => handleAmbientChange('color', e.target.value)}
              className="h-8 w-full"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ambient-intensity" className="text-xs">Intensity: {ambientLight.intensity.toFixed(2)}</Label>
            <Slider
              id="ambient-intensity"
              min={0} max={2} step={0.01}
              value={[ambientLight.intensity]}
              onValueChange={([val]) => handleAmbientChange('intensity', val)}
            />
          </div>
        </div>

        {/* Directional Light Controls */}
        <div className="space-y-2 border-t pt-3 mt-3">
          <h4 className="font-semibold text-sm">Directional Light</h4>
          <div className="space-y-1">
            <Label htmlFor="directional-color" className="text-xs">Color</Label>
            <Input
              id="directional-color"
              type="color"
              value={directionalLight.color}
              onChange={(e) => handleDirectionalChange('color', e.target.value)}
              className="h-8 w-full"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="directional-intensity" className="text-xs">Intensity: {directionalLight.intensity.toFixed(2)}</Label>
            <Slider
              id="directional-intensity"
              min={0} max={5} step={0.01} // Increased max for directional
              value={[directionalLight.intensity]}
              onValueChange={([val]) => handleDirectionalChange('intensity', val)}
            />
          </div>
          <VectorInput label="Position" value={directionalLight.position} onChange={(idx, val) => handleDirectionalChange(`position.${idx}` as any, val)} step={0.5}/>
          <div className="flex items-center space-x-2 pt-1">
            <Checkbox 
                id="cast-shadow" 
                checked={directionalLight.castShadow} 
                onCheckedChange={(checked) => handleDirectionalChange('castShadow', !!checked)}
            />
            <Label htmlFor="cast-shadow" className="text-xs font-normal">Cast Shadows</Label>
          </div>
           <div className="space-y-1">
            <Label htmlFor="directional-shadowBias" className="text-xs">Shadow Bias: {directionalLight.shadowBias.toFixed(5)}</Label>
            <Slider
              id="directional-shadowBias"
              min={-0.01} max={0.01} step={0.0001}
              value={[directionalLight.shadowBias]}
              onValueChange={([val]) => handleDirectionalChange('shadowBias', val)}
            />
          </div>
        </div>

        {/* AI Lighting Assistant Removed */}
      </AccordionContent>
    </AccordionItem>
  );
};

export default LightingPanel;
