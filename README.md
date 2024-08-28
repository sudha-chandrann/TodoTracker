TodoTracker

TodoTracker is a collaborative project management tool designed to help teams and individuals manage their tasks efficiently. With TodoTracker, teams can create projects, assign tasks, set deadlines, prioritize work, and communicate seamlessly. Users can also manage personal projects for individual use.

Features

Team Collaboration:<br/>
    ->Create and manage projects within a team.<br/>
    ->Only the team leader can assign tasks to team members.<br/>
    ->Set deadlines and prioritize tasks for better project management.<br/>
    ->Team members can comment and communicate on each task and subtask.<br/>
    
Task Management:
    ->Assigned users can create subtasks to break down their work.
    ->Add detailed descriptions to todos and subtodos.
    ->Commenting feature available for both todos and subtodos.
Personal Projects:
      ->Users can create personal projects to manage individual tasks outside of the team environment.


     
Installation

To install and run TodoTracker on your local machine, follow these steps:


Clone the repository:
bash
Copy code
git clone https://github.com/sudha-chandrann/TodoTracker.git
Navigate to the project directory:
bash
Copy code
cd todotracker
Create a .env file in the root directory and provide the following environment variables:
plaintext
Copy code
PORT=your_port_number
MONGODB_URI=your_mongodb_uri
CORS_ORIGIN=your_cors_origin
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=your_access_token_expiry_time
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=your_refresh_token_expiry_time
Install dependencies:
bash
Copy code
npm install
Start the development server:
bash
Copy code
npm start


Usage
Creating a Project: Team leaders can create projects and assign tasks to team members.
Managing Tasks: Once assigned, users can create subtasks, add descriptions, set priorities, and communicate via comments.
Personal Use: Users can manage their personal projects separately from team projects.
Technologies Used
Frontend: React.js, Tailwind CSS
Backend: Node.js, Express.js, MongoDB
Real-time Communication: Socket.IO
Authentication: JWT (JSON Web Token)



