const express = require('express');
const User = require('./models');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword // Assume hashedPassword is defined elsewhere
        });

        res.json({
            id: newUser._id,
            name: newUser.name,
            email: newUser.email
        })
    }
    catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json({ msg: 'User deleted', user });
    }
    catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
