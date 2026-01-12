import { NextResponse } from 'next/server';

// Mock database - in production, replace with actual database
let artists = [
  { id: 1, name: 'Ramesh Kumar', tribe: 'Warli', location: 'Maharashtra, India', verified: true, artworks: 12 },
  { id: 2, name: 'Maya Devi', tribe: 'Madhubani', location: 'Bihar, India', verified: true, artworks: 8 },
  { id: 3, name: 'Jagdish Patel', tribe: 'Pithora', location: 'Gujarat, India', verified: false, artworks: 5 },
];

/**
 * GET /api/artists
 * Get all artists with pagination
 * Query params: page, limit, tribe, verified
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const tribe = searchParams.get('tribe');
    const verified = searchParams.get('verified');

    // Filter artists
    let filteredArtists = [...artists];
    
    if (tribe) {
      filteredArtists = filteredArtists.filter(
        artist => artist.tribe.toLowerCase() === tribe.toLowerCase()
      );
    }
    
    if (verified !== null && verified !== undefined) {
      const isVerified = verified === 'true';
      filteredArtists = filteredArtists.filter(artist => artist.verified === isVerified);
    }

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedArtists = filteredArtists.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      page,
      limit,
      total: filteredArtists.length,
      totalPages: Math.ceil(filteredArtists.length / limit),
      data: paginatedArtists,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch artists' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/artists
 * Create a new artist
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validation
    if (!data.name || !data.tribe || !data.location) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, tribe, location' },
        { status: 400 }
      );
    }

    const newArtist = {
      id: artists.length + 1,
      name: data.name,
      tribe: data.tribe,
      location: data.location,
      verified: data.verified || false,
      artworks: 0,
    };

    artists.push(newArtist);

    return NextResponse.json(
      { success: true, message: 'Artist created successfully', data: newArtist },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create artist' },
      { status: 500 }
    );
  }
}
