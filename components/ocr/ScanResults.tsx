'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Download, 
  RefreshCw,
  Eye
} from 'lucide-react';
import jsPDF from 'jspdf';

interface Violation {
  id: string;
  textSnippet: string;
  violationType: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendation: string;
  confidence: number;
}

interface Scan {
  id: string;
  fileName: string;
  fileType: string;
  extractedText: string | null;
  overallRiskScore: number | null;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  violationCount: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  violations: Violation[];
}

interface ScanResultsProps {
  scanId: string;
  onRescan: () => void;
}

export default function ScanResults({ scanId, onRescan }: ScanResultsProps) {
  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScanResults();
    
    // Poll for updates if still processing
    const interval = setInterval(() => {
      if (scan?.status === 'PROCESSING') {
        fetchScanResults();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [scanId, scan?.status]);

  const fetchScanResults = async () => {
    try {
      const response = await fetch(`/api/scan/${scanId}`);
      const data = await response.json();

      if (response.ok) {
        setScan(data.scan);
      } else {
        setError(data.error || 'Failed to fetch scan results');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getViolationTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const generatePDFReport = () => {
    if (!scan) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    let yPosition = 20;

    // Title
    pdf.setFontSize(20);
    pdf.text('OCR Validation Report', 20, yPosition);
    yPosition += 20;

    // File Info
    pdf.setFontSize(12);
    pdf.text(`File: ${scan.fileName}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Scan Date: ${new Date(scan.createdAt).toLocaleDateString()}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Risk Level: ${scan.riskLevel || 'N/A'}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Risk Score: ${scan.overallRiskScore || 'N/A'}/10`, 20, yPosition);
    yPosition += 20;

    // Violations Summary
    pdf.setFontSize(16);
    pdf.text('Violation Summary', 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.text(`Total Violations: ${scan.violationCount}`, 20, yPosition);
    yPosition += 15;

    // Individual Violations
    if (scan.violations.length > 0) {
      pdf.setFontSize(14);
      pdf.text('Detailed Violations', 20, yPosition);
      yPosition += 15;

      scan.violations.forEach((violation, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(12);
        pdf.text(`${index + 1}. ${getViolationTypeLabel(violation.violationType)}`, 20, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(10);
        pdf.text(`Severity: ${violation.severity}`, 25, yPosition);
        yPosition += 6;
        pdf.text(`Confidence: ${Math.round(violation.confidence * 100)}%`, 25, yPosition);
        yPosition += 6;
        
        const descriptionLines = pdf.splitTextToSize(violation.description, pageWidth - 50);
        pdf.text(descriptionLines, 25, yPosition);
        yPosition += descriptionLines.length * 6 + 5;
        
        const recommendationLines = pdf.splitTextToSize(`Recommendation: ${violation.recommendation}`, pageWidth - 50);
        pdf.text(recommendationLines, 25, yPosition);
        yPosition += recommendationLines.length * 6 + 10;
      });
    }

    pdf.save(`ocr-report-${scan.fileName}-${Date.now()}.pdf`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading scan results...</span>
          </div>
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

  if (!scan) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Scan not found</AlertDescription>
      </Alert>
    );
  }

  if (scan.status === 'PROCESSING') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto text-blue-500" />
            <h3 className="text-lg font-medium">Processing your file...</h3>
            <p className="text-gray-600">
              We're extracting text and analyzing for policy violations. This may take a few moments.
            </p>
            <Progress value={75} className="w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (scan.status === 'FAILED') {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Processing failed. Please try uploading your file again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* File Info Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6" />
              <div>
                <CardTitle className="text-lg">{scan.fileName}</CardTitle>
                <p className="text-sm text-gray-600">
                  Scanned on {new Date(scan.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={onRescan}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Rescan
              </Button>
              <Button variant="outline" size="sm" onClick={generatePDFReport}>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Risk Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {scan.riskLevel === 'LOW' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
            <span>Violation Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{scan.overallRiskScore}/10</div>
              <div className="text-sm text-gray-600">Risk Score</div>
            </div>
            <div className="text-center">
              <Badge className={getRiskColor(scan.riskLevel)}>
                {scan.riskLevel} Risk
              </Badge>
              <div className="text-sm text-gray-600 mt-1">Risk Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{scan.violationCount}</div>
              <div className="text-sm text-gray-600">Violations Found</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extracted Text */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Extracted Text</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48 w-full rounded border p-4">
            <p className="text-sm whitespace-pre-wrap">
              {scan.extractedText || 'No text extracted'}
            </p>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detailed Violations */}
      {scan.violations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Violation Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {scan.violations.map((violation, index) => (
              <div key={violation.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {getViolationTypeLabel(violation.violationType)}
                    </Badge>
                    <Badge className={getSeverityColor(violation.severity)}>
                      {violation.severity}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-600">
                    {Math.round(violation.confidence * 100)}% confidence
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Flagged Content:</h4>
                    <p className="text-sm bg-gray-50 p-2 rounded italic">
                      "{violation.textSnippet}"
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-1">Issue:</h4>
                    <p className="text-sm text-gray-700">{violation.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-1">Recommendation:</h4>
                    <p className="text-sm text-blue-700">{violation.recommendation}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
