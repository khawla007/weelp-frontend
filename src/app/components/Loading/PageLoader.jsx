export function PageLoader({ message, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[90vh] w-full px-4 ${className}`}>
      <div className="relative">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-secondaryDark/10 blur-3xl rounded-full scale-150 animate-pulse"></div>

        {/* Bouncing dots container */}
        <div className="relative flex items-center gap-4 p-8 sm:p-10 rounded-3xl bg-white/60 backdrop-blur-md shadow-[0_20px_50px_rgba(88,143,122,0.1)] border border-white/40">
          <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-secondaryDark rounded-full animate-bounce"></span>
          <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-secondaryDark rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
          <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-secondaryDark rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
        </div>
      </div>

      {/* Optional message or default loading text */}
      <div className="mt-10 text-center">
        <p className="text-Nileblue font-semibold text-lg sm:text-xl tracking-tight animate-pulse">{message || 'Loading Experiences...'}</p>
        <p className="mt-2 text-secondaryDark/50 font-medium text-xs sm:text-sm uppercase tracking-[0.2em]">Please wait a moment</p>
      </div>
    </div>
  );
}
