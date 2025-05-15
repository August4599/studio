
"use client";
import React, { useState } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Shapes, GalleryHorizontal, Search, UploadCloud, Puzzle } from 'lucide-react';

// Mock asset item structure
interface AssetItem {
  id: string;
  name: string;
  type: 'model' | 'material' | 'decal';
  thumbnail: string; // URL to thumbnail
  category?: string;
}

const mockAssets: AssetItem[] = [
  { id: 'model-1', name: 'Modern Sofa', type: 'model', thumbnail: 'https://placehold.co/100x80.png', category: 'Furniture' },
  { id: 'model-2', name: 'Oak Tree', type: 'model', thumbnail: 'https://placehold.co/100x80.png', category: 'Vegetation' },
  { id: 'mat-1', name: 'Brushed Metal', type: 'material', thumbnail: 'https://placehold.co/100x80.png', category: 'Metals' },
  { id: 'mat-2', name: 'Concrete Floor', type: 'material', thumbnail: 'https://placehold.co/100x80.png', category: 'Concrete' },
  { id: 'decal-1', name: 'Graffiti Spray', type: 'decal', thumbnail: 'https://placehold.co/100x80.png', category: 'Urban' },
];


const AssetCard: React.FC<{ asset: AssetItem }> = ({ asset }) => {
  const Icon = asset.type === 'model' ? Shapes : asset.type === 'material' ? Package : GalleryHorizontal;
  return (
    <div className="border rounded-md p-2 hover:shadow-md transition-shadow cursor-pointer bg-background">
      <img src={asset.thumbnail} alt={asset.name} data-ai-hint="asset example" className="w-full h-20 object-cover rounded-sm bg-muted mb-1.5"/>
      <div className="flex items-center gap-1 text-xs mb-0.5">
        <Icon size={12} className="text-muted-foreground"/>
        <p className="font-medium truncate flex-grow" title={asset.name}>{asset.name}</p>
      </div>
      {asset.category && <p className="text-[10px] text-muted-foreground truncate">{asset.category}</p>}
    </div>
  );
};


const AssetLibraryPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'models' | 'materials' | 'decals'>('models');

  const filteredAssets = mockAssets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (activeTab === 'models' && asset.type === 'model' ||
     activeTab === 'materials' && asset.type === 'material' ||
     activeTab === 'decals' && asset.type === 'decal')
  );

  return (
    <AccordionItem value="item-asset-library">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Puzzle size={18} /> Asset Library
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-2 p-1 text-xs">
        <div className="flex gap-1.5 p-1">
            <div className="relative flex-grow">
                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                <Input 
                    placeholder="Search assets (WIP)..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 text-xs pl-7"
                />
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs" disabled><UploadCloud size={14} className="mr-1.5"/> Import (WIP)</Button>
        </div>
        
        <Tabs defaultValue="models" onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-9 p-0.5">
                <TabsTrigger value="models" className="text-xs h-full"><Shapes size={14} className="mr-1"/> Models</TabsTrigger>
                <TabsTrigger value="materials" className="text-xs h-full"><Package size={14} className="mr-1"/> Materials</TabsTrigger>
                <TabsTrigger value="decals" className="text-xs h-full"><GalleryHorizontal size={14} className="mr-1"/> Decals</TabsTrigger>
            </TabsList>
            <ScrollArea className="h-[250px] w-full mt-1.5 p-0.5">
                <TabsContent value="models">
                    <div className="grid grid-cols-2 gap-2">
                        {filteredAssets.map(asset => <AssetCard key={asset.id} asset={asset} />)}
                    </div>
                    {filteredAssets.length === 0 && <p className="text-center text-muted-foreground py-8 text-xs">No models found.</p>}
                </TabsContent>
                 <TabsContent value="materials">
                    <div className="grid grid-cols-2 gap-2">
                        {filteredAssets.map(asset => <AssetCard key={asset.id} asset={asset} />)}
                    </div>
                     {filteredAssets.length === 0 && <p className="text-center text-muted-foreground py-8 text-xs">No materials found.</p>}
                </TabsContent>
                 <TabsContent value="decals">
                    <div className="grid grid-cols-2 gap-2">
                        {filteredAssets.map(asset => <AssetCard key={asset.id} asset={asset} />)}
                    </div>
                     {filteredAssets.length === 0 && <p className="text-center text-muted-foreground py-8 text-xs">No decals found.</p>}
                </TabsContent>
            </ScrollArea>
        </Tabs>
        <p className="text-xs text-muted-foreground text-center pt-1 italic">Asset Library (WIP) - Placeholder with mock assets.</p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default AssetLibraryPanel;
