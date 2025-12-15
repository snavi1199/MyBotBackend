import express from "express";
import cors from "cors";
import chatRouter from "./chatRoute.js";

const app = express();

const allowedOrigins = [
    'https://my-bot-front.vercel.app', // production
    'http://localhost:3000'          // local
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests without an origin (mobile apps, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('CORS policy: Origin not allowed'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Global OPTIONS handler (prevents pathToRegexpError in Render)
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        if (allowedOrigins.includes(req.headers.origin)) {
            res.header('Access-Control-Allow-Origin', req.headers.origin);
        }
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return res.sendStatus(200);
    }
    next();
});

app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRouter);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

