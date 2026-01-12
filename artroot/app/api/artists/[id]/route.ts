import { NextResponse } from 'next/server';

// Mock database - in production, replace with actual database
let artists = [
  { id: 1, name: 'Ramesh Kumar', tribe: 'Warli', location: 'Maharashtra, India', verified: true, artworks: 12 },
  { id: 2, name: 'Maya Devi', tribe: 'Madhubani', location: 'Bihar, India', verified: true, artworks: 8 },
  { id: 3, name: 'Jagdish Patel', tribe: 'Pithora', location: 'Gujarat, India', verified: false, artworks: 5 },
];

/**
 * GET /api/artists/:id
 * Get artist by ID
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const artist = artists.find(a => a.id === id);

    if (!artist) {
      return NextResponse.json(
        { success: false, error: 'Artist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: artist });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch artist' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/artists/:id
 * Update artist by ID
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await req.json();
    const artistIndex = artists.findIndex(a => a.id === id);

    if (artistIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Artist not found' },
        { status: 404 }
      );
    }

    // Update artist
    artists[artistIndex] = {
      ...artists[artistIndex],
      ...data,
      id, // Ensure ID doesn't change
    };

    return NextResponse.json({
      success: true,
      message: 'Artist updated successfully',
      data: artists[artistIndex],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update artist' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/artists/:id
 * Delete artist by ID
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const artistIndex = artists.findIndex(a => a.id === id);

    if (artistIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Artist not found' },
        { status: 404 }
      );
    }

    const deletedArtist = artists.splice(artistIndex, 1)[0];

    return NextResponse.json({
      success: true,
      message: 'Artist deleted successfully',
      data: deletedArtist,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete artist' },
      { status: 500 }
    );
  }
}
