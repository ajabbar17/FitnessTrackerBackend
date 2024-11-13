const bcrypt = require('bcryptjs');
const pool = require('./db');

async function encryptPasswords() {
    try {
        // Retrieve customers from the database
        const getCustomersQuery = 'SELECT email,password FROM Users';
        const { rows: customers } = await pool.query(getCustomersQuery);
        console.log(customers);

        // Iterate over each customer and hash their plain text password
        for (const customer of customers) {
            const hashedPassword = await bcrypt.hash(customer.password, 10); // Hash password with bcrypt
            const updateCustomerQuery = 'UPDATE Customer SET password = $1 WHERE email = $2';
            await pool.query(updateCustomerQuery, [hashedPassword, customer.email]); // Update password in the database
            console.log(`Password encrypted for admin with username ${customer.email}`);
        }

        console.log('All passwords encrypted successfully.');
    } catch (error) {
        console.error('Error encrypting passwords:', error);
    }
}

encryptPasswords();