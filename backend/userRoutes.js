const express = require('express');
const User = require('./models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('./auth');
const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({ msg: 'User does not exist' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch)
            return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user._id},
            process.env.JWT_SECRET,
            { expiresIn: 3600 }
        )

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });
    }
    catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.post('/signup', async (req, res) => {
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

router.put("/:id", auth, async (req, res) => {
  if (req.user !== req.params.id)
    return res.status(403).json({ message: "Unauthorized" });

  const { name, email } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { name, email },
    { new: true, runValidators: true }
  ).select("-password");

  res.json(updatedUser);
});


router.get("/home", auth, async (req, res) => {
    res.json({ message: `Welcome User ${req.user}` });
});


module.exports = router;
