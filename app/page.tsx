'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { 
  FileText, 
  Shield, 
  Zap, 
  CheckCircle, 
  Star,
  Upload,
  BarChart3
} from 'lucide-react';

export default function HomePage() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">OCR Validator</h1>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={authMode === 'login' ? 'default' : 'outline'}
                onClick={() => setAuthMode('login')}
              >
                Sign In
              </Button>
              <Button
                variant={authMode === 'register' ? 'default' : 'outline'}
                onClick={() => setAuthMode('register')}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                AI-Powered Content Analysis
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Validate Your Content with
                <span className="text-blue-600"> Smart OCR</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Upload images, audio, or video files and get instant AI-powered policy violation 
                detection with detailed recommendations to improve your content.
              </p>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <FileText className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">OCR Text Extraction</h3>
                  <p className="text-sm text-gray-600">Extract text from images, audio, and video files</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Policy Detection</h3>
                  <p className="text-sm text-gray-600">AI-powered violation detection using Meta policies</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <BarChart3 className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Risk Analysis</h3>
                  <p className="text-sm text-gray-600">Detailed risk scores and confidence ratings</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Zap className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Instant Reports</h3>
                  <p className="text-sm text-gray-600">Generate PDF reports with recommendations</p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="font-semibold text-gray-900 mb-4">Pricing Plans</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Free Plan</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    <li>• 5 free scans</li>
                    <li>• Image uploads only</li>
                    <li>• Basic policy detection</li>
                    <li>• PDF reports</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">Premium Plan</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    <li>• Unlimited scans</li>
                    <li>• Audio & video support</li>
                    <li>• Advanced AI analysis</li>
                    <li>• Priority processing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth forms */}
          <div className="lg:pl-8">
            <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'login' | 'register')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
