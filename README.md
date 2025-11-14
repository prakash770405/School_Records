# demomongo

A multi-role Express and MongoDB application for managing a school database. This project features separate authentication and dashboards for **Admins** and **Students**, built with Passport.js for security and EJS for server-side rendering.

## Features

### Admin Features
- Secure signup (limited to 2 admins), login, and logout.
- Full **CRUD** (Create, Read, Update, Delete) capabilities for all student records.
- View a dashboard of all students with a responsive card-based UI.
- Create new student records.
- Edit any student's details, including their password.
- Delete student records, which also cleans up associated student login credentials.
- Delete their own admin account.

### Student Features
- Secure login to a personal dashboard.
- View their own detailed profile.
- Edit their personal information (email, phone, address) and update their password.

### Core Technical Features
- **Authentication & Authorization:** Robust role-based access control using Passport.js. Admins and students have separate, protected routes.
- **Session Management:** Uses `express-session` for persistent logins.
- **User Feedback:** Implements `connect-flash` to show success and error messages to the user after performing actions.
- **Server-Side Rendering:** Dynamically renders HTML with data from the database using EJS templates.

## Tech stack / Libraries / Frameworks

- Node.js (runtime)
- Express (web framework) — listed in `package.json`
- EJS (templating engine) — `ejs`
- Mongoose (MongoDB object modeling)
- Passport.js (`passport`, `passport-local`, `passport-local-mongoose`) for authentication
- Express Session (`express-session`) for session management
- Connect Flash (`connect-flash`) for flash messages
- method-override (to support PUT/DELETE from HTML forms) — `method-override`
- Bootstrap 5 (CSS framework) — included via CDN in EJS templates
- Font Awesome (icons) — included via CDN in EJS templates

Dependencies from package.json:

- ejs ^3.1.10
- express ^4.19.2
- method-override ^3.0.0
- mongoose ^8.1.9
- passport ^0.7.0
- passport-local ^1.0.0
- passport-local-mongoose ^8.0.0
- express-session ^1.18.0
- connect-flash ^0.1.1

## Project structure (important files)

- `index.js` - main server file, route definitions and DB connection
- `models/admin.js` - Mongoose schema for Admin users (using `passport-local-mongoose`).
- `models/student.js` - Mongoose schema for Student login credentials.
- `models/chat.js` - Mongoose schema for the main student record, linking to the student's password.
- `views/` - EJS templates
  - `index.ejs` - Admin dashboard (student list).
  - `studentdetail.ejs` - Student's personal dashboard.
  - `login.ejs` / `signup.ejs` - Admin authentication forms.
  - `studentloginform.ejs` - Student login form.
  - `newuser.ejs` / `edit.ejs` - Admin forms for creating/editing students.
  - `studentedit.ejs` - Student form for editing their own profile.
- `public/css/styles.css` - custom styles layered on Bootstrap
- `package.json` - project metadata and dependencies

## Data model

The application uses three interconnected Mongoose models:
1.  **Admin (`models/admin.js`)**: Stores admin `username` and hashed `password` via `passport-local-mongoose`.
2.  **Student (`models/student.js`)**: Stores a student's `name` and `passwords` for login.
3.  **Demo (`models/chat.js`)**: The main student record, containing personal details and a reference to the corresponding `Student` document for authentication.
    - `name` (String)
    - `stdclass` (Number)
    - `email` (String)
    - `phone` (Number)
    - `address` (String)
    - `passwords` (Array of ObjectId refs to 'Student' model)

## Routes

### Admin Routes
- `GET /` — Admin dashboard, lists all students.
- `GET /signup`, `POST /signup` — Admin registration.
- `GET /login`, `POST /login` — Admin login.
- `GET /logout` — Admin logout.
- `GET /del` — Delete the currently logged-in admin account.
- `GET /data/new`, `POST /new` — Create a new student.
- `GET /data/:id/edit`, `PUT /data/:id/edit` — Update a student's details.
- `DELETE /data/:id/delete` — Delete a student.

### Student Routes
- `GET /student`, `POST /student` — Student login.
- `GET /students/logout` — Student logout.
- `GET /student/:id` — View personal student dashboard.
- `GET /student/:id/edit`, `PUT /student/:id/edit` — Edit personal student profile.

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