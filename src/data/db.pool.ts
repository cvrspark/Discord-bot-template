import mysql from 'mysql2/promise';
import config from "../../config.json";
import fs from 'fs';
import path from 'path';

const pool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    multipleStatements: true, 
    waitForConnections: true,
    connectionLimit: 10
});

export async function startDatabase() {
    let connection;
    try {
        connection = await pool.getConnection();

        const schemaPath = path.join(__dirname, 'schemas');
        const orderPath = path.join(__dirname, 'order.json');
        
        if (!fs.existsSync(orderPath)) {
            console.error("Missing order.json");
            return;
        }

        const order = JSON.parse(fs.readFileSync(orderPath, 'utf8'));

        for (const fileName of order) {
            const filePath = path.join(schemaPath, fileName);
            if (fs.existsSync(filePath)) {
                const sql = fs.readFileSync(filePath, 'utf8');
                await connection.query(sql);
            } 
        }

        console.log("Database connected");
    } catch (err) {
        console.error("Error: ", err);
    } finally {
        if (connection) connection.release();
    }
}

export default pool;