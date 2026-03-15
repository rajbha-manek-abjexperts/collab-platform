'use client';

import { Video, VideoOff, Mic, MicOff } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
}

interface CallGridProps {
  participants: Participant[];
}

const gradients = [
  'from-blue-600 to-indigo-700',
  'from-purple-600 to-pink-700',
  'from-emerald-600 to-teal-700',
  'from-orange-600 to-red-700',
  'from-cyan-600 to-blue-700',
  'from-pink-600 to-rose-700',
];

function getGridClass(count: number): string {
  if (count <= 1) return 'grid-cols-1';
  if (count <= 4) return 'grid-cols-1 md:grid-cols-2';
  if (count <= 6) return 'grid-cols-2 md:grid-cols-3';
  return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
}

export default function CallGrid({ participants }: CallGridProps) {
  const allParticipants = [
    { id: 'self', name: 'You' },
    ...participants,
  ];

  return (
    <div className={`grid ${getGridClass(allParticipants.length)} gap-3 h-full`}>
      {allParticipants.map((participant, index) => (
        <div
          key={participant.id}
          className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center min-h-[200px]`}
        >
          {/* Placeholder for video stream */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-semibold">
              {participant.name[0]}
            </div>
            <span className="text-white font-medium text-lg">{participant.name}</span>
          </div>

          {/* Status indicators */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-black/40 backdrop-blur-sm">
              <Mic className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="p-1.5 rounded-full bg-black/40 backdrop-blur-sm">
              <Video className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* Name tag */}
          <div className="absolute bottom-3 right-3">
            <span className="px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm text-white text-xs font-medium">
              {participant.name}
            </span>
          </div>

          {participant.id === 'self' && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-0.5 rounded-full bg-blue-500/80 backdrop-blur-sm text-white text-xs font-medium">
                You
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
