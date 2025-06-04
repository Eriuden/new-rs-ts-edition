
const router = require("express").Router()

const authController = require("../controllers/auth.controller")
const userController = require ("../controllers/user.controller")
const uploadController = require ("../controllers/upload.controller")

const multer = require("multer")
const upload = multer()


router.post("/register", authController.signUp)
router.post("/login", authController.signIn)
router.post("/resetPasswordLink", authController.resetPasswordLink)
router.get("/logout", authController.logout)
router.get("/forgotPasswordChecking/:id/:token", authController.ForgotPasswordChecking)
router.post("/updatePassword/:id/:token",authController.updatePassword)

router.get("/", userController.getAllUsers)
router.get("/:id", userController.getUser)

router.put("/:id", userController.updateUser)
router.delete(":/id",userController.deleteUser)
router.patch("/follow/:id", userController.follow)
router.patch("/unfollow/:id", userController.unFollow)


router.post("/upload", upload.single("file") , uploadController.uploadProfil)
module.exports = router