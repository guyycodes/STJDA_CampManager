/**
 * Express router
 */
const express = require('express');
const router = express.Router();
const auth = require('./api/GoogleAuthentication_routes')
const newUser = require('./api/newuser_routes')
const redis = require('./api/cacheWithRedis')
const admin = require('./api/administrators')
// const dashboard = require('./api/dashboard_routes');
// const logout = require('./api/logout_routes')
const login = require('./api/login_routes')
// for ping
// const ping = require('./api/ping_route')
// router.use('/ping', ping)

// for the dashboard
// router.use('/dashboard', dashboard)
// for signing out
// router.use('/logout', logout)
// for loging in directly
router.use('/login', login)
// for authentication
router.use('/auth', auth)
router.use('/signup', newUser)
// for caching
router.use('/redis', redis)
router.use('/admin', admin)
router.use((req,res) =>{
    res.send("❗❗ We missed the router ❗❗")
})

module.exports = router;