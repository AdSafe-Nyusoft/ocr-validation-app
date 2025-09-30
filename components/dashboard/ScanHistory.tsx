'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Music, 
  Video, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react';

interface Scan {
  id: string;
  fileName: string;
  fileType: 'IMAGE' | 'AUDIO' | 'VIDEO';
  overallRiskScore: number | null;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  violationCount: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

interface ScanHistoryProps {
  onViewScan: (scanId: string) => void;
}

export default function ScanHistory({ onViewScan }: ScanHistoryProps) {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScanHistory();
  }, []);

  const fetchScanHistory = async () => {
    try {
      const response = await fetch('/api/history');
      const data = await response.json();

      if (response.ok) {
        setScans(data.scans);
      } else {
        setError(data.error || 'Failed to fetch scan history');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'IMAGE': return <FileText className="h-5 w-5" />;
      case 'AUDIO': return <Music className="h-5 w-5" />;
      case 'VIDEO': return <Video className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getRiskColor = (riskLevel: string | null) => {
    switch (riskLevel) {
      case 'LOW': return 'text-green-600 bg-green-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'HIGH': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string, riskLevel: string | null) => {
    if (status === 'PROCESSING') {
      return <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />;
    }
    if (status === 'FAILED') {
      return <div className="h-2 w-2 bg-red-500 rounded-full" />;
    }
    if (riskLevel === 'LOW') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading scan history...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (scans.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No scans yet. Upload your first file to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Scan History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {scans.map((scan) => (
            <div
              key={scan.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(scan.fileType)}
                <div>
                  <div className="font-medium text-sm">{scan.fileName}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(scan.createdAt).toLocaleDateString()} at{' '}
                    {new Date(scan.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(scan.status, scan.riskLevel)}
                  {scan.status === 'COMPLETED' && scan.riskLevel && (
                    <Badge className={getRiskColor(scan.riskLevel)} variant="secondary">
                      {scan.riskLevel}
                    </Badge>
                  )}
                  {scan.status === 'PROCESSING' && (
                    <Badge variant="secondary">Processing</Badge>
                  )}
                  {scan.status === 'FAILED' && (
                    <Badge variant="destructive">Failed</Badge>
                  )}
                </div>

                {scan.status === 'COMPLETED' && (
                  <div className="text-sm text-gray-600">
                    {scan.violationCount} violations
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewScan(scan.id)}
                  disabled={scan.status === 'PROCESSING'}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
