const ftp = require("basic-ftp");

const HOST = "dltest.tootifa.ir";
const USER = "pz13345";
const PASS = "bUuizF4k";
const SECURE = false;

async function sendViaFTP(source_path, target_path){

    const client = new ftp.Client()

    client.ftp.verbose = true

    try {

        await client.access({
            host: HOST,
            user: USER,
            password: PASS,
            secure: SECURE
        })
        //console.log(await client.list())
        //"./public_html/1f5635g5h6r82g5h.mp4"
        await client.uploadFrom(source_path, target_path);

        await client.send("SITE CHMOD 640 "+target_path, false);

        //await client.downloadTo("README_COPY.md", "README_FTP.md")

    }catch(err) {
        console.log(err)
    }

    client.close()
}

module.exports = {
    sendViaFTP,
}