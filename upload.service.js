const multer = require("multer");
const cloudinary = require("cloudinary");

cloudinary.config({
    cloud_name: 'dcsuasrhl',
    api_key: '919567416957564',
    api_secret: 'GiK66euGfsh0CfKdv3AiwCdv_wo',
});

const storage = multer.memoryStorage();
  
const upload = multer({storage: storage}).single('image');

const uploadImgToCloudinary = async (fileString, format) => {
    try {
      const { uploader } = cloudinary;
  
      const res = await uploader.upload(
        `data:image/${format};base64,${fileString}`
      );
      return res;
    } catch (error) {
      console.log("ERROR", error)
    }
};

const uploadRawToCloudinary = async (fileName) => {
    try {    
      const res = await cloudinary.v2.uploader.upload(fileName,
        {resource_type: "raw"}
      );
      return res;
    } catch (error) {
      console.log("ERROR", error)
    }
};

module.exports = {
    upload,
    uploadImgToCloudinary,
    uploadRawToCloudinary
};