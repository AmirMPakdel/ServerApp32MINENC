const server = require("../server");

function run(cb){

    const server_config = {
        PORT: 8020,
    }
    
    const manager_config = {
        MANAGER_CHECK_INTERVAL: 3 * 1000,
        UPLOAD_EXPIRE_TIME: 3600 * 1000,
        MANAGER_UPLOAD_EXPIRE_INTERVAL: 640 * 1000,
        FTP_DISABLED_TEST_MODE: true,
    }

    server.run(server_config, manager_config, cb);

}

module.exports = {run};