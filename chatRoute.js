import express from "express";
import fetch from "node-fetch";

const router = express.Router();
const OR_URL = "cc6b5848492dc65a26ceb4bd54c741b5ce5106db8624201a0f296fd571aaff0f"

router.get("/", (req, res) => {
    res.json({ message: "Chat API is running" });
});

router.post("/", async (req, res) => {
    const { prompt, role } = req.body;
    const authKey = `sk-or-v1-${OR_URL}`;

    if (!prompt || !authKey) {
        return res.status(400).json({ error: "Prompt & API key required" });
    }

    // 🔹 SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${authKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                stream: true,
                messages: [
                    { role: "system", content: role },
                    { role: "user", content: prompt },
                ],
            }),
        });

        // ❗ Node streams use `.on("data")`
        aiRes.body.on("data", (chunk) => {
            res.write(chunk.toString());
        });

        aiRes.body.on("end", () => {
            res.write("data: [DONE]\n\n");
            res.end();
        });

        aiRes.body.on("error", (err) => {
            console.error("Stream error:", err);
            res.end();
        });
    } catch (err) {
        console.error("Chat error:", err);
        res.write("data: ERROR\n\n");
        res.end();
    }
});

export default router;
