import { NextRequest, NextResponse } from 'next/server';
import * as artistService from '@/lib/services/artistService';
import * as userService from '@/lib/services/userService';
import { getAuthUser } from '@/lib/middleware-utils';
import { generateToken } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

// GET profile
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt(user.userId);
        const artist = await artistService.getArtistByUserId(userId);

        if (!artist) {
            return NextResponse.json({ success: false, error: 'Artist profile not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: artist });
    } catch (error: any) {
        logger.error('API', 'Failed to fetch artist profile', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to fetch artist profile' }, { status: 500 });
    }
}

// POST create profile
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt(user.userId);

        // Check if profile already exists
        const existing = await artistService.getArtistByUserId(userId);
        if (existing) {
            return NextResponse.json({ success: false, error: 'Artist profile already exists' }, { status: 409 });
        }

        const body = await req.json();
        const { tribe, location, biography, specialties, yearsActive } = body;

        if (!tribe) {
            return NextResponse.json({ success: false, error: 'Tribe is required' }, { status: 400 });
        }

        const artist = await artistService.createArtistProfile({
            userId,
            tribe,
            location,
            biography,
            specialties,
            yearsActive: yearsActive ? parseInt(yearsActive) : undefined
        });

        // If user was a viewer, upgrade to artist
        let newToken: string | undefined;
        if (user.role !== 'artist') {
            await userService.updateUser(userId, { role: 'artist' });
            // Generate new token with updated role
            newToken = generateToken(user.userId, user.email, 'artist');
        }

        return NextResponse.json({
            success: true,
            message: 'Artist profile created successfully',
            data: artist,
            token: newToken // Return new token if role changed
        }, { status: 201 });
    } catch (error: any) {
        logger.error('API', 'Failed to create artist profile', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to create artist profile' }, { status: 500 });
    }
}

// PUT update profile
export async function PUT(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user || user.role !== 'artist') {
            return NextResponse.json({ success: false, error: 'Only artists can update artist profiles' }, { status: 403 });
        }

        const userId = parseInt(user.userId);
        const artist = await artistService.getArtistByUserId(userId);

        if (!artist) {
            return NextResponse.json({ success: false, error: 'Artist profile not found. Create one first.' }, { status: 404 });
        }

        const body = await req.json();
        const { tribe, location, biography, specialties, yearsActive, profileImageUrl, profile_image_url, years_active } = body;

        const updated = await artistService.updateArtistProfile(artist.id, {
            tribe,
            location,
            biography,
            specialties,
            yearsActive: yearsActive || years_active ? parseInt(yearsActive || years_active) : undefined,
            profileImageUrl: profileImageUrl || profile_image_url
        });

        return NextResponse.json({ success: true, message: 'Artist profile updated successfully', data: updated });
    } catch (error: any) {
        logger.error('API', 'Failed to update artist profile', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to update artist profile' }, { status: 500 });
    }
}
