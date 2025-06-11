require("dotenv").config();


module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
    logging: false,
   
  },
  test: {
    username: "root",
    password: null,
    database: "databae_test",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};


/*
module.exports={
  "development": {
    use_env_variable: "DATABASE_URL",
    logging:false
  },
  "test": {
    use_env_variable: "DATABASE_URL",
  },
  "production": {
    use_env_variable: "DATABASE_URL",
    logging:false,
    dialectOptions:{
      ssl:{
        require:true,
        rejectUnauthorized:false
      }
    }
  }
}
*/