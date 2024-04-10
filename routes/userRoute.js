const express = require('express');
const userRoutes = express();
const multer = require('multer');
const userControllers = require('../controllers/userControllers');
const path = require('path')
const auth = require('../middleware/auth');


userRoutes.use(express.json());
userRoutes.use(express.urlencoded({ extended: true }));

userRoutes.use(express.static('public'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../public/userImage"));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});
const upload = multer({ storage: storage })

userRoutes.post('/register', upload.single('image'), userControllers.registation);

userRoutes.post('/login', userControllers.logIn);

userRoutes.get('/profile', auth.veryfieToken, userControllers.viewProfile);

userRoutes.post('/update-profile', auth.veryfieToken, upload.single('image'), userControllers.updateProfile);

userRoutes.post('/forgot-password', userControllers.forgetPassword);

userRoutes.post('/reset-password', auth.veryfieToken, userControllers.resetPassword);

userRoutes.get('/view-all-course', auth.veryfieToken, userControllers.viewAllCourse);

userRoutes.post('/create-course', auth.isAdmin, userControllers.createCourse);

userRoutes.post('/update-course', auth.isAdmin, userControllers.updateCourse);

userRoutes.post('/delete-course', auth.isAdmin, userControllers.deleteCourse);

userRoutes.post('/enroll-course', auth.veryfieToken, userControllers.enrollCourse);

userRoutes.get('/view-enroll-course', auth.veryfieToken, userControllers.viewEnrollCourse);


userRoutes.get('*', function (err, req, res, next) {
    new Error('OOps, Page Not Found');
    next(err)
})

userRoutes.use(function (err, req, res, next) {
    res.status(500).send({ message: err })
})

module.exports = userRoutes;