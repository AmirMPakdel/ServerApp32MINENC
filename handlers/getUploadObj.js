const Database = require("../utils/database");

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
 function getUploadObj(req, res){
    
    let {
        
        upload_key

    } = req.body;

    Database.getUploadByUploadKey(upload_key, (err, result)=>{

        if(!err){

            res.json(result);

        }else{

            //TODO: handle err
            res.json({
                result:2001,
                error:"row not found",
                message:err
            })
        }
        
    });
}

module.exports = getUploadObj;