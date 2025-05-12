
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
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { CodeXml } from "lucide-react"; // Using CodeXml as a placeholder logo icon

export default function ArchiVisionApp() {
  return (
    <SceneProvider>
      <SidebarProvider defaultOpen>
        <Sidebar variant="sidebar" collapsible="icon" className="border-r">
          <SidebarHeader className="p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CodeXml className="w-7 h-7 text-accent" />
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
           <div className="p-2 md:hidden border-b flex items-center justify-start">
             <SidebarTrigger/>
             <div className="flex items-center gap-2 ml-2">
                <CodeXml className="w-5 h-5 text-accent" />
                <h1 className="text-lg font-semibold">ArchiVision</h1>
              </div>
           </div>
          <div className="flex-grow overflow-hidden"> {/* This div takes remaining space */}
            <SceneViewer />
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </SceneProvider>
  );
}
