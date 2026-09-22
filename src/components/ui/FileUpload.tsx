import { useEffect, useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useUploadCourierFile } from '@/hooks/useCouriers';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

const API_BASE = 'http://localhost:3000';

export function FileUpload({ label, value, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const upload = useUploadCourierFile();

  // ✅ CRITICAL FIX: Sync preview whenever `value` prop changes
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await upload.mutateAsync(file);
      setPreview(result.url);
      onChange(result.url);
    } catch {
      // error toast in hook
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleClear = () => {
    setPreview(null);
    onChange(null);
  };

  const src = preview
    ? preview.startsWith('http')
      ? preview
      : `${API_BASE}${preview}`
    : null;

  return (
    <div>
      <label className="label">{label}</label>

      {src ? (
        <div className="relative inline-block">
          <img
            src={src}
            alt={label}
            className="h-24 w-24 object-cover rounded-md border border-gray-200"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || upload.isPending}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-md border-2 border-dashed border-gray-300 text-sm text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors',
            (disabled || upload.isPending) && 'opacity-50 cursor-not-allowed',
          )}
        >
          {upload.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Choose file
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleSelect}
        className="hidden"
      />
      <p className="mt-1 text-xs text-gray-400">
        JPEG, PNG, or WebP · max 5 MB
      </p>
    </div>
  );
}
