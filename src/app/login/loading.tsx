import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#ebebeb] flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-[#00c653]"></div>
    </div>
  );
}
