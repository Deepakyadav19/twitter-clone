const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const authenticate = require('../middlewares/authentication');

const { User, validateUser } = require('../models/user');

router.post('/signup', async (req, res) => {
    const { error, value } = validateUser(req.body);
    if(error) return res.status(400).send({
        success: false,
        error: error.details[0].message
    });

    let user = await User.findOne({ "email": value.email });
    if(user) return res.status(401).send({
        success: false,
        error: 'User with this email already registered'
    });

    user = await User.findOne({ "userhandle": value.userhandle });
    if(user) return res.status(401).send({
        success: false,
        error: 'User with this userhandle already registered'
    });

    user = new User(value);
    console.log(user);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(value.password, salt);

    user.password = hashedPassword;
    user = await user.save();

    const token = jwt.sign({ _id: user._id, userhandle: user.userhandle, name: user.name }, config.get('jwtPrivateKey'));

    res.send({
        success: true,
        payload: {
            _id: user._id,
            'x-auth-token': token
        },
        message: 'Signed Up Successfully! LoggedIn'
    });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if(!user) return res.status(401).send({
        success: false,
        error: 'Invalid email or password'
    });

    const isPassword = await bcrypt.compare(password, user.password);
    if(!isPassword) return res.status(401).send({
        success: false,
        error: 'Invalid email or password'
    });

    const token = jwt.sign({ _id: user._id, userhandle: user.userhandle, name: user.name }, config.get('jwtPrivateKey'));
    console.log(token);

    res.send({
        success: true,
        payload: {
            _id: user._id,
            'x-auth-token': token
        },
        message: 'Signed Up Successfully! LoggedIn'
    });
});

router.get('/profile', authenticate, async (req, res) => {
    const userhandle = req.query.userhandle;
    const user = await User.findOne({ userhandle }).select('-password');
    
    if(!user){
        res.status(400).send({
            success: false,
            payload: {
                user
            }
        });
    }

    console.log(user, 'Inside /api/user/profile');

    res.send({
        success: true,
        payload: {
            user
        }
    });
});

module.exports = router;