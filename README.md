# AI Image Generator

A full-stack AI Image Generator built using JavaScript, Node.js, Express, and the Hugging Face API.

Users can enter prompts to generate AI images with different aspect ratios and download the generated results.

---

## Features

* Generate AI images from text prompts
* Choose different aspect ratios
* Dark/Light mode UI
* Download generated images
* Secure API handling using `.env`

---

## Tech Stack

* HTML
* CSS
* JavaScript
* Node.js
* Express.js
* Hugging Face API

---

## Folder Structure

```bash
ImageGen/
│
├── frontend/
├── backend/
└── .gitignore
```

---

## Installation

### Clone the repository

```bash
git clone https://github.com/Nischal2312/ai-image-generator.git
```

### Install backend dependencies

```bash
cd backend
npm install
```

### Create `.env`

Inside the backend folder:

```env
HF_TOKEN=your_huggingface_token
```

---

## Run the Project

### Start backend

```bash
node server.js
```

### Start frontend

Open `frontend/index.html` using Live Server.

---

## Author

Nischal S 
