'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Music, Video, X } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete: (scanId: string) => void;
  userPlan: 'FREE' | 'PREMIUM';
  scansUsed: number;
}

export default function FileUpload({ onUploadComplete, userPlan, scansUsed }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const maxScans = userPlan === 'FREE' ? 5 : Infinity;
  const remainingScans = maxScans - scansUsed;

  const getAcceptedFileTypes = () => {
    if (userPlan === 'FREE') {
      return {
        'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
      };
    }
    return {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'audio/*': ['.mp3', '.wav', '.mpeg'],
      'video/*': ['.mp4', '.avi', '.mov']
    };
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptedFileTypes(),
    maxFiles: 1,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError(`File type not supported. ${userPlan} plan supports ${userPlan === 'FREE' ? 'images only' : 'images, audio, and video'}.`);
      } else {
        setError('File upload failed. Please try again.');
      }
    }
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    if (remainingScans <= 0) {
      setError('You have reached your scan limit. Please upgrade to continue.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (response.ok) {
        onUploadComplete(data.scanId);
        setSelectedFile(null);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <FileText className="h-8 w-8" />;
    if (file.type.startsWith('audio/')) return <Music className="h-8 w-8" />;
    if (file.type.startsWith('video/')) return <Video className="h-8 w-8" />;
    return <FileText className="h-8 w-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Scan Limit Info */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>Plan: {userPlan}</span>
        <span>
          {userPlan === 'FREE' ? `${remainingScans}/5 scans remaining` : 'Unlimited scans'}
        </span>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!selectedFile ? (
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">
                {isDragActive ? 'Drop your file here' : 'Upload file for OCR analysis'}
              </h3>
              <p className="text-gray-600 mb-4">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                {userPlan === 'FREE' 
                  ? 'Supports: Images (JPEG, PNG, GIF, WebP)'
                  : 'Supports: Images, Audio (MP3, WAV), Video (MP4, AVI, MOV)'
                }
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Max size: {userPlan === 'FREE' ? '10MB' : '100MB'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getFileIcon(selectedFile)}
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {uploading && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Uploading and processing...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={uploading || remainingScans <= 0}
              className="w-full"
            >
              {uploading ? 'Processing...' : 'Start OCR Analysis'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
