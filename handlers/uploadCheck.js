const { default: axios } = require("axios");
const Database = require("../utils/database");

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
function uploadCheck(req, res){
    

    let {

        user_token,
        upload_key, // generated in main_server

    } = req.body;

    // axios.post("/api/upload_file_check", {user_token, temp_key}).then((res1)=>{

    //     let d1 = res1.data;

    // }).catch((e)=>{

    //     res.status(500).json({
    //         message: "main_server /api/upload_file_check failed",
    //         error:e
    //     })
    // });

    setTimeout((req, res)=>{

        let d1 = {
            result:1000,
            data:{
                upload_key:"j45j3j45",
                encrypt:true,
                file_size:1428135, 
                file_type:"mp4",
            }
        }//res1.data;


        if(d1.result === 1000){

            //TODO: check local diskspace
            //TODO: check dlhost diskspace

            Database.saveUploadInfo(
                {
                    upload_key: d1.data.upload_key,
                    size: d1.data.file_size,
                    type: d1.data.file_type,
                    encrypt: d1.data.encrypt,
                },
                (err, result)=>{

                    if(err){

                        //TODO: handle db error
                        res.status(500).json({
                            message: "saving upload info error",
                            error:err
                        })

                    }else{

                        // tell user its ok to upload ur file
                        res.json({
                            result:1000,
                            data:{
                                upload_id: result.insertId,
                                upload_key: d1.data.upload_key,
                                info: result,
                            }
                        });

                    }
                }
            )

        }else{
            //TODO: handle error
        }
        

    }, 1500, req, res);

}

module.exports = uploadCheck;