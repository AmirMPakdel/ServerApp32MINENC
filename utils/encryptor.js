const fs = require("fs");
const crypto = require("crypto");
const statics = require("../statics");

function injectId (id, input_path, output_path, cb){

    let zTemp = "";
    let temp = id;
    
    for(let i=0; i<16; i++){
        zTemp+="####";
    }
    
    for(let i=0; i<4078; i++){
        temp+="##";
    }

    let input_file = fs.createReadStream(input_path);

    let output_file = fs.createWriteStream(output_path);

    input_file.on("end", ()=>{

        input_file.close();
        //console.log("input_file on end");
    });

    input_file.on("close", ()=>{

        //console.log("input_file on close");
    });

    output_file.on("finish", ()=>{
        
        output_file.close();
    });

    output_file.on("close", ()=>{

        // deleting the nii file
        fs.unlink(input_path, cb)
    });
    
    output_file.write(temp, (err)=>{
    
        if(err){

            statics.criticalInternalError(err, "output_file.write");

        }else{

            input_file.pipe(output_file);
        }
    });
}

function encrypt_file(enc_key, input_path, output_path, cb) {

    let algo = "aes-128-cbc";
    enc_key = "fT6GI9OnH8G9klNd";
    let iv = "ni85Gnj8LdOi92Fn";
    let cipher = crypto.createCipheriv(algo, enc_key, iv);
    let input = fs.createReadStream(input_path, {highWaterMark:8192});
    let output = fs.createWriteStream(output_path, {highWaterMark:8192});

    input.pipe(cipher).pipe(output);

    output.on('finish', ()=> {

        fs.unlink(input_path, ()=>{

            cb(null, output_path);
        });
    });

    output.on("error", (err)=>{

        statics.criticalInternalError(err, "handle encrypt error");

        fs.unlink(input_path, ()=>{

            cb(err, null);
        });
    });
}

function encryptor(enc_key, upload_key, id, file_type, cb){

    //TODO: get real id
    // id = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";

    //nii -> need id inject
    encrypt_file(enc_key, "./ftp_normal/"+upload_key, "./ftp_encrypted/"+upload_key+".nii", (err)=>{

        if(!err){
            
            injectId(id, "./ftp_encrypted/"+upload_key+".nii", "./ftp_encrypted/"+upload_key, ()=>{

                cb("./ftp_encrypted/"+upload_key);
            });

        }else{

            statics.criticalInternalError(err, "handle encrypt error");
        }
    });
}

module.exports = encryptor;