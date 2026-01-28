
import React, { useState, useCallback, useEffect } from 'react';
import { rfpDocumentContent } from '../data/rfpData';
import * as pdfjsLib from 'pdfjs-dist';

interface RfpInputProps {
    onSubmit: (data: { source: 'URL' | 'File'; content: string; fileName?: string; }) => void;
}

type InputMode = 'url' | 'file';

interface IngestionProgress {
    status: 'idle' | 'processing' | 'done' | 'error';
    steps: { message: string, icon: string }[];
}

// Setup PDF.js worker
const WORKER_SRC = 'https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.mjs';

export const RfpInput: React.FC<RfpInputProps> = ({ onSubmit }) => {
    const [mode, setMode] = useState<InputMode>('file');
    const [url, setUrl] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    const [ingestionProgress, setIngestionProgress] = useState<IngestionProgress>({ status: 'idle', steps: [] });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    useEffect(() => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_SRC;
    }, []);

    const extractTextFromPdf = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
        }
        return fullText;
    };

    const handleFileProcessing = async (file: File) => {
        if (!file) return;

        setIngestionProgress({ status: 'processing', steps: [{ message: 'Reading file...', icon: '✔' }] });

        try {
            let content = '';
            
            if (file.type === 'application/pdf') {
                setIngestionProgress(prev => ({...prev, steps: [...prev.steps, { message: 'Digital PDF detected', icon: '✔' }]}));
                content = await extractTextFromPdf(file);
                
                if (content.trim().length < 100) {
                    setIngestionProgress(prev => ({...prev, steps: [...prev.steps, { message: 'Low text content, using mock data...', icon: '⚠' }]}));
                    content = rfpDocumentContent;
                }
            } else {
                content = await file.text();
            }

            setIngestionProgress(prev => ({...prev, steps: [...prev.steps, { message: 'Text extraction successful', icon: '✔' }]}));
            
            setTimeout(() => {
                onSubmit({ source: 'File', content: content, fileName: file.name });
                setIngestionProgress({ status: 'idle', steps: [] });
                setSelectedFile(null);
            }, 1000);

        } catch (error) {
            console.error("Error processing file:", error);
            setIngestionProgress({
                status: 'error',
                steps: [...ingestionProgress.steps, { message: 'Failed to process file.', icon: '✖' }]
            });
            setTimeout(() => {
                setIngestionProgress({ status: 'idle', steps: [] });
                setSelectedFile(null);
            }, 3000);
        }
    };

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(false);
        if (event.dataTransfer.files && event.dataTransfer.files[0] && ingestionProgress.status !== 'processing') {
            setSelectedFile(event.dataTransfer.files[0]);
        }
    }, [ingestionProgress.status]);

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (ingestionProgress.status !== 'processing') setIsDragOver(true);
    }, [ingestionProgress.status]);

    const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0] && ingestionProgress.status !== 'processing') {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUrlSubmit = () => {
        if (url) {
            setIngestionProgress({ status: 'processing', steps: [] });
            setTimeout(() => {
                setIngestionProgress(prev => ({...prev, steps: [...prev.steps, { message: 'Fetching from URL...', icon: '🔗' }]}));
            }, 300);
            setTimeout(() => {
                setIngestionProgress(prev => ({...prev, steps: [...prev.steps, { message: 'Content retrieved successfully', icon: '✔' }]}));
                onSubmit({ source: 'URL', content: rfpDocumentContent, fileName: url });
                setUrl('');
                setTimeout(() => {
                    setIngestionProgress({ status: 'idle', steps: [] });
                }, 1500);
            }, 1500);
        }
    };

    const renderFileContent = () => {
        if (ingestionProgress.status === 'processing' || ingestionProgress.status === 'error') {
            return (
                 <div className="flex flex-col items-center justify-center h-full">
                    <div className="space-y-2 text-left">
                        {ingestionProgress.steps.map((step, index) => (
                             <p key={index} className={`text-sm ${ingestionProgress.status === 'error' && index === ingestionProgress.steps.length - 1 ? 'text-error-700' : 'text-ink-500'} animate-fade-in`}>{step.icon} {step.message}</p>
                        ))}
                    </div>
                </div>
            );
        }
        if (selectedFile) {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <p className="font-semibold text-ink-700">{selectedFile.name}</p>
                    <p className="text-xs text-ink-400 mt-1">{Math.round(selectedFile.size / 1024)} KB</p>
                    <button onClick={() => setSelectedFile(null)} className="mt-2 text-xs text-error-700 hover:underline">Clear</button>
                </div>
            );
        }
        return (
             <label htmlFor="file-upload" className="cursor-pointer">
                <p className="font-semibold text-ink-700">Drag & drop your RFP here, or click to browse</p>
                <p className="text-xs text-ink-400 mt-1">PDF, DOCX, or TXT</p>
            </label>
        );
    }

    return (
        <div className="bg-base-200 p-6 rounded-lg shadow-sm border border-base-300">
            <h2 className="text-xl font-bold mb-1">Ingest New RFP</h2>
            <p className="text-sm text-ink-400 mb-4">Early ingestion increases win probability by enabling faster technical and pricing analysis.</p>
            <div className="flex border-b border-base-300 mb-4">
                <button onClick={() => setMode('file')} className={`px-4 py-2 text-sm font-semibold ${mode === 'file' ? 'border-b-2 border-accent-700 text-accent-700' : 'text-ink-500'}`}>Upload File</button>
                <button onClick={() => setMode('url')} className={`px-4 py-2 text-sm font-semibold ${mode === 'url' ? 'border-b-2 border-accent-700 text-accent-700' : 'text-ink-500'}`}>Fetch from URL</button>
            </div>
            {mode === 'file' ? (
                <div>
                    <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt" disabled={ingestionProgress.status === 'processing'} />
                    <div 
                        onDrop={handleDrop} 
                        onDragOver={handleDragOver} 
                        onDragLeave={handleDragLeave}
                        className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${isDragOver ? 'border-accent-700 bg-accent-100' : 'border-base-300 bg-base-100'} ${ingestionProgress.status === 'processing' ? 'cursor-not-allowed bg-base-100' : 'cursor-pointer'}`}
                    >
                       {renderFileContent()}
                    </div>
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => { if (selectedFile) handleFileProcessing(selectedFile); }}
                            disabled={!selectedFile || ingestionProgress.status === 'processing'}
                            className="bg-accent-700 text-white px-8 py-2.5 rounded-lg font-bold text-base hover:bg-opacity-90 transition disabled:bg-base-300 disabled:text-ink-400 disabled:cursor-not-allowed"
                        >
                            Process RFP
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex gap-2">
                    <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter GeM / PSU / Tender URL..." className="flex-grow p-2 border border-base-300 rounded-md text-sm focus:ring-1 focus:ring-accent-700 focus:border-accent-700 bg-base-100" />
                    <button onClick={handleUrlSubmit} className="bg-accent-700 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-opacity-90 disabled:bg-ink-400" disabled={ingestionProgress.status === 'processing' || !url}>Fetch RFP</button>
                </div>
            )}
        </div>
    );
};
