// PayU Configuration
export const PAYU_CONFIG = {
    // Production credentials
    MERCHANT_KEY: process.env.PAYU_MERCHANT_KEY || 'pYOw9i',
    MERCHANT_SALT: process.env.PAYU_MERCHANT_SALT || 'imI8ROxL7G8wkvO2JThIjEQfjcJuksUi',
    CLIENT_ID: process.env.PAYU_CLIENT_ID || 'fbca5bb584f7475c0b50bc54ca1c2fc3823f98b99a3743c00c7751e983e478af',
    CLIENT_SECRET: process.env.PAYU_CLIENT_SECRET || 'f8f0803305ff42f5ff6450b9182725ca455fb238d28640da2c5de98893c944ec',
    ENVIRONMENT: process.env.PAYU_ENVIRONMENT || 'LIVE', // TEST or LIVE

    // URLs
    PAYMENT_URL: process.env.PAYU_ENVIRONMENT === 'TEST'
        ? 'https://test.payu.in/_payment'
        : 'https://secure.payu.in/_payment',

    // Callback URLs - Update these with your domain
    SUCCESS_URL: process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/success`
        : 'http://localhost:3000/api/payment/success',

    FAILURE_URL: process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/failure`
        : 'http://localhost:3000/api/payment/failure',

    CANCEL_URL: process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/cancel`
        : 'http://localhost:3000/api/payment/cancel',
};

// Test card details for testing (use only in TEST mode)
export const TEST_CARDS = {
    SUCCESS: {
        number: '5123456789012346',
        cvv: '123',
        expiry: '05/2026',
        name: 'Test Card'
    },
    FAILURE: {
        number: '4111111111111111',
        cvv: '123',
        expiry: '05/2026',
        name: 'Test Card'
    }
};

// Test UPI VPA (use only in TEST mode)
export const TEST_UPI_VPA = 'success@payu';
