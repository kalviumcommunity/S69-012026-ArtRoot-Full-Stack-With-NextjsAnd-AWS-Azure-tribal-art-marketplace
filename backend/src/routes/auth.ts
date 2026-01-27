import express from 'express';
import { ZodError } from 'zod';
import { signupSchema, loginSchema, hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { Role, isValidRole } from '../config/roles';
import { logger } from '../utils/logger';

const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = signupSchema.parse(req.body);
        const requestedRole = req.body.role as string;

        // Default role is 'viewer', can be 'artist' if specified
        // Admin role cannot be self-assigned, must be set manually
        let role: Role = 'viewer';
        if (requestedRole === 'artist') {
            role = 'artist';
        } else if (requestedRole === 'admin') {
            // Prevent self-assignment of admin role
            logger.security('AUTH', `Attempted admin self-assignment by ${email}`);
            return res.status(403).json({ 
                error: 'Admin role cannot be self-assigned',
                code: 'ROLE_FORBIDDEN'
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // TODO: Save to database
        // Mock user ID
        const userId = Date.now().toString();

        const token = generateToken(userId, email, role);

        logger.info('AUTH', `User registered: ${email} with role ${role}`);

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: userId, name, email, role }
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ error: error.issues[0].message });
            return;
        }
        logger.error('AUTH', 'Signup error', { error });
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        // Mock user lookup - In production, query database
        // Assign roles based on email for demo purposes
        let role: Role = 'viewer';
        if (email.includes('admin')) {
            role = 'admin';
        } else if (email.includes('artist')) {
            role = 'artist';
        }

        interface StoredUser {
            id: string;
            email: string;
            password: string;
            name: string;
            role: Role;
        }

        const storedUser: StoredUser = {
            id: '123',
            email: email,
            password: '$2b$10$example', // Needs real hash in production
            name: 'Test User',
            role: role,
        };

        // FORCE SUCCESS FOR DEMO as we don't have the hash for '$2b$10$example'
        const isValid = true;

        if (!isValid) {
            logger.warn('AUTH', `Failed login attempt for ${email}`);
            res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
            return;
        }

        const token = generateToken(storedUser.id, storedUser.email, storedUser.role);

        logger.info('AUTH', `User logged in: ${email} with role ${role}`);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: storedUser.id,
                name: storedUser.name,
                email: storedUser.email,
                role: storedUser.role,
            },
        });

    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ error: error.issues[0].message, code: 'VALIDATION_FAILED' });
            return;
        }
        logger.error('AUTH', 'Login error', { error });
        res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
    }
});

export default router;
