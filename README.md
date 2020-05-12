# Project 2

Web Programming with Python and JavaScript


--> Display Name: When the user visits the first time then he is shown a login page. In this login page we just show the user display name to show in the subsequent pages. WE are using the LOginManger to use the session wise login of the user. Once a user is logged in then in all the subsequent pages we show the option for logout the current user.


--> Channel Creation: Once the user is logged in then he has a option for channel creation. Here the user can add a new channel. When adding a channel we ask for channel name and it Genre. For showing the channels we use group them by Genre for appealing display. While adding the channel name we do basic varification like channel name should not be empty or not already added. Use can also manage channels even when in post page by selecting the option in the navigation bar. When the user logs in and if no channels are already added then we show him this dialog for channel addition first before posting new messages on any channel. 


--> Remembering the Channel: If a user is on a channel page, closes the web browser window, and goes back to web application, it remebers the last used channel name as its stored in the local storage and reloads the messages for that channel.
****************************************************


--> Channel List: After the user logs in we show him the list of all the channels available. As the channels are groupped with Genre we show them as a 'Accordion' groupped by Genre. In this when the user selects a Genre we show all the channels of this genre. By clicking on any channel user can see / send messages to the given channel.


--> Messages View: Once a channel is selected we fetch the latest messgaes for this channel. Messages are fetched using the socket.io emit operation and we get the post list as its reponse. We just send 5 posts at a time. If the user scrols down to the bottom (i.e. showing the last post) then we fetch the previous 5 posts of it if available. Alsi in here i have shown the self user and the other user messages in different format so as to distinguish between self send message and the message from another user. Also the messaged which are send by this user have an option to delete them also. The messages are being stored in the server per channel based and when the messages count surpases a given threahold ( 100 in our current case ) we delete the oldest message to accomodate for the new one. once this message is deleted we notify all the users also logged into this channel for deleting the message. In there i have also used the logic for join_room and leave_room for broadcasting the messages to those users only who are logged to the current room for which messages are modified.


--> Sending Messages: Once in a channel, users is able to post new messages for this channel. This new message is emited to the server using the socket.io and server informs all the logged users with this chnanels for the new message. As we are using socket.io hence its not required by us to reload the whole page and i am adding the new post using javascript.


--> Personal Touch: For personal touch i have added the following options.
    -> Displaying the message of the self user and the other users in different format.
    -> Allowing to delete the messages send by the current user and the logged user cannot delete messages of other users.
    -> when fetching posts from the server just fetching few post at a time. When we reach to the oldest post in the display ( i.e. at the bottom ) then ask for the older posts than the given one. Using this mechanism i am able to reduce the data transfer between server and client by fetching few posts only at the time of loading.
