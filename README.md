# Team Task Manager

A full-stack, role-based task management dashboard designed to help teams organize projects, assign tasks, and track progress seamlessly. Built with the MERN stack and secured with JWT authentication.


## Key Features

**Secure Authentication & Authorization**
* User registration and login.
* Password hashing using `bcrypt`.
* Protected API routes using JSON Web Tokens (JWT).
* Strict input validation using `Zod` to prevent malformed requests.

**Role-Based Access Control (RBAC)**
* **Admin:** Full authority to create projects, assign members, generate tasks, and view global team statistics (total, overdue, and completed tasks).
* **Member:** Focused workspace to view assigned projects, track personal tasks, and update task statuses (To Do -> In Progress -> Done).

**Project & Team Management**
* Create and edit projects with descriptions.
* Assign specific users to projects to maintain data privacy between teams.

**Task Tracking**
* Create tasks with titles, descriptions, and strict due dates.
* Assign tasks to specific project members.
* Real-time status tracking with visual color-coded badges.
* Automatic overdue detection for missed deadlines.

**Modern UI/UX**
* Fully responsive, card-based interface.
* Custom CSS implementation featuring layered shadows, frictionless form inputs, and an elevated deep-indigo aesthetic.


## Tech Stack

* **Frontend:** React.js (Vite), Axios, React Router Dom, Custom CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas, Mongoose (ODM)
* **Security & Validation:** JWT, bcrypt, Zod


## Future Enhancements
* Component refactoring for higher modularity.
* Integration of a global state manager (Redux/Zustand).
* Email notifications for overdue tasks.
