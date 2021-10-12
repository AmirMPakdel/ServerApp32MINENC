const Database = require("../utils/database");
const fs = require('fs')

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
 function moveToFtp(req, res){
    
    let {

        upload_key,

    } = req.body;

    Database.getUploadByTempKey(upload_key, (err1, result)=>{

        if(!err1){

            let row = result[0];

            if(row){

                fs.rename("./upload_ready/"+upload_key, "./ftp_normal/"+row.id+"."+row.type, (err2) => {

                    if(!err2){
            
                        res.json({
                            result:1000
                        });
            
                    }else{
            
                        //TODO: handle errors
                        res.json({
                            result:2001,
                            error:"",
                            message:err2
                        });
                    }
                });

            }else{

                //TODO: handle errors
                res.json({
                    result:2002,
                    error:"row not found",
                    message:""
                })
            }

        }else{

            //TODO: handle errors
            res.json({
                result:2003,
                error:"",
                message:err1
            })
        }
    });

    

}

module.exports = moveToFtp;