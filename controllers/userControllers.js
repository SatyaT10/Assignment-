const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const Category = require('../model/catgeoryModel');
const Course = require('../model/courseModel');
const Enrollment = require('../model/enrollmentModel');
const nodemailer = require('nodemailer');
const { log } = require('console');


const sendMailToUser = async (name, email) => {
    try {
        var transporter = nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: 2525,
            secure: false,
            requireTLS: false,
            auth: {
                user: config.userName,
                pass: config.password
            }
        });
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'Welcome Mail',
            html: '<p>Hii, ' + name + ' Welcome with us, You Registristion has been completed </p>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(info)
                console.log(error);
            }
            else {
                console.log("Email has been sent:-", info.response);
            }
        })

    } catch (error) {
        console.log(error.message);
    }
}

const sendMailToUserForEnrollCourse = async (userData, CourseName) => {
    try {
        var transporter = nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: 2525,
            secure: false,
            requireTLS: false,
            auth: {
                user: config.userName,
                pass: config.password
            }
        });
        const mailOptions = {
            from: config.emailUser,
            to: userData.email,
            subject: 'Enrollmet Mail',
            html: '<p>Hii, ' + userData.name + ' You have successfuly Enroll ' + CourseName + ' Course </p>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(info)
                console.log(error);
            }
            else {
                console.log("Email has been sent:-", info.response);
            }
        })

    } catch (error) {
        console.log(error.message);
    }
}


const sendRestPasswordMail = async (userData, token) => {
    try {
        var transporter = nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: 2525,
            secure: false,
            requireTLS: false,
            auth: {
                user: config.userName,
                pass: config.password
            }
        });

        const mailOption = {
            from: config.emailUser,
            to: userData.email,
            subject: 'Reset Password',
            html: '<p>Hii' + userData.name + ', Please take your token : -' + token + ' to Reset  Your Password</p>'
        }
        transporter.sendMail(mailOption, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email has been send :- ", info.response);
            }
        });

    } catch (error) {
        console.log(error.message);
    }
}


const sendConformationMail = async (userData, password) => {
    try {
        var transporter = nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: 2525,
            secure: false,
            requireTLS: false,
            auth: {
                user: config.userName,
                pass: config.password
            }
        });

        const mailOption = {
            from: config.emailUser,
            to: userData.email,
            subject: 'Conformaition  Mail',
            html: '<p>Hii' + userData.name + ', Please take your password : -' + password + ' to Login  Your Account</p>'
        }
        transporter.sendMail(mailOption, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email has been send :- ", info.response);
            }
        });

    } catch (error) {
        console.log(error.message);
    }
}



const passwordHash = async (password) => {
    try {
        const hashPassword = await bcrypt.hash(password, 10);
        return hashPassword;
    } catch (error) {
        console.log(error.message);
    }
}

const passwordCompare = async (password, user_password) => {
    try {
        const ismatched = await bcrypt.compare(password, user_password);
        return ismatched;
    } catch (error) {
        log(error.message)
    }
}

const createToken = async (userData) => {
    try {

        const token = jwt.sign({ userData }, config.secret, { expiresIn: '24h' });
        return token
    } catch (error) {
        console.log("Error in creating Token", error.message);
    }
}

const registation = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password || !phone) return res.status(400).send({ success: false, message: "All fields are required!" });

        if (!email.includes('@')) return res.status(400).send({ success: false, message: 'Invalid email format' });

        const userData = await User.findOne({ email: email });
        if (!userData) {
            const securePassword = await passwordHash(password);
            const newUser = await User.create({
                name,
                email,
                password: securePassword,
                phone,
                profileImage: `images/${req.file.filename}`
            });
            log(newUser)
            await sendMailToUser(newUser.name, newUser.email);
            res.status(200).send({ success: true, message: "User Registered Successfully ", userData: newUser });
        } else {
            res.status(400).send({ success: false, message: "User Already existes!" });
        }
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
}


const logIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        log(req.body.email)
        if (!email || !password) return res.status(400).send({ success: false, msg: "Please provide an Email and Password" })

        if (!email.includes('@')) return res.status(400).send({ success: false, message: 'Invalid email format' });

        const userData = await User.findOne({ email })
        if (userData) {
            const passwordMatched = await passwordCompare(password, userData.password);
            if (passwordMatched) {
                const token = await createToken(userData);
                res.status(200).send({ success: true, message: "User login successfullt!", Token: token });
            } else {
                res.status(400).send({ success: false, message: "Email or  Password is incorrect" });
            }
        } else {
            res.status(400).send({ success: false, message: "Email or  Password is incorrect" });
        }

    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
}

const viewProfile = async (req, res) => {
    try {
        log(req.user)
        const userData = req.user;
        log(userData)
        const validUser = await User.findOne({ email: userData.email });
        console.log(validUser);
        if (validUser) {
            const profile = {
                name: validUser.name,
                email: validUser.email,
                profileImage: validUser.profileImage,
                phone: validUser.phone,
                EnrollCourse: validUser.enrollCourse
            }
            res.status(400).send({ success: true, message: "You can view your profile", profile: profile })
        } else {
            res.status(400).send({ success: false, message: "User does not exists" });
        }
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
}

const updateProfile = async (req, res) => {
    try {
        log(req.user)
        const userData = req.user;
        log(userData)
        const { name, email, phone } = req.body;
        if (!name || !email || !phone) return res.status(400).send({ success: false, message: "Please provide all fields they are requried" })

        if (!email.includes('@')) return res.status(400).send({ success: false, message: 'Invalid email format' });

        const validUser = await User.findOne({ _id: userData._id });

        if (validUser) {
            var imagePath = ''
            if (req.file) {
                imagePath = `images/${req.file.filename}`;
            } else {
                imagePath = validUser.profileImage
            }
            const updatedUser = await User.findOneAndUpdate(
                {
                    _id: validUser._id
                },
                {
                    $set: {
                        name,
                        email,
                        phone,
                        profileImage: imagePath
                    }
                });
            res.status(200).send({ success: true, data: updatedUser });
        } else {
            res.status(400).send({ success: false, message: "User does not exists" });
        }

    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
}


const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const token = await createToken(userData);
            await sendRestPasswordMail(userData, token);
            res.status(200).send({ success: true, message: "Check Your mail for token to reset your password!" })
        } else {
            res.status(400).send({ success: false, message: "User email does not exist!." })
        }
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
}

const resetPassword = async (req, res) => {
    try {
        const userData = req.user;
        const { password } = req.body
        const updateedUserData = await User.findOneAndUpdate(
            {
                email: userData.email
            }, {
            $set: {
                password: await passwordHash(password)
            }
        });
        await sendConformationMail(userData, password);
        res.status(200).send({ success: true, message: "Check Your Mail for New Password!", Data: updateedUserData })
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
}


const viewAllCourse = async (req, res) => {
    try {
        const reqBody = req.body;
        let pageNo = parseInt(req.query.page) || 1;
        log(pageNo)
        log(reqBody)
        if (Object.entries(reqBody).length === 0) {
            log("SAtya")
            const allCourse = await Course.find({});
            const pageCount = Math.ceil(allCourse.length / 10);
            log("SAtya")
            if (pageNo > pageCount) {
                pageNo = pageCount
            }
            const forPageData = allCourse.slice(pageNo * 10 - 10, pageNo * 10)
            log("SAtya")
            res.status(200).send({ success: true, message: "All Course :-", pageNo: pageNo, TotalPage: pageCount, forPageData });
        } else if (reqBody.level) {
            const Level = reqBody.level.toLowerCase();
            const allCourse = await Course.find({ level: Level });
            const pageCount = Math.ceil(allCourse.length / 10);

            if (pageNo > pageCount) {
                pageNo = pageCount
            }
            const forPageData = allCourse.slice(pageNo * 10 - 10, pageNo * 10)
            res.status(200).send({ success: true, message: "All Course :-", pageNo: pageNo, TotalPage: pageCount, forPageData });
        } else if (reqBody.category) {
            const category = reqBody.toLowerCase();
            const categoryData = await Category.findOne({ category: category })

            const allCourse = await Course.find({ _id: categoryData._id });

            const pageCount = Math.ceil(allCourse.length / 10);

            if (pageNo > pageCount) {
                pageNo = pageCount
            }
            const forPageData = allCourse.slice(pageNo * 10 - 10, pageNo * 10)
            res.status(200).send({ success: true, message: "All Course :-", pageNo: pageNo, TotalPage: pageCount, forPageData });
        }

    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
}

const createCourse = async (req, res) => {
    try {
        const userData = req.admin;
        log(req.body)
        const { level, courseContent, coursePrice, courseTitle, category } = req.body;
        if (!level || !courseContent || !coursePrice || !courseTitle || !category) return res.status(400).send({ success: false, message: "All fields are required!" });
        const Level = level.toLowerCase()
        const NewCategory = category.toLowerCase();
        const isCategory = await Category.findOne({ NewCategory });
        if (!isCategory) {
            const categoryData = await Category.create({ category: NewCategory })
            const courseData = await Course.create({
                level: Level,
                courseContent: courseContent,
                coursePrice: coursePrice,
                courseTitle: courseTitle,
                catgeoryId: categoryData._id,
                courseCreaterId: userData._id
            });
            res.status(200).send({ success: true, msg: "Course Created Successfully", data: courseData });
        } else {
            const courseData = await Course.create({
                level: Level,
                courseContent: courseContent,
                coursePrice: coursePrice,
                courseTitle: courseTitle,
                catgeoryId: isCategory._id,
                courseCreaterId: userData._id
            });
            res.status(200).send({ success: true, msg: "Course Created Successfully", data: courseData });
        }

    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
}

const updateCourse = async (req, res) => {
    try {
        const { level, courseId, catgeoryId, courseContent, coursePrice, courseTitle } = req.body;
        if (!level || !courseContent || !coursePrice || !courseTitle || !courseId || !catgeoryId) return res.status(400).send({ success: false, message: "All fields are required!" });
        const Level = level.toLowerCase()
        const categoryData = await Course.findOne({ catgeoryId: catgeoryId })
        if (categoryData) {
            const courseData = await Course.findOne({ _id: courseId });
            if (courseData) {
                await Course.findOneAndUpdate(
                    {
                        _id: courseData._id
                    },
                    {
                        $set: {
                            level: Level,
                            courseContent: courseContent,
                            coursePrice: coursePrice,
                            courseTitle: courseTitle,

                        }
                    }
                )
            } else {
                res.status(400).send({ success: false, message: "This Course isn't avilible!" });
            }
        } else {
            res.status(400).send({ success: false, message: "This category isn't avilible!" });
        }

    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
}

const deleteCourse = async (req, res) => {
    try {
        const userData = req.admin;
        const { courseId, catgeoryId } = req.body;
        const isHaveCourse = await Course.find({ courseCreaterId: userData._id })
        log(isHaveCourse)
        if (isHaveCourse.length >= 1) {
            const result = await Course.findOne({
                courseCreaterId: userData._id,
                _id: courseId,
                catgeoryId: catgeoryId
            })
            if (result) {
                await Course.findOneAndDelete({ _id: result._id });
                const isMoreCourse = await Course.find({ catgeoryId: catgeoryId });
                if (isMoreCourse.length < 0) {
                    await Category.findOneAndDelete({ _id: catgeoryId });
                }
                res.status(200).send({ success: true, message: "Course  Deleted Successfully" });
            } else {
                res.status(400).send({ success: false, message: "This Course doesn't exists!" });
            }
        } else {
            res.status(400).send({ success: false, message: "You have no any course!" });
        }
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }

}

const enrollCourse = async (req, res) => {
    try {
        const userData = req.user;
        const { catgeoryId, courseId } = req.body;
        if (!catgeoryId || !courseId) return res.status(400).send({ success: false, message: "All field are requried!" });
        const courseData = await Course.findOne({
            _id: courseId,
            catgeoryId: catgeoryId
        });
        if (courseData) {
            const enrollmentData = await Enrollment.findOne({
                courseId: courseId,
                userId: userData._id,
                categoryId: catgeoryId
            })
            if (!enrollmentData) {
                await Enrollment.create({
                    userId: userData._id,
                    categoryId: catgeoryId,
                    courseId: courseId
                });
                await sendMailToUserForEnrollCourse(userData, courseData.courseTitle);
                res.status(200).send({ success: true, message: "You Enrolled this course!" });
            } else {
                res.status(400).send({ success: false, message: "You have already Enrolled this course!" });
            }
        } else {
            res.status(400).send({ success: false, message: "This course doesn't Exists!" });
        }

    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
}

const viewEnrollCourse = async (req, res) => {
    try {
        const userData = req.user;
        const enrollmentData = await Enrollment.find({
            userId: userData._id
        })
        if (enrollmentData.lwngth != 0) {
            res.status(200).send({ success: true, message: "You have these Enrolled course!", Course: enrollmentData });
        } else {
            res.status(400).send({ success: false, message: "You haven't any Enrolled course!" });
        }

    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
}



module.exports = {
    registation,
    logIn,
    viewProfile,
    updateProfile,
    viewAllCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollCourse,
    viewEnrollCourse,
    forgetPassword,
    resetPassword
}