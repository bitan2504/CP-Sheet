
# CP Sheet

CP Sheet is a small Express + EJS app for tracking competitive programming problems. It renders a home page and a sample sheet with problem links and tags.

## Features

- Server-rendered pages with EJS
- Simple routes for a home page and a sample sheet
- Static assets served from `public`

## Tech stack

- Node.js
- Express
- EJS

## Getting started

1. Install dependencies:

	```bash
	npm install
	```

2. Start the dev server:

	```bash
	npm run dev
	```

3. Open the app:

	- http://localhost:3000

## Environment variables

- `PORT` (optional): port for the server to listen on. Defaults to `3000`.

## Routes

- `/` renders the home page.
- `/sheet` renders a sample sheet with a list of problems and tags.

## Project structure

```
.
├── index.js
├── package.json
└── public/
	 └── views/
		  ├── index.ejs
		  └── sheet.ejs
```

## Scripts

- `npm run dev` starts the app with nodemon.
