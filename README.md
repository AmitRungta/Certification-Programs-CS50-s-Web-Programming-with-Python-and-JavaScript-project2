# Project 2

Web Programming with Python and JavaScript


--> Display Name: When the user visits the first time then he is shown a login page. In this login page we just show the user display name to show in the subsequent pages. When a user is logged in we save this user diaplay name in our localstorage so that next time when the page is opened in the browser the user is not required to login again. Once a user is logged in then in all the subsequent pages we show the option for logout the current user.


--> Channel Creation: Once the user is logged in then he has a option for channel creation. Here the user can add a new chanenl. When adding a channel we ask for channel name and it Genre. For showing the channels we use group them by Genre for appealing display. While adding the channel name we do basic varification like channel name should not be empty or not already added. Use can also manage channels even when in post page by selecting the option in the navigation bar. When the user logs in and if no channels are already added then we show him this dialog for channel addition first before posting new messages on any channel. 


--> Remembering the Channel: If a user is on a channel page, closes the web browser window, and goes back to web application, it remebers the last used channel name as its stored in the local storage and reloads the messages for that channel.


--> Channel List: After the user logs in we show him the list of all the channels available. As the channels are groupped with Genre we show them as a 'Accordion' groupped by Genre. In this when the user selects a Genre we show all the channels of this genre. By clicking on any channel user can see / send messages to the given channel.


--> Messages View: Once a channel is selected, the user should see any messages that have already been sent in that channel, up to a maximum of 100 messages. Your app should only store the 100 most recent messages per channel in server-side memory.
****************************************************


--> Sending Messages: Once in a channel, users should be able to send text messages to others the channel. When a user sends a message, their display name and the timestamp of the message should be associated with the message. All users in the channel should then see the new message (with display name and timestamp) appear on their channel page. Sending and receiving messages should NOT require reloading the page.
****************************************************


--> Personal Touch: Add at least one additional feature to your chat application of your choosing! Feel free to be creative, but if you’re looking for ideas, possibilities include: supporting deleting one’s own messages, supporting use attachments (file uploads) as messages, or supporting private messaging between two users.
****************************************************



In README.md, include a short writeup describing your project, what’s contained in each file, and (optionally) any other additional information the staff should know about your project. Also, include a description of your personal touch and what you chose to add to the project.
If you’ve added any Python packages that need to be installed in order to run your web application, be sure to add them to requirements.txt!