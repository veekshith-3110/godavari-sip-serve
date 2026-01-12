import { Download } from 'lucide-react';

interface VersionCheckProps {
  isOutdated: boolean;
  currentVersion: string;
  minVersion: string;
}

const VersionCheck = ({ isOutdated, currentVersion, minVersion }: VersionCheckProps) => {
  if (!isOutdated) return null;

  const handleUpdate = () => {
    // For web, just reload to get new version
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-[100] p-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Download className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Update Required
        </h1>
        
        <p className="text-muted-foreground mb-2">
          Your app version ({currentVersion}) is outdated.
        </p>
        <p className="text-muted-foreground mb-6">
          Please update to version {minVersion} or higher to continue.
        </p>

        <button
          onClick={handleUpdate}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          <Download className="w-5 h-5" />
          Update Now
        </button>
      </div>
    </div>
  );
};

export default VersionCheck;
