import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the worker for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  url: string;
  title?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url, title }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);

  // Check if it's a Google Drive link
  const isGoogleDrive = url.includes('drive.google.com');
  const getDriveEmbedUrl = (driveUrl: string) => {
    const driveRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = driveUrl.match(driveRegex);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return null;
  };

  const driveEmbedUrl = isGoogleDrive ? getDriveEmbedUrl(url) : null;

  if (driveEmbedUrl) {
    return (
      <div className="flex flex-col h-full bg-slate-100 rounded-2xl overflow-hidden shadow-inner font-sans border border-slate-200">
        <div className="bg-white border-b border-slate-200 p-3 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Google Drive Preview</span>
          </div>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-bold text-primary hover:underline px-3 py-1 bg-primary/5 rounded-lg"
          >
            Open in Drive
          </a>
        </div>
        <iframe 
          src={driveEmbedUrl}
          className="flex-1 w-full h-full border-none"
          allow="autoplay"
          title={title || "Google Drive Viewer"}
        />
      </div>
    );
  }

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-2xl overflow-hidden shadow-inner font-sans">
      {/* Viewer Toolbar */}
      <div className="bg-white border-b border-slate-200 p-3 flex items-center justify-between z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">
            {numPages ? `${numPages} Pages` : 'Loading...'}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setScale(s => Math.max(s - 0.1, 0.4))}
            className="p-2 hover:bg-white rounded-lg transition-all text-slate-600"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-[10px] font-black w-10 text-center text-slate-500">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(s => Math.min(s + 0.1, 2.0))}
            className="p-2 hover:bg-white rounded-lg transition-all text-slate-600"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
        </div>

        <button
          onClick={() => setRotation(r => (r + 90) % 360)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-600 mr-2"
          title="Rotate"
        >
          <RotateCw size={18} />
        </button>
      </div>

      {/* PDF Content Area - SCROLLING LAYOUT */}
      <div className="flex-1 overflow-auto p-4 flex flex-col items-center bg-slate-200 scroll-smooth">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="text-sm font-bold text-slate-500">Loading document...</p>
            </div>
          }
          error={
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-sm text-center m-auto">
              <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCw size={32} />
              </div>
              <h3 className="text-lg font-bold text-secondary mb-2">Failed to load Preview</h3>
              <p className="text-sm text-slate-500 mb-6">This could be due to network issues. You can download the file to view it offline.</p>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                Download PDF Directly
              </a>
            </div>
          }
          className="flex flex-col items-center gap-6"
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page 
              key={`page_${index + 1}`}
              pageNumber={index + 1} 
              scale={scale} 
              rotate={rotation}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="bg-white shadow-xl rounded-sm overflow-hidden border border-slate-300"
              width={Math.min(window.innerWidth * 0.9, 800)}
            />
          ))}
        </Document>
      </div>
    </div>
  );
};
