Before Running our project some key setup steps need to be done.

=============================================================================

1 - Import the SQL file into phpMyAdmin/MySQL into a schema called 'parkease'

2 - Enter test data into the 'parkease' schema using the SQL tab
  - NOTE: Due to the hashing algorithm used the login test data may not work. To create an admin account
          register a normal account and then open it in MySQL and change 'verified' to 1 and 'Type' to 'admin'
           - Repeat this on a different account and do not change 'Type' to create a driver account

  - NOTE: - Verification can also be done via email by clicking the link that is sent upon registration

3 - After setting up, use the command console to navigate to the directory containing this README file and
    type 'npm start'. Assuming the database is set up correctly, a message will send showing an SQL ID

4 - The project should now be ready for use. Passwords for test data can be found in the 'TEST DATA' folder.
    if an alert showing 'invalid login' is sent, please refer to the step 2 NOTES.
