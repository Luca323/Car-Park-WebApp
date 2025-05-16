Before Running our project some key setup steps need to be done.
ParkEase is a parking management system that allows drivers to book parking spaces in advance, and enables administrators to approve/reject parking requests, manage car parks, monitor space occupancy, schedule events, and send notifications. The system supports real-time tracking of parking sessions.

How to Run:
1. Import the SQL file (Parkease database SQL.txt) into your MySQL server
2. Make sure you have Node.js installed on your device
3. Run the server using Node.js:
   node app.js
4. Navigate to http://localhost:8080 in your browser.

Please note: in order to make an admin account, first create an account then go into the database, find the logininfo table and edit the type from driver to admin.

Technologies Used:
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MySQL
- Email: Nodemailer

Driver Features:
- Create & Login to account
- Book parking spaces 
- View upcoming, current, pending, and past parking sessions
- Notify early departure to free up parking space
- Locate parking space via Google Maps

Admin Features:
- Manage car parks, spaces, users, and events
- Approve or reject booking requests
- Block and release spaces for events
- View live car park stats
- Send notifications to all users
