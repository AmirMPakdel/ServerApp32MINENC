const fs = require("fs");

function encrypt(input_path, output_path, package_key, cb) {

    let algo = "aes-128-cbc";
    //let key = "iJ6GI9OnH8G9klNd";
    let iv = "kw85Gnj8LdOi92Fn";
    let cipher = crypto.createCipheriv(algo, package_key, iv);
    let input = fs.createReadStream(input_path);
    let output = fs.createWriteStream(output_path);
    
    input.pipe(cipher).pipe(output);

    output.on('finish', ()=> {
        cb(null, output_path);
    });

    output.on("error", (err)=>{
        console.log(err);
        cb(err, null)
    })
}

module.exports = encrypt;