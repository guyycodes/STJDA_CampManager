const express = require('express')

const cookieParser = require('cookie-parser');
const sequelize = require('./config/connection.js');    
const path = require('path')
const cors = require('cors')
const { config } = require('dotenv');
const controllers = require('./controllers/index.js')
const models = require('./models/index.js')

const Redis = require('ioredis');
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});
// import { readFileSync } from "fs";
// import connectDB from './config/connection.js'
// import seedDatabase from './config/seeds.js'; 
// import emailjs from '@emailjs/nodejs';


config({ path: '.env' });

const PORT = process.env.PORT || 3000; // Default to 3001 if process.env.PORT is not set

const app = express()
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, // Allow cookies and other credentials to be sent with requests
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public'))); 
app.use(express.json());
app.use(cookieParser());

// app.use((req, res, next) => {
//   console.log(`Request received: ${req.method} ${req.url}`);
//   console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
//   if (req.method === 'PUT' || req.method === 'POST') {
//     let body = '';
//     req.on('data', chunk => {
//       body += chunk.toString();
//       if (body.length > 1e6) req.connection.destroy(); // Prevent very large requests
//     });
    
//     req.on('end', () => {
//       console.log(`Request body size: ${body.length} bytes`);
//       console.log('Request body (truncated):', body.substring(0, 200) + '...');
//       req.rawBody = body;  // Store the raw body for later use if needed
//       next();
//     });
//   } else {
//     next();
//   }
// });

// // Add this after your routes to catch errors
// app.use((error, req, res, next) => {
//   console.error('Error occurred:', error);
//   res.status(500).json({ error: error.message });
//   next();
// });

app.use("/api", controllers);


async function syncAllModels() {
  try {
      // Authenticate with the database
      await sequelize.authenticate();
      console.log('Connection has been established successfully.');

      // Dynamically sync all models with 'alter: true'
      for (const modelName in models) {
          if (models.hasOwnProperty(modelName)) {
              await models[modelName].sync({ alter: true });
              console.log(`Synced ${modelName} successfully.`);
          }
      }
      console.log('All models were synchronized successfully.');
  } catch (error) {
      console.error('Unable to sync the database:', error);
  }
}

async function connectToRedis() {
  try {

    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    console.log(`Connected to Redis @ port 🔑 ${process.env.REDISPORT}!
      📭  query @ http://localhost:${process.env.REDISPORT}! \n`);

  } catch (err) {
    console.error('Failed to connect to Redis', err);
    throw err;
  }
}
 

(async () => {

    try {

      connectToRedis();
      console.log('Connection has been established successfully.');
  //  await syncAllModels()    
   
      // if (process.env.NODE_ENV !== 'production') {
      //   await seedDatabase(); 
      // }

    // app.post('/api/send-new-account-login', (req, res) => {
    //     console.info('Get was used');
    //     console.log('This email will be contact: ' + req.body.email);
    //     const templateParams = {
    //       email: req.body.email,
    //     };
    //     console.log(process.env.EMAILJS_PUBLIC);

        // emailjs.send('service_7098943', 'template_5grsipc', templateParams, {
        //     publicKey: process.env.EMAILJS_PUBLIC,
        //     privateKey: process.env.EMAILJS_PRIVATE, // optional, highly recommended for security reasons
        //   }).then((response) => {
        //       console.log('SUCCESS!', response.status, response.text);
        //     },
        //     (err) => {
        //       console.log('FAILED...', err);
        //     },
        //   );
        // res.json({message: 'Everything went okay'});
    // });

    console.log("env" + process.env.NODE_ENV +"\n")

    // Health Check Endpoint
    app.get('/health', (req, res) => {
        // Custom health checks, e.g., database connections
        res.status(200).send('Healthy');
    });

    // Serve static assets in production
    if (process.env.NODE_ENV === 'production') {
        app.use(express.static(path.join(__dirname, '../client/dist')));
        
        app.get('*', (req, res) => {
          res.sendFile(path.join(__dirname, '../client/dist/index.html'));
        });
    }

    // Start the server
    app.listen(PORT, () => {
        console.log(`Express server running on port 🔑 ${PORT}!
        📭  query @ http://localhost:${PORT}/`);
      });     
    }

    catch (error) {
      console.error('Error during server startup:', error);
    }

})();
module.exports = redisClient;