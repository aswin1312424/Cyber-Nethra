const User = require('../models/User');

exports.signup = async (req, res) => {
  try {
    const { fullName, email, password, role, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const newUser = new User({ fullName, email, password, role, phone });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
      res.status(200).json({
        message: "Login Successful",
        user: { fullName: user.fullName, role: user.role, email: user.email, phone: user.phone }
      });
    } else {
      res.status(401).json({ error: "Invalid credentials." });
    }
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { email, phone } = req.body;
    await User.findOneAndUpdate({ email }, { phone });
    res.json({ message: "Profile Updated" });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
};