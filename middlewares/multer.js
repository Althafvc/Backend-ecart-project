const multer = require('multer')

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    // console.log("Files from multer",file)
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage })

module.exports = upload

