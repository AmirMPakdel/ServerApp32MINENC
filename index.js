const env = require("./env");
const server = require("./server");

const server_config = {
    PORT: env.PORT,
}

const manager_config = {
    MANAGER_CHECK_INTERVAL: env.MANAGER_CHECK_INTERVAL,
    UPLOAD_EXPIRE_TIME: env.UPLOAD_EXPIRE_TIME,
    MANAGER_UPLOAD_EXPIRE_INTERVAL: env.MANAGER_UPLOAD_EXPIRE_INTERVAL,
    FTP_DISABLED_TEST_MODE: false,
}

server.run(server_config, manager_config);