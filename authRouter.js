const Router = require('express')
const controller = require('./authController')
const router = new Router()
const {check} = require("express-validator")

const endPoints = {
    me: '/me',
    login: '/login',
    logout: '/logout'
}

router.get(endPoints.me, controller.me)
router.post(endPoints.login, [check("name", "Name require").notEmpty()], controller.login)
router.delete(endPoints.logout, controller.logout)

module.exports = router