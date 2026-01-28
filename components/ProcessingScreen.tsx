
import React, { useEffect, useRef, useState } from 'react';
import { Rfp, LogEntry, AgentName } from '../types';

const agentPipeline: AgentName[] = ['EXTRACTOR', 'PARSING_ENGINE', 'SALES_AGENT', 'TECHNICAL_AGENT', 'PRICING_AGENT', 'FINALIZING_AGENT'];

const agentDisplayNames: Record<AgentName, string> = {
    EXTRACTOR: 'Extracting Text',
    PARSING_ENGINE: 'Parsing Document',
    SALES_AGENT: 'Checking Eligibility',
    TECHNICAL_AGENT: 'Technical Analysis',
    PRICING_AGENT: 'Calculating Price',
    FINALIZING_AGENT: 'Finalizing Report',
    MASTER_AGENT: 'Master Agent',
};


const getAgentStatus = (agentName: AgentName, rfp: Rfp): 'Pending' | 'In Progress' | 'Complete' | 'Error' => {
    const thisAgentIndex = agentPipeline.indexOf(agentName);
    
    if (rfp.status === 'Complete') {
        return 'Complete';
    }

    const currentAgent = rfp.activeAgent;
    
    if (rfp.status === 'Error') {
        if (!currentAgent) { // Error before any agent started
             return 'Pending';
        }
        const failedAgentIndex = agentPipeline.indexOf(currentAgent);
        if (thisAgentIndex < failedAgentIndex) return 'Complete';
        if (thisAgentIndex === failedAgentIndex) return 'Error';
        return 'Pending';
    }

    if (!currentAgent) {
        return 'Pending';
    }
    
    const currentAgentIndex = agentPipeline.indexOf(currentAgent);

    if (thisAgentIndex < currentAgentIndex) {
        return 'Complete';
    }
    
    if (thisAgentIndex === currentAgentIndex) {
        return 'In Progress';
    }

    return 'Pending';
};

const StatusIcon: React.FC<{ status: 'Pending' | 'In Progress' | 'Complete' | 'Error' }> = ({ status }) => {
    switch (status) {
        case 'Complete':
            return <div className="w-6 h-6 rounded-full bg-success-700 flex items-center justify-center text-white font-bold text-base">✓</div>;
        case 'In Progress':
            return (
                <div className="w-6 h-6 rounded-full bg-accent-700 flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            );
        case 'Error':
            return <div className="w-6 h-6 rounded-full bg-error-700 flex items-center justify-center text-white font-bold text-base">!</div>;
        case 'Pending':
        default:
            return <div className="w-6 h-6 rounded-full bg-base-300"></div>;
    }
};

const AgentStatusTracker: React.FC<{ rfp: Rfp }> = ({ rfp }) => {
    return (
        <div className="bg-base-200 p-6 rounded-lg shadow-sm border border-base-300 h-full">
            <h3 className="text-lg font-bold mb-4">Agent Pipeline</h3>
            <div className="space-y-4">
                {agentPipeline.map((agent, index) => {
                    const status = getAgentStatus(agent, rfp);
                    const isLast = index === agentPipeline.length - 1;
                    return (
                        <div key={agent} className="flex items-start">
                            <div className="flex flex-col items-center mr-4">
                                <StatusIcon status={status} />
                                {!isLast && <div className="w-px h-8 bg-base-300 mt-1" />}
                            </div>
                            <div>
                                <p className={`font-semibold ${status === 'In Progress' ? 'text-accent-700' : 'text-ink-700'}`}>{agentDisplayNames[agent] || agent.replace(/_/g, ' ')}</p>
                                <p className="text-sm text-ink-500">{status}...</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const LogViewer: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
    const endOfLogsRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
         <div className="bg-base-100 text-white rounded-lg p-4 shadow-inner h-full flex flex-col font-mono">
            <h3 className="text-md font-semibold mb-2 text-ink-700">Live Execution Log</h3>
            <div className="flex-grow overflow-y-auto text-xs pr-2">
                {logs.map((log, index) => (
                    <div key={index} className="flex gap-3 mb-1">
                        <div className="flex-shrink-0 text-ink-400">{log.timestamp.toLocaleTimeString()}</div>
                        <div className="flex-shrink-0 w-32 font-semibold text-cyan-400">[{log.agent}]</div>
                        <div className="flex-grow text-ink-500 whitespace-pre-wrap">{log.message}</div>
                    </div>
                ))}
                <div ref={endOfLogsRef} />
            </div>
        </div>
    );
}

const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

interface ProcessingScreenProps {
    rfp: Rfp;
    logs: LogEntry[];
    onViewResults: () => void;
    onBack: () => void;
    processingStartTime: Date | null;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ rfp, logs, onViewResults, onBack, processingStartTime }) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        if (rfp.status === 'Complete' || rfp.status === 'Error' || !processingStartTime) {
            if (rfp.processingDuration) {
                setElapsedSeconds(rfp.processingDuration);
            }
            return;
        };

        const timer = setInterval(() => {
            const now = new Date();
            const start = processingStartTime;
            setElapsedSeconds(Math.round((now.getTime() - start.getTime()) / 1000));
        }, 1000);

        return () => clearInterval(timer);
    }, [rfp.status, processingStartTime, rfp.processingDuration]);


    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold">Processing RFP: <span className="font-normal text-ink-500">{rfp.id}</span></h2>
                 <div className="text-right">
                     <p className="text-sm text-ink-500 font-semibold uppercase tracking-wider">Time Elapsed</p>
                     <p className="text-2xl font-bold text-ink-700">{formatDuration(elapsedSeconds)}</p>
                 </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
                <div className="lg:col-span-1">
                    <AgentStatusTracker rfp={rfp} />
                </div>
                <div className="lg:col-span-2 h-full">
                    <LogViewer logs={logs} />
                </div>
            </div>

            <div className="pt-4 flex justify-center items-center">
                {rfp.status === 'Complete' && (
                    <button onClick={onViewResults} className="px-6 py-2 bg-success-700 text-white font-bold rounded-lg shadow-sm hover:bg-opacity-90 transition">
                        View Analysis Results
                    </button>
                )}
                 {rfp.status === 'Error' && (
                    <div className="text-center">
                        <p className="text-error-700 font-semibold">An error occurred during processing.</p>
                        <button onClick={onBack} className="mt-2 px-4 py-2 bg-error-700 text-white font-semibold rounded-lg hover:bg-opacity-80">
                            Back to RFP List
                        </button>
                    </div>
                )}
                {(rfp.status === 'Processing' || rfp.status === 'Parsing' || rfp.status === 'Extracting') && (
                     <p className="text-ink-500 font-semibold">Please wait while the agents complete their tasks...</p>
                )}
            </div>
        </div>
    );
};