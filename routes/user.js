const express = require("express");
const { User,Post } = require("../models");
const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

// 📌 Get User Profile (with Posts if Public)
router.get("/profile", async (req, res) => {
    try {
        const { username } = req.params;

        // Find the user by username
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// 📌 Get User Profile (with Posts if Public)
router.get("/:username", async (req, res) => {
    try {
        const { username } = req.params;

        // Find the user by username
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if profile is private
        if (user.private) {
            return res.json({
                username: user.username,
                message: "This profile is private.",
            });
        }

        // Fetch user's posts (if profile is public)
        const posts = await Post.findAll({
            where: { userId: user.id },
            order: [["createdAt", "DESC"]],
        });

        res.json({
            username: user.username,
            posts: posts,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 📌 Update Private Attribute (User Profile Privacy)
router.put("/privacy", authenticateUser, async (req, res) => {
    try {
        const { private } = req.body; // Expecting a boolean value (true/false)
        const userId = req.user.id; // Extract user ID from authentication middleware

        // Find user
        const user = await User.findByPk(userId);

        // Update privacy setting
        user.private = private;
        await user.save();

        res.json({ message: "Privacy setting updated successfully", private: user.private });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.delete("/:id", authenticateUser, async (req, res) => {
    try {
        //const postId = req.params.id;
        const userId = req.user.id; // Logged-in user's ID

        // Find the post
        const user = await Post.findByPk(userIdId);

        // Check if the logged-in user is the actual user - redondant
        if (user.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized to delete this post" });
        }

        // Delete the post
        await user.destroy();

        res.json({ message: "user deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


module.exports = router;
