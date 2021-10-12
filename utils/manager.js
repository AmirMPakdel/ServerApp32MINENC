const fs = require("fs");
const env = require("../env");
const Database = require("./database");
const { sendViaFTP } = require("./downloadhost");
const encryptor = require("./encryptor");

const Manager = {

    status : "sleep",

    /**@type {NodeJs.Timeout} */
    timeout : null,

    init: ()=>{}
}

Manager.init = function(){
    
    //console.log("Manager->init");

    Manager.check();
}

Manager.check = function(){

    console.log("Manager->check");

    fs.readdir(FTP_READY_PATH, (err, files) => {

        if(!err){

            if(files.length){

                Manager.handle(files[0]);

            }else{

                Manager.hibernate();
            }

        }else{

            //TODO: handle this error
        }
    });
}

/**
 * 
 * @param {String} file_name 
 */
Manager.handle = function(file_name){

    console.log("Manager->handle");

    Manager.status = "working";

    let name_array = file_name.split(".");
    let id = name_array[0];
    
    Database.getUploadById(id, (err, result)=>{

        if(!err){

            if(result.length){

                let row = result[0];

                if(row.encrypt){

                    Manager.encrypt(row);

                }else{
                    
                    Manager.normal(row);
                }

            }else{

                //TODO: handle no row found for the upload
            }

        }else{

            //TODO: handle error
        }

    });
}

Manager.encrypt = function(upload_row){

    //console.log("Manager->encrypt");

    encryptor(upload_row.upload_key, upload_row.id, upload_row.type, (output_path)=>{

        Manager.ftp(upload_row);
    });
}

Manager.normal = function(upload_row){
    
    fs.rename(env.UPLOAD_READY_PATH + upload_row.upload_key, "./ftp_normal/"+upload_row.id+"."+upload_row.type, (err) => {
        
        if(!err){
            
            Manager.ftp(row);

        }else{
            //TODO: handle error
        }
    });
}

Manager.ftp = function(upload_row){

    //console.log("Manager->ftp");

    let file_name = upload_row.temp_key;
    let current_path = "./ftp_normal/"+upload_row.id+"."+upload_row.type;
    let destination = "./public_html/normal/"+file_name+"."+upload_row.type;;

    if(upload_row.encrypt){
        destination = "./public_html/encrypted/"+file_name+"."+upload_row.type;
        current_path = "./ftp_encrypted/"+upload_row.id+"."+upload_row.type;
    }

    sendViaFTP(current_path, destination).then(()=>{

        fs.unlink(current_path, (err3)=>{

            if(!err3){

                Database.setFinishedStatus(upload_row.id, (err, result)=>{

                    if(!err){

                        

                    }else{
                        
                        //TODO: handle error
                    }

                })

                Manager.check();

            }else{
                //TODO: handle error
                console.log(err3);
            }
            
        });

    }).catch((err2)=>{

        //TODO: handle error
        console.log(err2);
    });

}

Manager.uploadExpire = function(){

    setInterval(()=>{

        fs.readdir(env.FTP_NRM_PATH, (err, files) => {

            if(!err){
    
                files.forEach((fn)=>{

                    let name = fn.split(".")[0];
                    
                    Database.getUploadByUploadKey(name, (err1, result1)=>{

                        if(!err1 && result1[0]){

                            if( (Date.now() - result1[0].updated_at) > env.UPLOAD_EXPIRE_TIME){

                                //delete the row and the file
    
                                fs.unlink(env.FTP_NRM_PATH + fn, (err2)=>{
    
                                    if(!err2){
    
                                        Database.deletRowByUploadKey(name, (err3, result3)=>{
                                            
                                            if(err3){
                                                //TODO: handle error
                                            }
    
                                        })
    
                                    }else{
    
                                        //TODO: handle error
                                    }
    
                                })
                            }

                        }else{

                            //TODO: handle error
                        }

                    });

                })
    
            }else{
    
                //TODO: handle this error
            }
        });


    }, MANAGER_UPLOAD_EXPIRE_INTERVAL);
}

Manager.hibernate = function(){

    Manager.status = "hibernate";

    //console.log("Manager->hibernate");

    clearTimeout(Manager.timeout);

    Manager.timeout = setTimeout(()=>{

       Manager.check();
        
    },5000);
}



module.exports = Manager;