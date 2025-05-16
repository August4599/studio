
"use client";
import React, { useState } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Shapes, GalleryHorizontal, Search, UploadCloud, Puzzle, Cloud, Globe, Star, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock asset item structure
interface AssetItem {
  id: string;
  name: string;
  type: 'model' | 'material' | 'decal' | 'hdri' | 'texture';
  thumbnail: string; // URL to thumbnail
  category?: string;
  source?: 'local' | 'cloud' | 'premium';
}

const mockAssets: AssetItem[] = [
  { id: 'model-1', name: 'Modern Sofa Set', type: 'model', thumbnail: 'https://placehold.co/120x90.png', category: 'Furniture', source: 'local' },
  { id: 'model-2', name: 'Oak Tree (Summer)', type: 'model', thumbnail: 'https://placehold.co/120x90.png', category: 'Vegetation', source: 'cloud' },
  { id: 'model-3', name: 'Street Lamp Post', type: 'model', thumbnail: 'https://placehold.co/120x90.png', category: 'Exterior Props', source: 'cloud' },
  { id: 'mat-1', name: 'Brushed Metal Dark', type: 'material', thumbnail: 'https://placehold.co/100x80.png', category: 'Metals', source: 'local' },
  { id: 'mat-2', name: 'Polished Concrete Floor', type: 'material', thumbnail: 'https://placehold.co/100x80.png', category: 'Concrete', source: 'cloud' },
  { id: 'mat-3', name: 'Red Brick Wall', type: 'material', thumbnail: 'https://placehold.co/100x80.png', category: 'Bricks', source: 'premium' },
  { id: 'decal-1', name: 'Graffiti Spray Paint', type: 'decal', thumbnail: 'https://placehold.co/100x80.png', category: 'Urban', source: 'local' },
  { id: 'decal-2', name: 'Wet Footprints', type: 'decal', thumbnail: 'https://placehold.co/100x80.png', category: 'Effects', source: 'cloud' },
  { id: 'hdri-1', name: 'Studio Light Setup', type: 'hdri', thumbnail: 'https://placehold.co/120x60.png', category: 'Studio', source: 'local' },
  { id: 'hdri-2', name: 'Sunset Over Mountains', type: 'hdri', thumbnail: 'https://placehold.co/120x60.png', category: 'Nature', source: 'cloud' },
  { id: 'texture-1', name: 'Wood Grain Diffuse', type: 'texture', thumbnail: 'https://placehold.co/100x100.png', category: 'Wood', source: 'local' },
  { id: 'texture-2', name: 'Metal Scratches Normal', type: 'texture', thumbnail: 'https://placehold.co/100x100.png', category: 'Imperfections', source: 'cloud' },
];


const AssetCard: React.FC<{ asset: AssetItem }> = ({ asset }) => {
  const Icon = 
    asset.type === 'model' ? Shapes : 
    asset.type === 'material' ? Package : 
    asset.type === 'hdri' ? Globe :
    asset.type === 'texture' ? GalleryHorizontal : GalleryHorizontal; // Decals and textures use same for now
  
  const hintText = 
    asset.type === 'model' ? "3d model" :
    asset.type === 'material' ? "pbr material" :
    asset.type === 'decal' ? "surface decal" :
    asset.type === 'hdri' ? "environment map" :
    asset.type === 'texture' ? "image texture" : "asset example";

  return (
    <div className="border rounded-md p-2 hover:shadow-md transition-shadow cursor-pointer bg-background relative group">
      <img src={asset.thumbnail} alt={asset.name} data-ai-hint={hintText} className="w-full h-20 object-cover rounded-sm bg-muted mb-1.5"/>
      <div className="flex items-center gap-1 text-xs mb-0.5">
        <Icon size={12} className="text-muted-foreground shrink-0"/>
        <p className="font-medium truncate flex-grow" title={asset.name}>{asset.name}</p>
      </div>
      {asset.category && <p className="text-[10px] text-muted-foreground truncate">{asset.category}</p>}
      {asset.source === 'cloud' && <Cloud size={10} className="absolute top-1 right-1 text-sky-500 opacity-70" title="Cloud Asset"/>}
      {asset.source === 'premium' && <Star size={10} className="absolute top-1 right-1 text-amber-500 opacity-70" title="Premium Asset"/>}
      <Button variant="outline" size="xs" className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] h-5 px-1.5" disabled>Add (WIP)</Button>
    </div>
  );
};


const AssetLibraryPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'models' | 'materials' | 'decals' | 'hdris' | 'textures'>('models');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');

  const categoriesByType = {
    models: ['All', 'Furniture', 'Vegetation', 'Exterior Props', 'Vehicles', 'People'],
    materials: ['All', 'Metals', 'Concrete', 'Bricks', 'Wood', 'Fabrics', 'Glass', 'Plastics'],
    decals: ['All', 'Urban', 'Effects', 'Signage', 'Imperfections'],
    hdris: ['All', 'Studio', 'Nature', 'Urban', 'Interior', 'Sky'],
    textures: ['All', 'Wood', 'Imperfections', 'Fabrics', 'Ground', 'Metal'],
  };

  const sources = ['All', 'Local', 'Cloud', 'Premium'];

  const filteredAssets = mockAssets.filter(asset => {
    const typeMatch = 
        (activeTab === 'models' && asset.type === 'model') ||
        (activeTab === 'materials' && asset.type === 'material') ||
        (activeTab === 'decals' && asset.type === 'decal') ||
        (activeTab === 'hdris' && asset.type === 'hdri') ||
        (activeTab === 'textures' && asset.type === 'texture');
    const nameMatch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = filterCategory === 'all' || asset.category?.toLowerCase() === filterCategory.toLowerCase();
    const sourceMatch = filterSource === 'all' || asset.source?.toLowerCase() === filterSource.toLowerCase();
    
    return typeMatch && nameMatch && categoryMatch && sourceMatch;
  });

  return (
    <AccordionItem value="item-asset-library">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Puzzle size={18} /> Asset Library
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-2 p-1 text-xs">
        <div className="flex flex-col sm:flex-row gap-1.5 p-1">
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
            <Button variant="outline" size="icon" className="h-8 w-8" disabled title="Cloud Sync (WIP)"><Cloud size={14}/></Button>
        </div>
        
        <Tabs defaultValue="models" onValueChange={(value) => { setActiveTab(value as any); setFilterCategory('all'); }} className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 h-auto sm:h-9 p-0.5">
                <TabsTrigger value="models" className="text-xs h-full py-1.5 sm:py-auto"><Shapes size={14} className="mr-1"/> Models</TabsTrigger>
                <TabsTrigger value="materials" className="text-xs h-full py-1.5 sm:py-auto"><Package size={14} className="mr-1"/> Materials</TabsTrigger>
                <TabsTrigger value="decals" className="text-xs h-full py-1.5 sm:py-auto"><GalleryHorizontal size={14} className="mr-1"/> Decals</TabsTrigger>
                <TabsTrigger value="hdris" className="text-xs h-full py-1.5 sm:py-auto"><Globe size={14} className="mr-1"/> HDRIs</TabsTrigger>
                <TabsTrigger value="textures" className="text-xs h-full py-1.5 sm:py-auto"><GalleryHorizontal size={14} className="mr-1"/> Textures</TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-2 p-1 my-1 border-b pb-2">
                <Select value={filterCategory} onValueChange={setFilterCategory} disabled>
                    <SelectTrigger className="h-7 text-xs flex-grow sm:flex-grow-0 sm:w-40"><Filter size={12} className="mr-1"/> Category: <SelectValue/></SelectTrigger>
                    <SelectContent>
                        {(categoriesByType[activeTab] || ['All']).map(cat => <SelectItem key={cat} value={cat} className="text-xs">{cat}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={filterSource} onValueChange={setFilterSource} disabled>
                     <SelectTrigger className="h-7 text-xs flex-grow sm:flex-grow-0 sm:w-32">Source: <SelectValue/></SelectTrigger>
                    <SelectContent>
                        {sources.map(src => <SelectItem key={src} value={src} className="text-xs">{src}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <ScrollArea className="h-[250px] w-full mt-1.5 p-0.5">
                {(['models', 'materials', 'decals', 'hdris', 'textures'] as const).map(tabKey => (
                     <TabsContent key={tabKey} value={tabKey} className="m-0">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {filteredAssets.map(asset => <AssetCard key={asset.id} asset={asset} />)}
                        </div>
                        {filteredAssets.length === 0 && <p className="text-center text-muted-foreground py-8 text-xs">No {tabKey} found matching criteria.</p>}
                    </TabsContent>
                ))}
            </ScrollArea>
        </Tabs>
        <p className="text-xs text-muted-foreground text-center pt-1 italic">Asset Library (WIP) - Mock assets. Drag & drop, cloud sync, and advanced filtering are future features.</p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default AssetLibraryPanel;
