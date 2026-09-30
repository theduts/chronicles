import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

export interface ImagePickerProps {
  currentImageUrl?: string | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  label?: string;
  shape?: 'square' | 'circle' | 'banner';
  className?: string;
}

export default function ImagePicker({
  currentImageUrl,
  onChange,
  disabled = false,
  label,
  shape = 'square',
  className = '',
}: ImagePickerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // If external currentImageUrl changes and no local file is selected
    if (!objectUrlRef.current) {
      setPreviewUrl(currentImageUrl || null);
    }
  }, [currentImageUrl]);

  useEffect(() => {
    return () => {
      // Clean up any object URL on unmount to avoid memory leaks
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage('O tamanho do arquivo não pode exceder 5MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate image mime type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Apenas arquivos de imagem são permitidos.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const newUrl = URL.createObjectURL(file);
    objectUrlRef.current = newUrl;
    setPreviewUrl(newUrl);
    onChange(file);
  };

  const handleRemove = () => {
    const confirmed = window.confirm('Remover imagem: Tem certeza que deseja remover a imagem selecionada?');
    if (!confirmed) return;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setPreviewUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange(null);
  };

  const triggerSelect = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getShapeClasses = () => {
    switch (shape) {
      case 'circle':
        return 'w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden';
      case 'banner':
        return 'w-full h-36 sm:h-44 rounded-none overflow-hidden';
      case 'square':
      default:
        return 'w-32 h-32 sm:w-36 sm:h-36 rounded-none overflow-hidden';
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
          {label}
        </span>
      )}

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {/* Hidden native file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled}
          onChange={handleFileChange}
        />

        {/* Image Preview / Empty state container */}
        <div
          onClick={triggerSelect}
          className={`relative group cursor-pointer border border-outline-variant/30 hover:border-primary/50 transition-all flex items-center justify-center bg-surface-container-highest/30 ${getShapeClasses()}`}
        >
          {previewUrl ? (
            <ImageWithFallback
              src={previewUrl}
              alt="Prévia da imagem"
              className="w-full h-full object-cover"
              onError={() => {
                setErrorMessage('Erro ao carregar imagem. Verifique sua conexão ou tente outra.');
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-3 text-center">
              <Upload className="w-6 h-6 text-on-surface-variant/40 mb-1 group-hover:text-primary transition-colors" />
              <span className="text-xs font-bold text-on-surface-variant">Sem Imagem</span>
              <span className="text-[10px] text-on-surface-variant/70 mt-0.5 max-w-[110px] leading-tight">
                Clique para adicionar uma imagem.
              </span>
            </div>
          )}

          {/* Hover overlay on desktop */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
            {previewUrl ? 'Alterar' : 'Escolher'}
          </div>
        </div>

        {/* Action Controls & Info */}
        <div className="flex flex-col gap-2 items-center sm:items-start justify-center">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={triggerSelect}
              className="min-h-[44px] px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/40 text-on-surface text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
            >
              {previewUrl ? 'Alterar Foto' : 'Adicionar Foto'}
            </button>

            {previewUrl && (
              <button
                type="button"
                disabled={disabled}
                onClick={handleRemove}
                className="min-h-[44px] px-3 py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                title="Remover imagem selecionada"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remover</span>
              </button>
            )}
          </div>

          <span className="text-[11px] text-on-surface-variant/60">
            JPG, PNG, WEBP ou SVG (máx. 5MB)
          </span>

          {errorMessage && (
            <div className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
