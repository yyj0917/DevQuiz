'use client';

export function SplashScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e3a8a]">
      <div className="text-center">
        <div className="text-white text-4xl font-bold mb-2 lowercase">
          DevQuiz
        </div>
        <div className="flex justify-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
        </div>
      </div>
    </div>
  );
}

