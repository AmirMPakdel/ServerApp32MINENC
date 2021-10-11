const Database = require("../utils/database");

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
 function getUploadObj(req, res){
    
    let {
        key
    } = req.body;

    Database.getUploadByTempKey(key, (err, result)=>{

        
    });
}

module.exports = getUploadObj;