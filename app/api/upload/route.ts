import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/db';
import { getUserFromToken } from '@/utils/auth';
import { validateFileType, validateFileSize, extractTextFromFile, analyzeContentForPolicyViolations } from '@/utils/ocr';

export async function POST(request: NextRequest) {
  try {
    // Get user from token
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check scan limits
    if (user.plan === 'FREE' && user.scansUsed >= 5) {
      return NextResponse.json(
        { error: 'Free tier limit reached. Please upgrade to continue.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!validateFileType(file.type, user.plan)) {
      const allowedTypes = user.plan === 'FREE' ? 'images only' : 'images, audio, and video';
      return NextResponse.json(
        { error: `File type not allowed. ${user.plan} plan supports ${allowedTypes}.` },
        { status: 400 }
      );
    }

    // Validate file size
    if (!validateFileSize(file.size, file.type)) {
      return NextResponse.json(
        { error: 'File size exceeds limit' },
        { status: 400 }
      );
    }

    // Create uploads directory
    const uploadsDir = join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // Create scan record
    const scan = await prisma.scan.create({
      data: {
        userId: user.id,
        fileName: file.name,
        fileType: file.type.startsWith('image') ? 'IMAGE' : 
                 file.type.startsWith('audio') ? 'AUDIO' : 'VIDEO',
        fileSize: file.size,
        filePath: fileName,
        status: 'PROCESSING',
      },
    });

    // Update user scan count
    await prisma.user.update({
      where: { id: user.id },
      data: { scansUsed: { increment: 1 } },
    });

    // Process file in background (simulate async processing)
    processFileAsync(scan.id, filePath, file.type);

    return NextResponse.json({ scanId: scan.id, status: 'processing' });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processFileAsync(scanId: string, filePath: string, fileType: string) {
  try {
    // Extract text using OCR
    const ocrResult = await extractTextFromFile(filePath, fileType);
    
    // Analyze for policy violations
    const policyResult = await analyzeContentForPolicyViolations(ocrResult.extractedText);

    // Update scan with results
    await prisma.scan.update({
      where: { id: scanId },
      data: {
        extractedText: ocrResult.extractedText,
        overallRiskScore: policyResult.overallRiskScore,
        riskLevel: policyResult.riskLevel,
        violationCount: policyResult.violations.length,
        status: 'COMPLETED',
      },
    });

    // Create violation records
    for (const violation of policyResult.violations) {
      await prisma.violation.create({
        data: {
          scanId,
          textSnippet: violation.textSnippet,
          violationType: violation.violationType,
          description: violation.description,
          severity: violation.severity,
          recommendation: violation.recommendation,
          confidence: violation.confidence,
        },
      });
    }
  } catch (error) {
    console.error('Processing error:', error);
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: 'FAILED' },
    });
  }
}
