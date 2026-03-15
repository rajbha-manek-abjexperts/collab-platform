'use client';

import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, MoreHorizontal } from 'lucide-react';

interface CallControlsProps {
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
}

export default function CallControls({
  isMuted,
  isCameraOn,
  isScreenSharing,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
}: CallControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3 px-6 py-4 border-t border-gray-800 bg-gray-950">
      <button
        onClick={onToggleMute}
        className={`p-3 rounded-full transition-colors ${
          isMuted
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-gray-800 hover:bg-gray-700 text-white'
        }`}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      <button
        onClick={onToggleCamera}
        className={`p-3 rounded-full transition-colors ${
          !isCameraOn
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-gray-800 hover:bg-gray-700 text-white'
        }`}
        title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
      >
        {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
      </button>

      <button
        onClick={onToggleScreenShare}
        className={`p-3 rounded-full transition-colors ${
          isScreenSharing
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-800 hover:bg-gray-700 text-white'
        }`}
        title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
      >
        {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
      </button>

      <div className="w-px h-8 bg-gray-700 mx-1" />

      <button
        className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors"
        title="More options"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </div>
  );
}
