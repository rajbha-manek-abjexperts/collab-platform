'use client';

import { useState } from 'react';
import { Phone, PhoneOff, Video, Users, Plus, Clock } from 'lucide-react';
import CallGrid from '@/components/CallGrid';
import CallControls from '@/components/CallControls';

interface CallRoom {
  id: string;
  name: string;
  participants: { id: string; name: string; avatar?: string }[];
  startedAt: string;
  isActive: boolean;
}

const mockRooms: CallRoom[] = [
  {
    id: '1',
    name: 'Design Sync',
    participants: [
      { id: 'u1', name: 'Alice' },
      { id: 'u2', name: 'Bob' },
    ],
    startedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    isActive: true,
  },
  {
    id: '2',
    name: 'Sprint Planning',
    participants: [
      { id: 'u3', name: 'Charlie' },
      { id: 'u4', name: 'Dana' },
      { id: 'u5', name: 'Eve' },
    ],
    startedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    isActive: true,
  },
  {
    id: '3',
    name: 'Client Demo',
    participants: [],
    startedAt: '',
    isActive: false,
  },
];

function formatDuration(startedAt: string): string {
  const diff = Date.now() - new Date(startedAt).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  return `${mins}m`;
}

export default function CallsPage() {
  const [activeRoom, setActiveRoom] = useState<CallRoom | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  if (activeRoom) {
    return (
      <div className="flex flex-col h-full bg-gray-950">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-lg font-semibold text-white">{activeRoom.name}</h2>
            <span className="text-sm text-gray-400">
              {activeRoom.participants.length} participant{activeRoom.participants.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={() => setActiveRoom(null)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <PhoneOff className="w-4 h-4" />
            Leave
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-6">
          <CallGrid participants={activeRoom.participants} />
        </div>

        <CallControls
          isMuted={isMuted}
          isCameraOn={isCameraOn}
          isScreenSharing={isScreenSharing}
          onToggleMute={() => setIsMuted(!isMuted)}
          onToggleCamera={() => setIsCameraOn(!isCameraOn)}
          onToggleScreenShare={() => setIsScreenSharing(!isScreenSharing)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Video Calls</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Join or start a video call with your team</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" />
            New Call
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockRooms.map((room) => (
            <div
              key={room.id}
              className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors bg-white dark:bg-gray-900"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${room.isActive ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <Video className={`w-5 h-5 ${room.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{room.name}</h3>
                    {room.isActive && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{formatDuration(room.startedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
                {room.isActive && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
                    Live
                  </span>
                )}
              </div>

              {room.isActive && room.participants.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div className="flex -space-x-2">
                    {room.participants.map((p) => (
                      <div
                        key={p.id}
                        className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-900"
                        title={p.name}
                      >
                        {p.name[0]}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{room.participants.length} in call</span>
                </div>
              )}

              <button
                onClick={() => setActiveRoom(room)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  room.isActive
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Phone className="w-4 h-4" />
                {room.isActive ? 'Join Call' : 'Start Call'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
