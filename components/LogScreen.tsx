
import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';

export const LogScreen: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
  const endOfLogsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-base-200 rounded-lg p-6 shadow-lg border border-base-300">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-ink-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        Agent Execution Log
      </h2>
      <div className="h-[70vh] overflow-y-auto font-mono text-sm pr-2 bg-base-100 p-4 rounded-md">
        {logs.map((log, index) => (
          <div key={index} className="flex gap-4 mb-2">
            <div className="flex-shrink-0 text-ink-400 select-none">
              {log.timestamp.toLocaleTimeString()}
            </div>
            <div className="flex-shrink-0 w-48 font-semibold text-cyan-400">
              [{log.agent}]
            </div>
            <div className="flex-grow text-ink-500 whitespace-pre-wrap">
              {log.message}
              {log.data && (
                <details className="mt-2 opacity-80">
                  <summary className="cursor-pointer text-ink-400 text-xs">View Data</summary>
                  <pre className="bg-black p-2 rounded-md mt-1 text-xs text-yellow-300 overflow-x-auto">{log.data}</pre>
                </details>
              )}
            </div>
          </div>
        ))}
        <div ref={endOfLogsRef} />
      </div>
    </div>
  );
};
