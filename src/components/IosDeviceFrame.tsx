import React from 'react';
import { Wifi, Battery } from 'lucide-react';

interface IosDeviceFrameProps {
  deviceView: 'fullscreen' | 'iphone' | 'ipad';
  children: React.ReactNode;
}

export const IosDeviceFrame: React.FC<IosDeviceFrameProps> = ({ deviceView, children }) => {
  if (deviceView === 'fullscreen') {
    return <div className="w-full h-full relative overflow-hidden flex flex-col">{children}</div>;
  }

  const isIphone = deviceView === 'iphone';

  return (
    <div className="w-full h-full flex items-center justify-center p-3 sm:p-6 bg-neutral-200/80 overflow-auto">
      {/* Device Shell */}
      <div
        style={{
          width: isIphone ? '390px' : '780px',
          height: isIphone ? '844px' : '620px',
          maxHeight: '94vh'
        }}
        className="relative bg-neutral-900 rounded-[48px] p-3 shadow-2xl ring-1 ring-neutral-800 flex flex-col shrink-0 transition-all duration-300 select-none"
      >
        {/* Device Screen */}
        <div className="relative w-full h-full bg-neutral-100 rounded-[38px] overflow-hidden flex flex-col shadow-inner">
          {/* iOS Status Bar */}
          <div className="w-full h-11 px-7 flex items-center justify-between text-neutral-900 z-50 shrink-0 pointer-events-none">
            <span className="text-xs font-bold tracking-tight">9:41</span>

            {/* Dynamic Island on iPhone */}
            {isIphone && (
              <div className="w-24 h-6 bg-black rounded-full flex items-center justify-center -mt-1 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-800 mr-2" />
                <div className="w-2 h-2 rounded-full bg-blue-900/60" />
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* Screen Inner Content */}
          <div className="flex-1 relative overflow-hidden flex flex-col">
            {children}
          </div>

          {/* iOS Home Indicator Bar */}
          <div className="w-full h-5 flex items-center justify-center pb-1 pointer-events-none z-50 shrink-0">
            <div className="w-32 h-1 bg-neutral-900/40 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
