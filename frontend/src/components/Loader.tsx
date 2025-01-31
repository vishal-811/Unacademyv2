import { Loader2 } from "lucide-react";

export const Loader = () => {
  return (
    <div className="fixed flex items-center justify-center  bg-opacity-75 z-50 flex-1">
      <div className="flex flex-col items-center space-y-4 text-blue-500">
        <Loader2 className="w-12 h-12 animate-spin" />
        <span className="text-xl font-semibold">Loading...</span>
      </div>
     </div>
  );
};
