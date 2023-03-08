const mssql = require('mssql');
require('dotenv').config({path:'../../.env'});

//MS SQLServer connection config
const sqlConfig = {
    user: process.env.SS_USER_NAME,
    password: process.env.SS_PASSWORD,
    server: process.env.SS_SERVER,
    options: {
        encrypt: true,
        trustServerCertificate:true,
        instanceName:process.env.SS_INSTANCE,
    }
}

const poolPromise = new mssql.ConnectionPool(sqlConfig)
    .connect()
    .then(pool =>{
        console.log('Connected to MSSQL instance!')
        return pool
    }).catch( err =>{
        console.log('MSSQL connection failed, ', err)
    })

module.exports = {
    mssql, 
    poolPromise
}