
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
import { Toaster } from "@/components/ui/toaster";
import { Workflow } from "lucide-react"; 

// Inline SVG for Node Editor Icon (simple placeholder)
const NodeEditorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 opacity-80">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <circle cx="15.5" cy="8.5" r="1.5"></circle>
    <circle cx="8.5" cy="15.5" r="1.5"></circle>
    <circle cx="15.5" cy="15.5" r="1.5"></circle>
    <line x1="8.5" y1="10" x2="8.5" y2="14"></line>
    <line x1="15.5" y1="10" x2="15.5" y2="14"></line>
    <line x1="10" y1="8.5" x2="14" y2="8.5"></line>
    <line x1="10" y1="15.5" x2="14" y2="15.5"></line>
  </svg>
);


export default function ArchiVisionApp() {
  return (
    <SceneProvider>
      <SidebarProvider defaultOpen>
        <Sidebar variant="sidebar" collapsible="icon" className="border-r">
          <SidebarHeader className="p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Workflow className="w-7 h-7 text-accent" /> 
              <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden">ArchiVision</h1>
            </div>
            <SidebarTrigger className="md:hidden" />
          </SidebarHeader>
          <SidebarContent>
            <MainSidebar /> 
          </SidebarContent>
          <SidebarFooter className="p-2 group-data-[collapsible=icon]:hidden">
            <p className="text-xs text-muted-foreground">© 2024 ArchiVision</p>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="flex flex-col h-screen">
           <div className="p-2 md:hidden border-b flex items-center justify-start sticky top-0 bg-background z-10">
             <SidebarTrigger/>
             <div className="flex items-center gap-2 ml-2">
                <Workflow className="w-5 h-5 text-accent" />
                <h1 className="text-lg font-semibold">ArchiVision</h1>
              </div>
           </div>
          
          <div className="flex-grow flex flex-col overflow-hidden">
            {/* Node Editor Area - Enhanced Placeholder */}
            <div className="flex-none h-[40%] min-h-[200px] flex flex-col border-b bg-card shadow-sm overflow-hidden">
              <div className="p-3 border-b bg-muted/30 dark:bg-muted/10">
                <h2 className="text-base font-semibold text-foreground flex items-center">
                  <NodeEditorIcon />
                  Node Editor
                </h2>
              </div>
              <div className="flex-grow p-4 flex items-center justify-center text-muted-foreground">
                <span className="italic text-sm">Node-based scene construction area (Future Development)</span>
              </div>
            </div>
            
            {/* Scene Viewer takes up the remaining space */}
            <div className="flex-grow overflow-hidden relative"> {/* Added relative for potential overlays/controls on viewer */}
              <SceneViewer />
            </div>
          </div>

        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </SceneProvider>
  );
}
