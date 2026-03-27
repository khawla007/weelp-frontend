'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';

export function AvatarUpload({ currentAvatar, onUploadSuccess, className = '' }) {
  const [preview, setPreview] = useState(currentAvatar || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPG, PNG, or WebP.');
      return false;
    }

    if (file.size > maxSize) {
      setError('File too large. Maximum size is 2MB.');
      return false;
    }

    return true;
  };

  const handleFileSelect = (file) => {
    setError(null);

    if (!file || !validateFile(file)) return;

    // Show local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    uploadFile(file);
  };

  const uploadFile = async (file) => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`http://localhost:8000/api/customer/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setPreview(data.url);
        onUploadSuccess?.(data.url);
      } else {
        setError(data.error || 'Upload failed');
        setPreview(currentAvatar); // Revert on error
      }
    } catch (err) {
      setError('Failed to upload. Please try again.');
      setPreview(currentAvatar); // Revert on error
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-start gap-6">
        {/* Preview */}
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted flex-shrink-0">
          {preview ? (
            <Image src={preview} alt="Avatar preview" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-2xl">?</span>
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div className="flex-1 space-y-2">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
          >
            <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or WebP (max 2MB)</p>
          </div>

          <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => handleFileSelect(e.target.files[0])} className="hidden" />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <p className="text-xs text-muted-foreground">Image will be resized to 400x400 and optimized to under 50KB.</p>
        </div>
      </div>
    </div>
  );
}
