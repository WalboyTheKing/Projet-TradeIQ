import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X, AlertCircle, FileCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface ChartUploadProps {
  image: string | null;
  onImageSelected: (base64Image: string, file: File) => void;
  onRemoveImage: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onLoadSampleChart: () => void;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export const ChartUpload: React.FC<ChartUploadProps> = ({
  image,
  onImageSelected,
  onRemoveImage,
  onAnalyze,
  isAnalyzing,
  onLoadSampleChart,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);

    // 1. MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setErrorMessage('Unsupported format. Please upload a PNG, JPG, JPEG, or WEBP image.');
      return;
    }

    // 2. File size limit
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File size is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed is 5MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (result) {
        setFileDetails({
          name: file.name,
          size: `${(file.size / 1024).toFixed(0)} KB`,
        });
        onImageSelected(result, file);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file. Please try another screenshot.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setFileDetails(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onRemoveImage();
  };

  return (
    <div className="bg-[#0D131F] border border-slate-800/90 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            Chart Screenshot
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Supported: PNG, JPG, JPEG, WEBP (Max 5MB). Candlestick charts with visible price action.
          </p>
        </div>

        {!image && (
          <button
            type="button"
            onClick={onLoadSampleChart}
            className="text-xs text-slate-300 hover:text-emerald-400 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Load Sample EUR/USD
          </button>
        )}
      </div>

      {/* Upload Dropzone */}
      {!image ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-emerald-400 bg-emerald-500/5 scale-[1.005]'
              : 'border-slate-700/80 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-3.5 text-slate-300">
            <Upload className="w-6 h-6 text-emerald-400" />
          </div>

          <p className="text-sm font-medium text-slate-200 mb-1">
            Drag and drop your trading chart here, or <span className="text-emerald-400 font-semibold underline underline-offset-2">browse files</span>
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload from TradingView, MT4/MT5, cTrader, or your exchange platform.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              className="px-4 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors"
            >
              Select Image
            </button>
          </div>
        </div>
      ) : (
        /* Image Preview State */
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 max-h-[380px] flex items-center justify-center group">
            <img
              src={image}
              alt="Trading chart preview"
              className="w-full h-full max-h-[360px] object-contain"
              referrerPolicy="no-referrer"
            />

            {/* Quick Remove Overlay */}
            <div className="absolute top-2 right-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleRemove}
                disabled={isAnalyzing}
                className="p-1.5 bg-slate-900/90 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-slate-700/80 hover:border-red-500/40 rounded-lg backdrop-blur-sm transition-colors disabled:opacity-50"
                title="Remove Image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* File info pill */}
            {fileDetails && (
              <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm border border-slate-700/80 px-2.5 py-1 rounded-md text-[11px] text-slate-300 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono">{fileDetails.name}</span>
                <span className="text-slate-500">({fileDetails.size})</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handleRemove}
              disabled={isAnalyzing}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Remove & Select Another
            </button>

            <button
              type="button"
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-lg shadow-md transition-all ${
                isAnalyzing
                  ? 'bg-emerald-500/40 text-emerald-100 cursor-not-allowed'
                  : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-[0_0_20px_rgba(52,211,153,0.25)] hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing Chart...' : 'Analyze Chart'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div className="mt-3.5 flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
