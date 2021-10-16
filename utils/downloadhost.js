const ftp = require("basic-ftp");
const env = require("../env");

async function sendViaFTP(source_path, distination_dir, file_name, public){

    const client = new ftp.Client()

    client.ftp.verbose = env.DLHOST_VERBOSE;

    // file_name = "1.mp4"

    try {

        await client.access({
            host: env.DLHOST_DOMAIN,
            user: env.DLHOST_USERNAME,
            password: env.DLHOST_PASSWORD,
            secure: env.DLHOST_SECURE_MODE,
        })

        //console.log(await client.list())

        await client.ensureDir(distination_dir);

        await client.uploadFrom(source_path, file_name);

        // if its not for public use then set access control
        if(!public){
            await client.send("SITE CHMOD 640 ./"+file_name, false);
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