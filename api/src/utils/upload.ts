import multer from "multer"
import fs from "fs"
import path from "path"
import logger from "./logger"

const FILE_UPLOAD_DIR = String(process.env.FILE_UPLOAD_DIR)

const storage = multer.diskStorage({
  destination: (_, __, callback) => {
    fs.mkdirSync(FILE_UPLOAD_DIR, { recursive: true })
    callback(null, FILE_UPLOAD_DIR)
  },
  filename: (req, file, cb) => {
    logger.debug(`UPLOAD => Uploading file...`)
    let name = file.originalname
    let ext = path.extname(name)
    cb(null, Date.now() + ext)
  },
})

const uploadPicture = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return callback(new Error("Only images are allowed"))
    }
    callback(null, true)
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
}).single("picture")

export default uploadPicture
