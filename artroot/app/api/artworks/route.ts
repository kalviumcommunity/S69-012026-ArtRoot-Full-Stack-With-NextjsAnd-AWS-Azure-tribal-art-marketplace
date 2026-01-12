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
 * GET /api/artworks
 * Get all artworks with pagination and filtering
 * Query params: page, limit, artistId, tribe, minPrice, maxPrice, available
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const artistId = searchParams.get('artistId');
    const tribe = searchParams.get('tribe');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const available = searchParams.get('available');

    // Filter artworks
    let filteredArtworks = [...artworks];
    
    if (artistId) {
      filteredArtworks = filteredArtworks.filter(
        artwork => artwork.artistId === parseInt(artistId)
      );
    }
    
    if (tribe) {
      filteredArtworks = filteredArtworks.filter(
        artwork => artwork.tribe.toLowerCase() === tribe.toLowerCase()
      );
    }

    if (minPrice) {
      filteredArtworks = filteredArtworks.filter(
        artwork => artwork.price >= parseInt(minPrice)
      );
    }

    if (maxPrice) {
      filteredArtworks = filteredArtworks.filter(
        artwork => artwork.price <= parseInt(maxPrice)
      );
    }

    if (available !== null && available !== undefined) {
      const isAvailable = available === 'true';
      filteredArtworks = filteredArtworks.filter(artwork => artwork.available === isAvailable);
    }

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedArtworks = filteredArtworks.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      page,
      limit,
      total: filteredArtworks.length,
      totalPages: Math.ceil(filteredArtworks.length / limit),
      data: paginatedArtworks,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch artworks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/artworks
 * Create a new artwork
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validation
    if (!data.title || !data.artistId || !data.price || !data.tribe || !data.medium) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, artistId, price, tribe, medium' },
        { status: 400 }
      );
    }

    if (data.price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Price must be greater than 0' },
        { status: 400 }
      );
    }

    const newArtwork = {
      id: artworks.length + 1,
      title: data.title,
      artistId: data.artistId,
      artistName: data.artistName || 'Unknown Artist',
      price: data.price,
      tribe: data.tribe,
      medium: data.medium,
      size: data.size || 'Not specified',
      description: data.description || '',
      verified: data.verified || false,
      available: data.available !== undefined ? data.available : true,
    };

    artworks.push(newArtwork);

    return NextResponse.json(
      { success: true, message: 'Artwork created successfully', data: newArtwork },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create artwork' },
      { status: 500 }
    );
  }
}
