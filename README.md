# demomongo

A small Express + MongoDB demo app (server-rendered with EJS) for managing student records. This project demonstrates basic CRUD (Create, Read, Update, Delete) operations using Mongoose and a simple, responsive Bootstrap UI.

## Features

- List all students (index view) with a modern, responsive card UI
- Create a new student (new user form)
- Edit student details (edit form)
- Delete a student (delete action with confirmation)
- Server-side rendering using EJS templates
- Data persisted in MongoDB via Mongoose

## Tech stack / Libraries / Frameworks

- Node.js (runtime)
- Express (web framework) — listed in `package.json`
- EJS (templating engine) — `ejs`
- Mongoose (MongoDB object modeling) — `mongoose`
- method-override (to support PUT/DELETE from HTML forms) — `method-override`
- Bootstrap 5 (CSS framework) — included via CDN in EJS templates
- Font Awesome (icons) — included via CDN in EJS templates

Dependencies from package.json:

- ejs ^3.1.10
- express ^5.1.0
- method-override ^3.0.0
- mongoose ^8.19.0

## Project structure (important files)

- `index.js` - main server file, route definitions and DB connection
- `models/chat.js` - Mongoose schema/model for student records
- `views/` - EJS templates
  - `index.ejs` - student list (homepage)
  - `newuser.ejs` - create student form
  - `edit.ejs` - edit student form
- `public/css/styles.css` - custom styles layered on Bootstrap
- `package.json` - project metadata and dependencies

## Data model

The Mongoose model (in `models/chat.js`) uses the following schema:

- `name` (String)
- `stdclass` (Number)
- `email` (String)
- `phone` (Number)
- `address` (String)
- `dates` (Date, defaults to Date.now)

## Routes

- GET `/` — list all students (renders `index.ejs`)
- GET `/data/new` — render create form (`newuser.ejs`)
- POST `/new` — create a new student
- GET `/data/:id/edit` — render edit form for the student (`edit.ejs`)
- PUT `/data/:id/edit` — update student (method-override required)
- DELETE `/data/:id/delete` — delete student (method-override required)

> Note: Forms that perform PUT and DELETE use `method-override` with a query parameter of `_method` (see the forms in the EJS templates).

## Setup & run (Windows PowerShell)

1. Install dependencies:

```powershell
npm install
```

2. Ensure MongoDB is running locally and accessible at `mongodb://127.0.0.1:27017`.
   - If you have the `mongod` server binary available, start it (example):

```powershell
# Start mongod (if you use a custom db path):
mongod --dbpath "C:\path\to\your\mongodb\data"
# Or ensure the MongoDB service is running via services.msc
```

3. Start the app:

```powershell
# Start with node:
node index.js
# Or if you prefer nodemon (install globally or as a dev dependency):
nodemon index.js
```

4. Open your browser at: `http://localhost:8080/`

## Notes & troubleshooting

- If you see template render errors, ensure the EJS templates are present in the `views/` folder and the view engine is configured in `index.js`:
  ```js
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  ```

- If your forms for edit/delete are not working, confirm `method-override` middleware is configured:
  ```js
  app.use(methodOverride('_method'));
  ```

- If MongoDB connection fails, check the console for errors from Mongoose and verify the server is running and the connection URI matches.

## Potential improvements

- Add server-side validation and error handling for form submissions
- Add flash messages for success/error feedback
- Add pagination or searching for large data sets
- Add authentication (login) if you need per-user data
- Move Bootstrap/Font Awesome from CDN to local assets for offline use or stricter CSP

## License

This project uses the ISC license as indicated in `package.json`.