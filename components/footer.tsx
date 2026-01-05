export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white py-4 px-4 sm:px-8 z-40">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
          <span className="text-sm font-semibold text-slate-300">Made by:</span>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">Dheeraj Sharma</span>
              <span className="text-xs text-slate-400 italic">RA2211027010017</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">Srijita Seth</span>
              <span className="text-xs text-slate-400 italic">RA2211027010036</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">Piyush Mishra</span>
              <span className="text-xs text-slate-400 italic">RA2211027010038</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-1 text-center sm:text-right">
          <span className="text-sm font-semibold text-slate-300">Under the Guidance of:</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">Dr. K. Priyadarsini</span>
            <span className="text-xs text-slate-400 italic">Associate Professor</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
