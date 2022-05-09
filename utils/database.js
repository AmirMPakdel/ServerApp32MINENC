const mysql = require('mysql');
const env = require('../env');


/**
 * @typedef {mysql.Connection} Connection
 * 
 * @type {{
 * connection:Connection,
 * init:()=>{},
 * createTable:()=>{},
 * drop:()=>{},
 * saveUploadInfo:(data, cb)=>{},
 * getUploadsRow:(data, cb)=>{},
 * getUploadById:(id, cb)=>{},
 * getUploadByUploadKey:(upload_key, cb)=>{},
 * setUploadEncKey:(upload_key, enc_key, cb)=>{},
 * setUploadedStatus:(id, size_enc, cb)=>{},
 * setUploadEncrypt:(upload_key, encrypt, cb)=>{},
 * setFinishedStatus:(id, cb)=>{},
 * deletRowByUploadKey:(upload_key, cb)=>{}
 * }}
 */
const Database = {};

Database.connection = mysql.createConnection({
    host: env.DB_HOST,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
});

Database.connection.connect(function(err) {
    if (err) throw err;
    console.log("mysql connected!");
});

Database.init = function(){

    Database.connection.query("CREATE DATABASE convertor", function (err, result) {
        
        if (!err) console.log("Database created");

        Database.createTable();
        
    });
}

Database.createTable = function(){

    let sql = "CREATE TABLE uploads (id INT AUTO_INCREMENT PRIMARY KEY, tenant VARCHAR(64), upload_key VARCHAR(64), "+
    "size BIGINT, type VARCHAR(16), encrypt BOOLEAN, status VARCHAR(16), size_enc BIGINT, "+ 
    "public BOOLEAN, enc_key VARCHAR(16), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "+
    "updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)";
        
        Database.connection.query(sql, function (err, result) {
            
            if (!err){
                console.log("Table created");
            }else{
                console.log(err);
            }
        });
}

Database.drop = function(cb){

    let sql = "DROP TABLE uploads";

    Database.connection.query(sql, function (err, result) {
            
        if (!err){
            console.log("Table droped!");
            cb();
        }

    });
}


Database.saveUploadInfo = function(data, cb){

    let {

        upload_key,
        size,
        type,
        encrypt,
        public,
        tenant,

    } = data;

    let qr = `INSERT INTO uploads (upload_key, size, type, public, status, encrypt, tenant) VALUES ('${upload_key}', '${size}', '${type}',${public}, 'verified', ${encrypt}, '${tenant}')`;

    Database.connection.query(qr, function (err, result) {
        
        cb(err, result);
        
    });
}

Database.getUploadsRow = function(data, cb){

    let {

        tenant,
        id,
        upload_key,

    } = data;

    let qr = `SELECT * FROM uploads WHERE id = ${id} AND upload_key = '${upload_key}' AND tenant = '${tenant}'`;

    Database.connection.query(qr, function (err, result) {
        
        cb(err, result);
        
    });
}

Database.getUploadById = function(id, cb){

    let qr = `SELECT * FROM uploads WHERE id = ${id}`;

    Database.connection.query(qr, function (err, result) {
        
        cb(err, result);
        
    });
}

Database.getUploadByUploadKey = function(upload_key, cb){

    let qr = `SELECT * FROM uploads WHERE upload_key = '${upload_key}'`;

    Database.connection.query(qr, function (err, result) {
        
        cb(err, result);
        
    });
}

Database.setUploadEncKey = function(upload_key, enc_key, cb){
    
    let qr = `UPDATE uploads SET enc_key = '${enc_key}' WHERE upload_key = '${upload_key}'`;

    Database.connection.query(qr, function (err, result) {
        
        cb(err, result);
        
    });
}

Database.setUploadedStatus = function(id, size_enc, cb){

    let qr = `UPDATE uploads SET status = 'uploaded', updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;

    Database.connection.query(qr, function (err, result) {
        
        cb(err, result);
        
    });
}

Database.setUploadEncrypt = function(upload_key, encrypt, cb){
    
    let qr = `UPDATE uploads SET encrypt = ${encrypt}, updated_at = CURRENT_TIMESTAMP WHERE upload_key = ${upload_key}`;

    Database.connection.query(qr, function (err, result) {
        
        cb(err, result);
        
    });
}

Database.setFinishedStatus = function(upload_key, cb){

    let qr = `UPDATE uploads SET status = 'finished', updated_at = CURRENT_TIMESTAMP WHERE upload_key = '${upload_key}'`;

    Database.connection.query(qr, function (err, result) {
        
        cb(err, result);
        
    });
}

Database.deletRowByUploadKey = function(upload_key, cb){

    let qr = `DELETE FROM uploads WHERE upload_key = '${upload_key}'`;

    Database.connection.query(qr, function (err, result) {
        
        cb(err, result);
        
    });
}

module.exports = Database;

