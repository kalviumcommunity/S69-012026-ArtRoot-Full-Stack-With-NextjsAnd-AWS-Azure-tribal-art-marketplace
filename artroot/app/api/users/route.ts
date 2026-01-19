import { sendSuccess, sendError } from '@/lib/responseHandler';
import { ERROR_CODES } from '@/lib/errorCodes';

// Mock database - in production, replace with actual database
let users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'buyer', createdAt: '2026-01-01' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'buyer', createdAt: '2026-01-05' },
  { id: 3, name: 'Ramesh Kumar', email: 'ramesh@artroot.com', role: 'artist', createdAt: '2026-01-10' },
];

/**
 * GET /api/users
 * Get all users with pagination
 * Query params: page, limit, role
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const role = searchParams.get('role');

    // Filter users
    let filteredUsers = [...users];
    
    if (role) {
      filteredUsers = filteredUsers.filter(
        user => user.role.toLowerCase() === role.toLowerCase()
      );
    }

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return sendSuccess({
      page,
      limit,
      total: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / limit),
      data: paginatedUsers,
    }, 'Users retrieved successfully');
  } catch (error) {
    return NextResponse.json(
      { sucsendError('Failed to fetch users', ERROR_CODES.OPERATION_FAILED, 500
}

/**
 * POST /api/users
 * Create a new user
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validation
    if (!data.name || !data.email || !data.role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, email, role' },
        { status: 400 }
      );sendError('Missing required fields: name, email, role', ERROR_CODES.MISSING_REQUIRED_FIELDS, 400);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return sendError('Invalid email format', ERROR_CODES.INVALID_EMAIL, 400);
    }

    // Role validation
    if (!['buyer', 'artist', 'admin'].includes(data.role.toLowerCase())) {
      return sendError('Role must be buyer, artist, or admin', ERROR_CODES.INVALID_ROLE, 400);
    }

    // Check for duplicate email
    const existingUser = users.find(u => u.email === data.email);
    if (existingUser) {
      return sendError('User with this email already exists', ERROR_CODES.EMAIL_ALREADY_EXISTS, 409nst newUser = {
      id: users.length + 1,
      name: data.name,
      email: data.email,
      role: data.role.toLowerCase(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    users.push(newUser);

    return sendSuccess(newUser, 'User created successfully', 201);
  } catch (error) {
    return sendError('Failed to create user', ERROR_CODES.OPERATION_FAILED, 500);
  }
}
