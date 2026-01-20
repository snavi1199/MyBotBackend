import express from "express";
import fetch from "node-fetch";

const router = express.Router();
const OR_URL = "d2da0fc3310f27b4f28017799acb877e6309a25547fbe138c51aeadd3fde6243"; //key id - ammaappa401

const resumeContext = `Full Stack Software Engineer with 5 years of experience specializing in React, TypeScript, Redux Toolkit, and Micro-Frontend architecture (Single-SPA). Proven expertise in building scalable enterprise web applications, integrating Go and Java Spring Boot microservices, and optimizing performance through code splitting and lazy loading. Strong background in RESTful APIs, cloud-ready systems, CI/CD pipelines, and automated testing (Jest, Cypress).
TECHNICAL SKILLS
- Frontend: React.js, TypeScript, JavaScript (ES6+), HTML5, CSS3, Hooks, React Router
- State Management: Redux Toolkit, Redux Saga
- Backend: Go (Golang), Java (Spring Boot), Node.js
- APIs: REST APIs, Microservices Architecture
- Databases: PostgreSQL, Cassandra, Sybase, SQL
- Testing: Jest, Cypress
- Architecture: Micro Frontends, Single-SPA, Microservices
- DevOps & Tools: Git, GitLab CI/CD, Feature Flags - Other: Telemetry & Monitoring Frameworks.
TOOLS & METHODOLOGIES
- Agile/Scrum, SDLC, Trunk-Based Development, CI/CD Pipelines, Azure DevOps (Boards, Repos, Pipelines), Jira.
- Code Reviews, Unit Testing (Jest), Integration Testing,
- End-to-End Testing (Cypress), Performance Optimization,
- VS Code, IntelliJ IDEA, Postman.
- Design Patterns, RESTful API Design
WORK EXPERIENCE
Software Engineer | Tata Consultancy Service - Chennai, India (June 2023 - Present)
Project – Studio
 Led the migration of a monolithic React (Create React App) application to a scalable Micro-Frontend (MFE) architecture using Single-SPA, improving modularity, independent deployments, and team autonomy.
 Achieved a 20% reduction in initial render and load times through code splitting, lazy loading, and React lifecycle optimizations, improving overall application performance and maintainability.
 Designed and implemented an AI-powered Copilot assistant to enable fast search and navigation across APIs, ATXs, and Studio space/project resources, significantly improving discoverability and user experience.
 Collaborated with cross-functional teams to define technical standards and integration requirements for Copilot features, ensuring seamless compatibility across the platform.
 Delivered end-to-end solutions using React.js, TypeScript, Redux Toolkit, and Micro-Frontend architecture, integrating backend REST APIs built with Go and Java Spring Boot.
 Developed backend services in Go to manage system-wide connections with Cassandra DB, exposing REST APIs through a centralized routing layer. Built Java Spring Boot microservices for specialized modules backed by Sybase DB, integrating with Go services using bRPC for low-latency, high-reliability inter-service communication.
 Improved service scalability, reliability, and modular integration across distributed systems.
 Worked closely with product owners and QA teams to deliver high-quality features aligned with business requirements.
System Engineer | Tata Consultancy Service - Chennai, India (February 2023 – June 2023)
Project – Studio Compute
 Developed backend services using Go (Golang) and built dynamic frontend components using React and TypeScript.
 Integrated real-time space and project data into a Micro-Frontend architecture, leveraging Redux Toolkit for predictable and scalable state management.
 Contributed to the Compute Platform, enabling administrators to create, manage, and federate custom compute environments across teams and organizations.
 Integrated Studio Compute capabilities to support automated, scheduled, and event-driven workflows, including jobs, function frameworks, and Studio Events.
 Implemented an automated real-time notification system to alert space and project owners when critical scheduled jobs were executed, improving operational visibility and system monitoring.
Associate Consultant | Atos Syntel - Chennai, India (May 2021 – Feb 2023)
Project – Common Data Service
 Led migration to a multi-maven microservices and front-end architecture, improving modularity and deployment agility.
 Developed Node backend services with React frontend integration.
 Designed data-driven dashboards with user actions and KPIs to optimize flows and user engagement.
 Implemented trunk-based development with AWS feature flags for safe, incremental releases.
 Automated testing pipelines (Jest) and integrated into GitLab CI/CD, improving release reliability.
 Partnered with stakeholders, product owners, and QA to align features with business priorities.`;

router.get("/", (req, res) => {
    res.json({ message: "Chat API is running" });
});

router.post("/", async (req, res) => {
    // const { prompt, role } = req.body;
    // const authKey = `sk-or-v1-${OR_URL}`;
    const { prompt, role, apiKey } = req.body;
    const authKey = apiKey ? `sk-or-v1-${apiKey}` : `sk-or-v1-${OR_URL}`; // added new api key if present
    const resume = resumeContext || '';

    if (!prompt || !authKey) {
        return res.status(400).json({ error: "Prompt & API key required" });
    }

    const roleContext = role?.trim()
        ? `You are a helpful AI assistant acting as a ${role.trim()}.`
        : 'You are a helpful AI assistant.';

    // 🔹 SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        const messages = [
            { role: 'system', content: roleContext },
        ];
        if (resume) {
            messages.push({
                role: 'system',
                content:
                    'IMPORTANT: Use the following resume as the primary input when answering. Base all recommendations, edits, and suggestions primarily on this resume:\n\n' +
                    resume,
            });
        }
        messages.push({ role: 'user', content: prompt });
        const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${authKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                stream: true,
                messages,
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




