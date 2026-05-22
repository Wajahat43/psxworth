import { Button } from "@/components/ui/button";
import { Download, Smartphone, X } from "lucide-react";

type PWAInstallAnnouncementProps = {
  onInstall: () => void;
  onDismiss: () => void;
};

export const PWAInstallAnnouncement = ({ onInstall, onDismiss }: PWAInstallAnnouncementProps) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center space-x-3 flex-1">
      <div className="flex-shrink-0">
        <div className="bg-white/20 rounded-lg p-1.5">
          <Smartphone className="h-4 w-4" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium sm:text-base">Install our app for a better experience</p>
      </div>
    </div>

    <div className="flex items-center space-x-3 ml-4">
      <Button
        onClick={onInstall}
        className="bg-white/90 hover:bg-white text-gray-900 font-medium py-1.5 px-3 text-sm flex items-center gap-2 hover:scale-105 transition-all duration-200"
      >
        <Download className="h-4 w-4" />
        <span>Install</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onDismiss}
        aria-label="Close banner"
        className="text-gray-100/80 hover:text-gray-100 hover:bg-white/10"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  </div>
);
