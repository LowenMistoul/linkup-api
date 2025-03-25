const express = require("express");
const { Post,User } = require("../models");
const authenticateUser = require("../middleware/authMiddleware");
const { upload, uploadToBlob } = require("../utils/azureBlob");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: { model: User, attributes: ["id", "username"] }, // Include post owner's info
            order: [["createdAt", "DESC"]], // Sort by newest posts first
        });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 📌 Get a single Post by ID (Public)
router.get("/:id", async (req, res) => {
    try {
        const postId = req.params.id;

        const post = await Post.findByPk(postId, {
            include: { model: User, attributes: ["id", "username"] },
        });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// Protected route: Create a post
router.post("/", authenticateUser, upload.single("media"), async (req, res) => {
    try {
        let mediaUrl = null;

        if (req.file) {
            // Upload file to Azure Blob Storage
            mediaUrl = await uploadToBlob(req.file);
        }
        const { content} = req.body;

        if (!content || !mediaUrl) {
            return res.status(400).json({ message: "Content and media are required." });
        }

        const newPost = await Post.create({
            userId: req.user.id,
            content,
            mediaUrl
        });

        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.put("/:id", authenticateUser, upload.single("media"), async (req, res) => {
    try {
        const postId = req.params.id;
        const { content } = req.body;
        const userId = req.user.id; // Logged-in user's ID

        // Find the post
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if the logged-in user is the owner
        if (post.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized to update this post" });
        }

        let mediaUrl = post.mediaUrl; // Keep existing media if no new file is uploaded
        if (req.file) {
            mediaUrl = await uploadToBlob(req.file); // Upload new media
        }

        // Update the post
        await post.update({ content, mediaUrl });

        res.json({ message: "Post updated successfully", post });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.delete("/:id", authenticateUser, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id; // Logged-in user's ID

        // Find the post
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if the logged-in user is the owner
        if (post.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized to delete this post" });
        }

        // Delete the post
        await post.destroy();

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
