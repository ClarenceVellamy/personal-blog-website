const { Pool } = require('pg')

const dbPool = new Pool({
    // database : 'da45q7q7af4tqq',
    // host: 'ec2-50-17-255-244.compute-1.amazonaws.com',
    // port : 5432,
    // user : 'kpbhgrmguuuakg',
    // password : '204cbf23d70d430dcb9fc0c5663b893934f6706506e04674103d1368a7528cb8',
    // ssl: true

    connectionString: 'postgres://kpbhgrmguuuakg:204cbf23d70d430dcb9fc0c5663b893934f6706506e04674103d1368a7528cb8@ec2-50-17-255-244.compute-1.amazonaws.com:5432/da45q7q7af4tqq',
    ssl: {rejectUnauthorized : false}
})

module.exports = dbPool