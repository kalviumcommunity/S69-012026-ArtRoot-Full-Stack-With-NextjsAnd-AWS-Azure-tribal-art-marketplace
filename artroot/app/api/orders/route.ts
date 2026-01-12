import { NextResponse } from 'next/server';

// Mock database - in production, replace with actual database
let orders = [
  { 
    id: 1, 
    userId: 1,
    userName: 'Alice Johnson',
    artworkId: 1,
    artworkTitle: 'Village Harvest',
    artistId: 1,
    price: 5000,
    status: 'completed',
    createdAt: '2026-01-08',
    updatedAt: '2026-01-10'
  },
  { 
    id: 2, 
    userId: 2,
    userName: 'Bob Smith',
    artworkId: 3,
    artworkTitle: 'Wedding Ceremony',
    artistId: 2,
    price: 6500,
    status: 'pending',
    createdAt: '2026-01-11',
    updatedAt: '2026-01-11'
  },
];

/**
 * GET /api/orders
 * Get all orders with pagination
 * Query params: page, limit, userId, status
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    // Filter orders
    let filteredOrders = [...orders];
    
    if (userId) {
      filteredOrders = filteredOrders.filter(
        order => order.userId === parseInt(userId)
      );
    }
    
    if (status) {
      filteredOrders = filteredOrders.filter(
        order => order.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      page,
      limit,
      total: filteredOrders.length,
      totalPages: Math.ceil(filteredOrders.length / limit),
      data: paginatedOrders,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Create a new order
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validation
    if (!data.userId || !data.artworkId || !data.price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, artworkId, price' },
        { status: 400 }
      );
    }

    if (data.price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Price must be greater than 0' },
        { status: 400 }
      );
    }

    const newOrder = {
      id: orders.length + 1,
      userId: data.userId,
      userName: data.userName || 'Unknown User',
      artworkId: data.artworkId,
      artworkTitle: data.artworkTitle || 'Unknown Artwork',
      artistId: data.artistId || 0,
      price: data.price,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    orders.push(newOrder);

    return NextResponse.json(
      { success: true, message: 'Order created successfully', data: newOrder },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
