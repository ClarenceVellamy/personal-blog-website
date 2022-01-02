const multer = require('multer')

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'uploads') // file storage location
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + "-" + file.originalname) // rename filename by date now + original name
    }
})

const upload = multer({ storage: storage })

module.exports = upload