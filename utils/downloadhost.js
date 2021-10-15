const ftp = require("basic-ftp");
const env = require("../env");

async function sendViaFTP(source_path, target_path, public){

    const client = new ftp.Client()

    client.ftp.verbose = env.DLHOST_VERBOSE;

    try {

        await client.access({
            host: env.DLHOST_DOMAIN,
            user: env.DLHOST_USERNAME,
            password: env.DLHOST_PASSWORD,
            secure: env.DLHOST_SECURE_MODE,
        })

        //console.log(await client.list())
        
        await client.uploadFrom(source_path, target_path);

        // if its not for public use then set access control
        if(!public){
            await client.send("SITE CHMOD 640 "+target_path, false);
        }

        //await client.downloadTo("README_COPY.md", "README_FTP.md")

    }catch(err) {
        console.log(err)
    }

    client.close();
}

module.exports = {
    sendViaFTP,
}