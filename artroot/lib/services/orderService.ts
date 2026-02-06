import { query, transaction } from '../db';
import { logger } from '../logger';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
    id: number;
    order_number: string;
    buyer_id: number;
    artwork_id: number;
    artist_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    status: OrderStatus;
    delivery_address?: string;
    tracking_number?: string;
    notes?: string;
    created_at: Date;
    updated_at: Date;
    delivered_at?: Date;
}

export interface OrderDetails extends Order {
    artwork_title: string;
    artist_name: string;
    buyer_name: string;
}

function generateOrderNumber() {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${Date.now()}-${random}`;
}

export async function createOrder(data: {
    buyerId: number;
    artworkId: number;
    quantity?: number;
    deliveryAddress?: string;
    notes?: string;
}) {
    try {
        let createdOrder: Order | null = null;
        const quantity = data.quantity || 1;

        await transaction(async (client) => {
            const artworkResult = await client.query(
                `SELECT id, price, artist_id, is_available, stock_quantity FROM artworks WHERE id = $1`,
                [data.artworkId]
            );

            const artwork = artworkResult.rows[0];
            if (!artwork) {
                throw new Error('ARTWORK_NOT_FOUND');
            }

            if (!artwork.is_available || artwork.stock_quantity <= 0) {
                throw new Error('ARTWORK_NOT_AVAILABLE');
            }

            if (artwork.stock_quantity < quantity) {
                throw new Error('NOT_ENOUGH_STOCK');
            }

            const unitPrice = Number(artwork.price);
            const totalPrice = unitPrice * quantity;
            const orderNumber = generateOrderNumber();

            const orderResult = await client.query(
                `INSERT INTO orders (
                    order_number, buyer_id, artwork_id, artist_id,
                    quantity, unit_price, total_price, status,
                    delivery_address, notes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9)
                RETURNING *`,
                [
                    orderNumber,
                    data.buyerId,
                    data.artworkId,
                    artwork.artist_id,
                    quantity,
                    unitPrice,
                    totalPrice,
                    data.deliveryAddress || null,
                    data.notes || null
                ]
            );

            createdOrder = orderResult.rows[0];

            await client.query(
                `UPDATE artworks 
                 SET stock_quantity = stock_quantity - $1,
                     is_available = CASE WHEN stock_quantity - $1 <= 0 THEN false ELSE is_available END,
                     updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $2`,
                [quantity, data.artworkId]
            );
        });

        if (!createdOrder) {
            throw new Error('ORDER_CREATE_FAILED');
        }

        const order = createdOrder as Order;
        logger.info('DATABASE', 'Order created successfully', { orderId: order.id });
        return order;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to create order', { error: error.message });
        throw error;
    }
}

export async function getOrderById(orderId: number) {
    try {
        const result = await query<OrderDetails>(
            `SELECT
                o.*, ar.title as artwork_title,
                au.name as artist_name,
                bu.name as buyer_name
            FROM orders o
            JOIN artworks ar ON o.artwork_id = ar.id
            JOIN artists a ON o.artist_id = a.id
            JOIN users au ON a.user_id = au.id
            JOIN users bu ON o.buyer_id = bu.id
            WHERE o.id = $1`,
            [orderId]
        );

        return result.rows[0] || null;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to fetch order by id', { orderId, error: error.message });
        throw error;
    }
}

export async function getOrdersByBuyer(buyerId: number, page: number = 1, limit: number = 10) {
    try {
        const offset = (page - 1) * limit;

        const countResult = await query<{ total: string }>(
            `SELECT COUNT(*) as total FROM orders WHERE buyer_id = $1`,
            [buyerId]
        );
        const total = parseInt(countResult.rows[0]?.total || '0');

        const result = await query<OrderDetails>(
            `SELECT
                o.*, ar.title as artwork_title,
                au.name as artist_name,
                bu.name as buyer_name
            FROM orders o
            JOIN artworks ar ON o.artwork_id = ar.id
            JOIN artists a ON o.artist_id = a.id
            JOIN users au ON a.user_id = au.id
            JOIN users bu ON o.buyer_id = bu.id
            WHERE o.buyer_id = $1
            ORDER BY o.created_at DESC
            LIMIT $2 OFFSET $3`,
            [buyerId, limit, offset]
        );

        return {
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: result.rows
        };
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to fetch orders for buyer', { buyerId, error: error.message });
        throw error;
    }
}

export async function getOrdersByArtist(artistId: number, page: number = 1, limit: number = 10) {
    try {
        const offset = (page - 1) * limit;

        const countResult = await query<{ total: string }>(
            `SELECT COUNT(*) as total FROM orders WHERE artist_id = $1`,
            [artistId]
        );
        const total = parseInt(countResult.rows[0]?.total || '0');

        const result = await query<OrderDetails>(
            `SELECT
                o.*, ar.title as artwork_title,
                au.name as artist_name,
                bu.name as buyer_name
            FROM orders o
            JOIN artworks ar ON o.artwork_id = ar.id
            JOIN artists a ON o.artist_id = a.id
            JOIN users au ON a.user_id = au.id
            JOIN users bu ON o.buyer_id = bu.id
            WHERE o.artist_id = $1
            ORDER BY o.created_at DESC
            LIMIT $2 OFFSET $3`,
            [artistId, limit, offset]
        );

        return {
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: result.rows
        };
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to fetch orders for artist', { artistId, error: error.message });
        throw error;
    }
}

export async function updateOrderStatus(orderId: number, status: OrderStatus, trackingNumber?: string) {
    try {
        const deliveredAt = status === 'delivered' ? 'CURRENT_TIMESTAMP' : null;

        const result = await query<Order>(
            `UPDATE orders
             SET status = $1,
                 tracking_number = $2,
                 delivered_at = ${deliveredAt ? deliveredAt : 'delivered_at'},
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING *`,
            [status, trackingNumber || null, orderId]
        );

        logger.info('DATABASE', 'Order status updated', { orderId, status });
        return result.rows[0] || null;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to update order status', { orderId, error: error.message });
        throw error;
    }
}
export async function cancelOrder(orderId: number) {
    try {
        let updatedOrder: Order | null = null;

        await transaction(async (client) => {
            const orderResult = await client.query(
                `SELECT id, artwork_id, quantity, status FROM orders WHERE id = $1`,
                [orderId]
            );

            const order = orderResult.rows[0];
            if (!order) {
                throw new Error('ORDER_NOT_FOUND');
            }

            if (order.status === 'shipped' || order.status === 'delivered') {
                throw new Error('ORDER_ALREADY_PROCESSED');
            }

            const updateResult = await client.query(
                `UPDATE orders 
                 SET status = 'cancelled', 
                     updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $1 
                 RETURNING *`,
                [orderId]
            );

            updatedOrder = updateResult.rows[0];

            await client.query(
                `UPDATE artworks 
                 SET is_available = true,
                     stock_quantity = stock_quantity + $1,
                     updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $2`,
                [order.quantity, order.artwork_id]
            );
        });

        logger.info('DATABASE', 'Order cancelled and artwork restocked', { orderId });
        return updatedOrder;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to cancel order', { orderId, error: error.message });
        throw error;
    }
}
