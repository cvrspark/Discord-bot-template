import pool from "../db.pool";

export default class FuncClassName { //eg Usr
    static async fun(){
        const connection = await pool.getConnection()
        //....
    }
}