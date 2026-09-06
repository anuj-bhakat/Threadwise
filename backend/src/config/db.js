import pg from "pg";
import dotenv from "dotenv";


dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});


export const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log('Connected to Database');
        client.release();
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    }
};

export default pool;