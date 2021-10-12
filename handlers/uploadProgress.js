const Database = require("../utils/database");
const fs = require("fs");

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
function uploadProgress(req, res){

    if(req.file){

        let {
            
            upload_id,
            upload_key,

        } = req.body;

        Database.getUploadsRow(
            {
                id:upload_id,
                upload_key,
            },
            (err1, result1)=>{

                let row = result1[0];

                if(err1){

                    deleteTempFile(req.file)

                    res.status(500).json({
                        message: "fetching row from sql failed",
                        error:err1
                    });

                }else if(!row){

                    deleteTempFile(req.file)

                    //wrong id or temp_key
                    res.json({
                        result:2001
                    });

                }else{

                    //comparing the sizes
                    if(row.size !== req.file.size){

                        deleteTempFile(req.file)

                        //not the same file with the same size
                        res.json({
                            result:2002
                        });

                    }else{

                        fs.rename("./uploads/"+req.file.filename, "./upload_ready/"+upload_key, (err2) => {

                            if (err2){

                                //not the same file with the same size
                                res.status(500).json({
                                    message: "rename and moving file failed",
                                    error:err2
                                });

                            }else{

                                // success
                                res.json({
                                    result:1000,
                                    data:{}
                                });
                            }
                        });
                    }
                }
            }
        )

    }else{

        //no file found
        res.json({
            result:2003
        });
    }
}

function deleteTempFile(file, cb){

    fs.unlink("./uploads/"+file.filename, (err)=>{
        if(!err){
            if(cb)cb()
        }else{
            console.log("AMP1");
            console.log(err);
        }
    })
}

module.exports = uploadProgress;