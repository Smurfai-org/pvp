// perm tikrinimui
// grazina true, jeigu turi reikiamas teisias
// grazina false, jeigu tokiu teisiu neturi
// perms skirtas reikiamu permisions ivedimui
// 3: admin
// 2: ai
// 1: user
// 0: tik testavimui

import pool from "./db";

const checkPerms = async (id, perms) => {
    
    // TESTAVIMUI
    if(perms === 0) {
        return true;
    }

    try {
        const [userPerms] = await pool.execute("SELECT * WHERE id = ?", [id]);

        if(userPerms.length === 0) {
            return false;
        }

        return userPerms[0] === perms;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export default checkPerms;