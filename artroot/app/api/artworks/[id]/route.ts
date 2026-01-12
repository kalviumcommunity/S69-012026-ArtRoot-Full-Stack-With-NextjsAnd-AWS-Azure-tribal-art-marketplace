import { NextResponse } from 'next/server';

// Mock database - in production, replace with actual database
let artworks = [
  { 
    id: 1, 
    title: 'Village Harvest', 
    artistId: 1, 
    artistName: 'Ramesh Kumar',
    price: 5000, 
    tribe: 'Warli', 
    medium: 'Acrylic on Canvas',
    size: '24x36 inches',
    description: 'Traditional Warli painting depicting the harvest season',
    verified: true,
    available: true
  },
  { 
    id: 2, 
    title: 'Sacred Tree', 
    artistId: 1, 
    artistName: 'Ramesh Kumar',
    price: 7500, 
    tribe: 'Warli', 
    medium: 'Natural pigments on cloth',
    size: '30x40 inches',
    description: 'A sacred tree representing the connection between earth and sky',
    verified: true,
    available: true
  },
  { 
    id: 3, 
    title: 'Wedding Ceremony', 
    artistId: 2, 
    artistName: 'Maya Devi',
    price: 6500, 
    tribe: 'Madhubani', 
    medium: 'Natural dyes on paper',
    size: '18x24 inches',
    description: 'Vibrant Madhubani art showing traditional wedding rituals',
    verified: true,
    available: false
  },
];

/**
 * GET /api/artworks/:id
 * Get artwork by ID
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const artwork = artworks.find(a => a.id === id);

    if (!artwork) {
      return NextResponse.json(
        { success: false, error: 'Artwork not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: artwork });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch artwork' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/artworks/:id
 * Update artwork by ID
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await req.json();
    const artworkIndex = artworks.findIndex(a => a.id === id);

    if (artworkIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Artwork not found' },
        { status: 404 }
      );
    }

    // Validate price if provided
    if (data.price !== undefined && data.price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Price must be greater than 0' },
        { status: 400 }
      );
    }

    // Update artwork
    artworks[artworkIndex] = {
      ...artworks[artworkIndex],
      ...data,
      id, // Ensure ID doesn't change
    };

    return NextResponse.json({
      success: true,
      message: 'Artwork updated successfully',
      data: artworks[artworkIndex],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update artwork' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/artworks/:id
 * Delete artwork by ID
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const artworkIndex = artworks.findIndex(a => a.id === id);

    if (artworkIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Artwork not found' },
        { status: 404 }
      );
    }

    const deletedArtwork = artworks.splice(artworkIndex, 1)[0];

    return NextResponse.json({
      success: true,
      message: 'Artwork deleted successfully',
      data: deletedArtwork,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete artwork' },
      { status: 500 }
    );
  }
}
