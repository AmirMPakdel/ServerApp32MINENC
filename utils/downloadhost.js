
const ftp = require("basic-ftp")

async function sendViaFTP(){
    const client = new ftp.Client()
    client.ftp.verbose = true
    try {
        await client.access({
            host: "dltest.tootifa.ir",
            user: "pz13345",
            password: "bUuizF4k",
            secure: false
        })
        console.log(await client.list())
        await client.uploadFrom("./ftp_ready/1f5635g5h6r82g5h.mp4", "./public_html/1f5635g5h6r82g5h.mp4")
        //await client.downloadTo("README_COPY.md", "README_FTP.md")
    }
    catch(err) {
        console.log(err)
    }
    client.close()
}

module.exports = {
    sendViaFTP,
}