
import { SceneProvider } from "@/context/scene-context";
import SceneViewer from "@/components/scene/viewer";
import MainSidebar from "@/components/sidebar/main-sidebar";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
// Button is not directly used here anymore
// import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { CodeXml, Workflow } from "lucide-react"; // Using Workflow as a placeholder for node-based icon

export default function ArchiVisionApp() {
  return (
    <SceneProvider>
      <SidebarProvider defaultOpen>
        <Sidebar variant="sidebar" collapsible="icon" className="border-r">
          <SidebarHeader className="p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {/* Changed icon to reflect node-based approach */}
              <Workflow className="w-7 h-7 text-accent" /> 
              <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden">ArchiVision</h1>
            </div>
            <SidebarTrigger className="md:hidden" />
          </SidebarHeader>
          <SidebarContent>
            {/* MainSidebar now contains simplified panels (Lighting, Scene) */}
            <MainSidebar /> 
          </SidebarContent>
          <SidebarFooter className="p-2 group-data-[collapsible=icon]:hidden">
            <p className="text-xs text-muted-foreground">© 2024 ArchiVision</p>
          </SidebarFooter>
        </Sidebar>
        
        {/* SidebarInset is the main content area */}
        <SidebarInset className="flex flex-col h-screen">
           <div className="p-2 md:hidden border-b flex items-center justify-start">
             <SidebarTrigger/>
             <div className="flex items-center gap-2 ml-2">
                <Workflow className="w-5 h-5 text-accent" />
                <h1 className="text-lg font-semibold">ArchiVision</h1>
              </div>
           </div>
          
          {/* This area will eventually host the node editor and the scene viewer */}
          <div className="flex-grow flex flex-col overflow-hidden">
            {/* Placeholder for Node Editor Area - conceptually above or alongside SceneViewer */}
            <div className="p-4 border-b text-center bg-muted/50 text-muted-foreground text-sm">
              Node Editor Area (Future Development)
            </div>
            
            {/* Scene Viewer takes up the remaining space */}
            <div className="flex-grow overflow-hidden">
              <SceneViewer />
            </div>
          </div>

        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </SceneProvider>
  );
}
