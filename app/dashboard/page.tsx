'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FileUpload from '@/components/ocr/FileUpload';
import ScanResults from '@/components/ocr/ScanResults';
import ScanHistory from '@/components/dashboard/ScanHistory';
import { 
  Shield, 
  User, 
  LogOut, 
  Upload, 
  History, 
  Crown,
  AlertTriangle
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  plan: 'FREE' | 'PREMIUM';
  scansUsed: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if user is authenticated by trying to fetch history
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        // Extract user info from the first scan or make a separate user endpoint
        // For now, we'll simulate user data
        setUser({
          id: '1',
          email: 'user@example.com',
          name: 'Demo User',
          plan: 'FREE',
          scansUsed: data.scans?.length || 0
        });
      } else {
        router.push('/');
      }
    } catch (error) {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear cookies and redirect
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUploadComplete = (scanId: string) => {
    setCurrentScanId(scanId);
    setActiveTab('results');
    // Refresh user data to update scan count
    checkAuth();
  };

  const handleViewScan = (scanId: string) => {
    setCurrentScanId(scanId);
    setActiveTab('results');
  };

  const handleRescan = () => {
    setCurrentScanId(null);
    setActiveTab('upload');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 animate-pulse mx-auto mb-4 text-blue-600" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const remainingScans = user.plan === 'FREE' ? Math.max(0, 5 - user.scansUsed) : Infinity;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">OCR Validator</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">{user.email}</span>
                <Badge variant={user.plan === 'FREE' ? 'secondary' : 'default'}>
                  {user.plan === 'FREE' ? (
                    <>Free Plan</>
                  ) : (
                    <>
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </>
                  )}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Plan Status */}
        {user.plan === 'FREE' && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  Free Plan: {remainingScans} of 5 scans remaining. 
                  {remainingScans === 0 && ' Upgrade to continue scanning.'}
                </span>
                {remainingScans <= 2 && (
                  <Button size="sm" className="ml-4">
                    Upgrade to Premium
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Upload & Scan</span>
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!currentScanId}>
              <span>Results</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload File for OCR Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onUploadComplete={handleUploadComplete}
                  userPlan={user.plan}
                  scansUsed={user.scansUsed}
                />
              </CardContent>
            </Card>

            {/* Feature Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="font-semibold mb-2">Policy Detection</h3>
                  <p className="text-sm text-gray-600">
                    AI-powered analysis using Meta policies to detect content violations
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
                  <h3 className="font-semibold mb-2">Risk Assessment</h3>
                  <p className="text-sm text-gray-600">
                    Detailed risk scores and confidence ratings for each violation
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <History className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <h3 className="font-semibold mb-2">Detailed Reports</h3>
                  <p className="text-sm text-gray-600">
                    Generate PDF reports with recommendations for content improvement
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="results">
            {currentScanId ? (
              <ScanResults scanId={currentScanId} onRescan={handleRescan} />
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No scan selected. Upload a file or select from history to view results.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            <ScanHistory onViewScan={handleViewScan} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
