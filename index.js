const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const { upload } = require('./upload.service')
require("dotenv").config();

const routes = require('./routes')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req,res,next) => {
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Headers','Origin, X-Requested-with, Content-Type, Accept, Authorization');
  if(req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET');
      return res.status(200).json({});
  }
  next();
})

app.get('/api/payload/:id', routes.getPayload)
app.post('/api/upload-html', routes.uploadFile)
app.post('/api/upload-image', upload, routes.uploadImage)
app.post('/api/payload/:id', routes.upsertPayload)
app.post('/api/event/:id', routes.saveEvent)


app.listen(process.env.PORT || 3000, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});