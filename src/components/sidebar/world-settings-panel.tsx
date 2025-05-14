
"use client";

import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Globe2, Image as ImageIcon, Grid3X3 } from "lucide-react"; 
import { Checkbox } from "@/components/ui/checkbox";
import { useScene } from "@/context/scene-context";

const WorldSettingsPanel = () => {
  const { worldBackgroundColor, setWorldBackgroundColor } = useScene();
  const [useHdri, setUseHdri] = React.useState(false); // Keep local as HDRI is placeholder
  const [showGridInRender, setShowGridInRender] = React.useState(false); // Keep local as placeholder

  return (
    <AccordionItem value="item-world-settings">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Globe2 size={18} /> World Settings
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 p-2">
        <div className="space-y-1">
          <Label htmlFor="world-bg-color" className="text-xs">Background Color</Label>
          <Input
            id="world-bg-color"
            type="color"
            value={worldBackgroundColor}
            onChange={(e) => setWorldBackgroundColor(e.target.value)}
            className="h-9 w-full" 
            disabled={useHdri} 
          />
           {useHdri && <p className="text-xs text-muted-foreground italic">Color overridden by HDRI.</p>}
        </div>

        <div className="space-y-2 border-t pt-3 mt-3">
            <h4 className="font-semibold text-sm flex items-center gap-2"><ImageIcon size={16}/> Environment Map (HDRI)</h4>
            <div className="flex items-center space-x-2">
                <Checkbox 
                    id="use-hdri" 
                    checked={useHdri} 
                    onCheckedChange={(checked) => setUseHdri(!!checked)}
                />
                <Label htmlFor="use-hdri" className="text-xs font-normal">Use HDRI</Label>
            </div>
            <Button variant="outline" size="sm" className="w-full text-sm h-9" disabled={!useHdri}>Upload HDRI (Coming Soon)</Button> 
            {useHdri && <p className="text-xs text-muted-foreground">Select an equirectangular HDR image for environment lighting and reflections.</p>}
        </div>
        
        <div className="space-y-2 border-t pt-3 mt-3">
            <h4 className="font-semibold text-sm flex items-center gap-2"><Grid3X3 size={16}/> Grid</h4>
            <div className="flex items-center space-x-2">
                <Checkbox 
                    id="show-grid-render" 
                    checked={showGridInRender} 
                    onCheckedChange={(checked) => setShowGridInRender(!!checked)}
                />
                <Label htmlFor="show-grid-render" className="text-xs font-normal">Show Grid in Final Render</Label>
            </div>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          HDRI and Grid in Render are placeholders. Background color is functional.
        </p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default WorldSettingsPanel;
