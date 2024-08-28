<h1>TodoTracker<h1>

TodoTracker is a collaborative project management tool designed to help teams and individuals manage their tasks efficiently. With TodoTracker, teams can create projects, assign tasks, set deadlines, prioritize work, and communicate seamlessly. Users can also manage personal projects for individual use.

<h3>Features</h3></br>

<h4>Team Collaboration:</h4></br>
    ->Create and manage projects within a team.</br>
    ->Only the team leader can assign tasks to team members.</br>
    ->Set deadlines and prioritize tasks for better project management.</br>
    ->Team members can comment and communicate on each task and subtask.</br>
    
<h4>Task Management:</h4></br>
    ->Assigned users can create subtasks to break down their work.</br>
    ->Add detailed descriptions to todos and subtodos.</br>
    ->Commenting feature available for both todos and subtodos.</br>
<h4>Personal Projects:</h4></br>
      ->Users can create personal projects to manage individual tasks outside of the team environment.</br>


     
Installation</br>

To install and run TodoTracker on your local machine, follow these steps:</br>


Clone the repository:</br>
bash</br>
Copy code</br>
git clone https://github.com/sudha-chandrann/TodoTracker.git</br>
Navigate to the project directory:</br>
bash</br>
Copy code</br>
cd todotracker</br>
Create a .env file in the root directory and provide the following environment variables:</br>
plaintext</br>
Copy code</br>
PORT=your_port_number</br>
MONGODB_URI=your_mongodb_uri</br>
CORS_ORIGIN=your_cors_origin</br>
ACCESS_TOKEN_SECRET=your_access_token_secret</br>
ACCESS_TOKEN_EXPIRY=your_access_token_expiry_time</br>
REFRESH_TOKEN_SECRET=your_refresh_token_secret</br>
REFRESH_TOKEN_EXPIRY=your_refresh_token_expiry_time</br>
Install dependencies:</br>
bash</br>
Copy code</br>
npm install</br>
Start the development server:</br>
bash</br>
Copy code</br>
npm start</br>


<h3>Usage</h3></br>
Creating a Project: Team leaders can create projects and assign tasks to team members.</br>
Managing Tasks: Once assigned, users can create subtasks, add descriptions, set priorities, and communicate via comments.</br>
Personal Use: Users can manage their personal projects separately from team projects.</br>





<h3>Technologies Used</h3></br>
Frontend: React.js, Tailwind CSS</br>
Backend: Node.js, Express.js, MongoDB</br>
Real-time Communication: Socket.IO</br>
Authentication: JWT (JSON Web Token)</br>