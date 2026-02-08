import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { logger } from '@/lib/logger';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                folder: 'artroot',
                resource_type: 'auto'
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }).end(buffer);
        }) as any;

        const fileUrl = uploadResult.secure_url;

        logger.info('API', 'File uploaded to Cloudinary', { url: fileUrl });

        return NextResponse.json({ success: true, url: fileUrl });
    } catch (error: any) {
        logger.error('API', 'Upload to Cloudinary failed', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
    }
}
