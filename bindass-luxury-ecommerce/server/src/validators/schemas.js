const { z } = require('zod');

// Schema for registration
const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        mobile: z.string().optional(),
        birthdate: z.string().optional(),
        gender: z.string().optional()
    })
});

// Schema for login
const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required')
    })
});

// Schema for reviews
const reviewSchema = z.object({
    params: z.object({
        productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID format')
    }),
    body: z.object({
        rating: z.union([z.number(), z.string()]).transform(val => Number(val)).pipe(
            z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5')
        ),
        comment: z.string().min(1, 'Comment is required').max(1000, 'Comment cannot exceed 1000 characters')
    })
});

// Schema for cart sync
const cartSyncSchema = z.object({
    body: z.object({
        items: z.array(
            z.object({
                productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID format'),
                quantity: z.number().min(1).max(100).optional().default(1),
                size: z.string().optional().default('M'),
                image: z.string().optional(),
                name: z.string().optional(),
                price: z.number().optional()
            })
        ).optional().default([]),
        overwrite: z.boolean().optional().default(false)
    })
});

// Schema for product creation/updates
const productSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Product name is required').max(200, 'Product name cannot exceed 200 characters'),
        description: z.string().optional(),
        price: z.number().min(0, 'Price cannot be negative'),
        category: z.string().optional(),
        stock_quantity: z.number().int().min(0, 'Stock cannot be negative').optional().default(0),
        materials_care: z.string().optional(),
        materials_integrity: z.string().optional(),
        shipping_returns: z.string().optional(),
        promotions: z.string().optional(),
        pages: z.array(z.string()).optional(),
        images: z.array(z.string()).optional(),
        sizes: z.array(z.string()).optional(),
        colors: z.array(z.string()).optional(),
        fit: z.string().optional(),
        productType: z.string().optional()
    })
});

// Schema for order status updates
const orderStatusSchema = z.object({
    body: z.object({
        status: z.enum(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'], {
            errorMap: () => ({ message: 'Invalid order status' })
        })
    })
});

module.exports = {
    registerSchema,
    loginSchema,
    reviewSchema,
    cartSyncSchema,
    productSchema,
    orderStatusSchema
};
