const Pool = require('pg').Pool
const { uploadImgToCloudinary, uploadRawToCloudinary } = require('./upload.service')
const DatauriParser = require('datauri/parser')
const parser = new DatauriParser()
const { Base64 } = require('js-base64');
var fs = require('fs');

const bufferToDataURI = (fileFormat, buffer) => parser.format(fileFormat, buffer)

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'password', 
  port: 5432,
})

const uploadFile = async (req, res) => {
    try {
        const fileName = 'index.html'
        fs.writeFile(fileName, Base64.decode(req.body.data), function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
        const fileDetails = await uploadRawToCloudinary(fileName)
        
        res.json({
            status: true,
            message: 'Upload successful',
            data: {
                cdnUrl: fileDetails.url
            },
        })
    }
    catch (e) {
        console.log(e)
        res.status(500).json({
            status: false,
            message: e.message,
        })
    }
}

const uploadImage = async (req, res) => {
    try {
        const { file } = req
        if (!file) {
            res.status(500).json({
                status: false,
                message: 'Image is required'
            })
            return;
        }
    
        const fileFormat = file.mimetype.split('/')[1]
        const { base64 } = bufferToDataURI(fileFormat, file.buffer)
        const imageDetails = await uploadImgToCloudinary(base64, fileFormat)
    
        res.json({
          status: true,
          message: 'Upload successful',
          cdnUrl: imageDetails.url,
        })
      } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
      }
}

const getPayload = async (req, res) => {
    try {
        const postId = req.params.id;
        const query = `SELECT * from post_db where id = '${postId}'`;
        pool.query(query)
            .then(queryResult => {
                if (queryResult.rowCount > 0) {
                    return res.status(200).json({
                        status: true,
                        message: 'success',
                        data: queryResult.rows[0].payload
                    })
                } else {
                    return res.status(404).json({
                        status: true,
                        message: 'No data found',
                    })
                }
            })
    } catch(e) {
        console.log("ERROR: ", e)
        return res.status(400).json({
            status: false,
            message: e.message
        })
    }
}

const upsertPayload = async (req, res) => {
    try {
        const payload = req.body.payload;
        if (typeof payload != 'string') {
            return res.status(400).json({
                status: false,
                message: 'payload should be string'
            })
        }

        const postId = req.params.id;
        // const payload = JSON.stringify(req.body.payload)
        let query = `SELECT * from post_db where id = '${postId}'`;
        pool.query(query)
            .then(queryResult => {
                if (queryResult.rowCount > 0) {
                    query = `UPDATE post_db SET payload = '${payload}' WHERE id = '${postId}'`;
                    pool.query(query)
                        .then(queryResult => {
                            if (queryResult.rowCount > 0) {
                                return res.status(200).json({
                                    status: true,
                                    message: 'payload updated'
                                })
                            } else {
                                return res.status(400).json({
                                    status: false,
                                    message: e.message
                                })
                            }
                        })
                } else {
                    query = `INSERT INTO post_db (id, payload) values ('${postId}', '${payload}')`;
                    pool.query(query)
                        .then(queryResult => {
                            if (queryResult.rowCount > 0) {
                                return res.status(200).json({
                                    status: true,
                                    message: 'payload inserted'
                                })
                            } else {
                                return res.status(400).json({
                                    status: false,
                                    message: e.message
                                })
                            }
                        })
                }
            });

    }
    catch(e) {
        console.log("ERROR: ", e)
        return res.status(400).json({
            status: false,
            message: e.message
        })
    }
}

const saveEvent = async (req, res) => {
    try {
        const postId = req.params.id;
        const { data, eventName } = req.body;
        const query = `INSERT INTO events (id, event_name, payload) values ('${postId}', '${eventName}', '${data}')`;
        pool.query(query)
            .then(queryResult => {
                if (queryResult.rowCount > 0) {
                    return res.status(200).json({
                        status: true,
                        message: 'event saved'
                    })
                } else {
                    return res.status(400).json({
                        status: false,
                        message: "failed"
                    })
                }
            })
    } catch(e) {
        console.log("ERROR: ", e)
        return res.status(400).json({
            status: false,
            message: e.message
        })
    }
}

module.exports = {
    uploadFile,
    uploadImage,
    upsertPayload,
    getPayload,
    saveEvent
}

