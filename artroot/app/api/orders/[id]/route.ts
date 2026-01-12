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
 * GET /api/orders/:id
 * Get order by ID
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const order = orders.find(o => o.id === id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/orders/:id
 * Update order by ID (typically for status updates)
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await req.json();
    const orderIndex = orders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Status validation if status is being updated
    if (data.status && !['pending', 'processing', 'shipped', 'completed', 'cancelled'].includes(data.status.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be: pending, processing, shipped, completed, or cancelled' },
        { status: 400 }
      );
    }

    // Update order
    orders[orderIndex] = {
      ...orders[orderIndex],
      ...data,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString().split('T')[0],
    };

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      data: orders[orderIndex],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders/:id
 * Delete order by ID (cancel order)
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const orderIndex = orders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order can be cancelled
    if (orders[orderIndex].status === 'completed' || orders[orderIndex].status === 'shipped') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete completed or shipped orders' },
        { status: 400 }
      );
    }

    const deletedOrder = orders.splice(orderIndex, 1)[0];

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
      data: deletedOrder,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
