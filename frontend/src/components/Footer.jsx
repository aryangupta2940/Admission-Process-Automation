export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-sm font-semibold text-white">
              Developed &amp; Maintained By: Aryan Gupta, Aryan Tyagi, CSE-15
            </p>
            <p className="mt-0.5 text-xs text-slate-400">Full Stack Development Team</p>
          </div>
          <div className="text-xs text-slate-400">
            <p className="font-medium text-slate-200">
              &copy; 2026 ABESEC Ghaziabad. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
