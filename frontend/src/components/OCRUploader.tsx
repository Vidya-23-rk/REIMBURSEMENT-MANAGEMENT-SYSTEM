import { useState, useRef } from 'react';
import { Upload, Camera, FileText, X, Loader2 } from 'lucide-react';
import { expensesApi } from '../api/expenses.api';
import type { OCRResult } from '../types';
import toast from 'react-hot-toast';

interface Props {
  onScanResult: (result: OCRResult) => void;
}

export default function OCRUploader({ onScanResult }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setFile(selected);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  };

  const handleScan = async () => {
    if (!file) return;
    setIsScanning(true);
    try {
      const result = await expensesApi.scanReceipt(file);
      onScanResult(result);
      toast.success('Receipt scanned successfully!');
    } catch {
      toast.error('Failed to scan receipt. Please enter details manually.');
    } finally {
      setIsScanning(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Upload area */}
      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-surface-200 rounded-2xl p-8
                     flex flex-col items-center justify-center gap-3
                     cursor-pointer hover:border-primary-400 hover:bg-primary-50/30
                     transition-all duration-200 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center
                          group-hover:bg-primary-100 transition-colors">
            <Upload className="w-6 h-6 text-primary-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-surface-700">
              Upload receipt or take a photo
            </p>
            <p className="text-xs text-surface-400 mt-1">
              PNG, JPG, JPEG up to 10MB
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-100 text-surface-500 text-xs font-medium">
              <Camera className="w-3.5 h-3.5" /> Camera
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-100 text-surface-500 text-xs font-medium">
              <FileText className="w-3.5 h-3.5" /> Browse Files
            </span>
          </div>
        </div>
      ) : (
        /* Preview */
        <div className="relative rounded-2xl overflow-hidden border border-surface-200">
          <img
            src={preview}
            alt="Receipt preview"
            className="w-full max-h-48 object-cover"
          />
          <button
            onClick={clearFile}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-surface-900/60 text-white
                       hover:bg-surface-900/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="p-4 bg-white border-t border-surface-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-surface-400" />
                <span className="text-sm text-surface-600 truncate max-w-[200px]">
                  {file?.name}
                </span>
              </div>
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="btn-primary text-sm px-4 py-2"
              >
                {isScanning ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scanning...
                  </span>
                ) : (
                  'Scan with OCR'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        id="receipt-upload"
      />
    </div>
  );
}
