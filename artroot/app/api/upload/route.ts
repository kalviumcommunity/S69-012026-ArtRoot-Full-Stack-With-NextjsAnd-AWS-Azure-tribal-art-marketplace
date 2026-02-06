import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const ext = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${ext}`;
        const path = join(process.cwd(), 'public', 'uploads', fileName);

        await writeFile(path, buffer);

        const fileUrl = `/uploads/${fileName}`;

        logger.info('API', 'File uploaded successfully', { url: fileUrl });

        return NextResponse.json({ success: true, url: fileUrl });
    } catch (error: any) {
        logger.error('API', 'Upload failed', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
    }
}
