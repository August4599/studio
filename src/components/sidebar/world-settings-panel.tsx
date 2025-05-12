
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
import { Globe2, Image as ImageIcon, Grid3X3 } from "lucide-react"; // Globe for World, Image for HDRI
import { Checkbox } from "@/components/ui/checkbox";

const WorldSettingsPanel = () => {
  // Placeholder states
  const [bgColor, setBgColor] = React.useState("#f0f0f0"); // Default to match scene viewer
  const [useHdri, setUseHdri] = React.useState(false);
  const [showGridInRender, setShowGridInRender] = React.useState(false);

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
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="h-8 w-full"
            disabled={useHdri} // Disable if HDRI is active
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
            <Button variant="outline" size="sm" className="w-full text-xs" disabled={!useHdri}>Upload HDRI (Coming Soon)</Button>
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
          World settings are for demonstration. Full functionality is under development.
        </p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default WorldSettingsPanel;
