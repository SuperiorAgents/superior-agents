import { useState } from "react";
import { Button } from "./ui/button";
import { X, Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function ResponsiveSidebarWrapper(props) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Toggle Button - Visible on mobile/tablet only */}
      {!isDrawerOpen && (
        <div className="lg:hidden fixed top-6 left-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Drawer for small screens */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-80 transform bg-background shadow-lg transition-transform duration-300 ease-in-out flex flex-col px-4 ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        } lg:hidden`}
      >
        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDrawerOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <Sidebar {...props} />
      </div>

      {/* Normal Sidebar for lg+ screens */}
      <div className="hidden lg:block">
        <Sidebar {...props} />
      </div>
    </>
  );
}
