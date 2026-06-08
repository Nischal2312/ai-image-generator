// require('dotenv').config();

// const express = require('express');
// const cors = require('cors');

// const app = express();

// app.use(cors());
// app.use(express.json());

// console.log(process.env.HF_TOKEN);

// app.listen(3000, () => {
//     console.log('Server running on port 3000');
// });
const fetch = (...args) =>
    import('node-fetch').then(({default: fetch}) => fetch(...args));
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/generate", async (req, res) => {

    try {

        const { prompt, model, width, height } = req.body;

        const response = await fetch(
            `https://router.huggingface.co/hf-inference/models/${model}`,
            {
                method: "POST",

                headers: {
                    Authorization: `Bearer ${process.env.HF_TOKEN}`,
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    inputs: prompt,

                    parameters: {
                        width,
                        height,
                    },

                    options: {
                        wait_for_model: true,
                        use_cache: false,
                    },
                }),
            }
        );

        if (!response.ok) {

            const errorText = await response.text();

            return res.status(response.status).json({
                error: errorText,
            });
        }

        const imageBuffer = await response.arrayBuffer();

        res.set("Content-Type", "image/png");

        res.send(Buffer.from(imageBuffer));

    } catch (error) {

        console.log(error);

        res.status(500).json({
            error: "Server error",
        });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});