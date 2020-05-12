import os
import time
from datetime import datetime

import jsons
import requests

from flask import Flask, redirect, render_template, request, url_for 
from flask_login import (LoginManager, current_user, login_required,
                         login_user, logout_user)
from flask_socketio import SocketIO, emit, join_room, leave_room, send
from datastruct import Channeldata , PostData , get_user ,User


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")


# Initialize login manager
login = LoginManager(app)
login.init_app(app)

socketio = SocketIO(app)

# AmitTempCode
MAX_ALLOWED_POST_PER_CHANNEL = 100
MAX_POST_TO_SEND_PER_REUEST = 5



# --------------------------------------------------------
# list of posts.
listOfPostData ={}

# --------------------------------------------------------
# list of some predefined channels channels.
listOfChannels =[ Channeldata( 'Computers' , 'Education') , \
                    Channeldata( 'Economics' , 'Education') ,\
                    Channeldata( 'History' , 'Education') ,\
                    Channeldata( 'Cricket' , 'Sports') ,\
                    Channeldata( 'Football' , 'Sports') ,\
                    Channeldata( 'Rugby' , 'Sports') ,\
                    Channeldata( 'Hockey' , 'Sports') ,\
                    Channeldata( 'Movies' , 'Entertainment') ,\
                    Channeldata( 'TV Series' , 'Entertainment') ,\
                    Channeldata( 'Music' , 'Entertainment') ,\
                        ]







# --------------------------------------------------------
#
@login.user_loader
def load_user(username):
    return get_user(username) 



# --------------------------------------------------------
#
@app.route("/")
@app.route("/login", methods=['GET', 'POST'])
def index():
    """ Default page to retun login data """
    if current_user.is_authenticated:
        return redirect(url_for('AddChannel'))

    if request.method == 'POST':
        username = request.form.get('inputUserName')
        user = get_user(username)

        if user :
            login_user(user)
            return redirect(url_for('AddChannel'))

    return render_template("index.html")



# --------------------------------------------------------
#
@app.route("/logout")
# @login_required
def logout():

    # Logout user
    logout_user()
    return redirect(url_for('index'))



# --------------------------------------------------------
#
@app.errorhandler(404)
def page_not_found(e):
    # note that we set the 404 status explicitly
    return render_template('404.html'), 404



# --------------------------------------------------------
#
@app.route("/GetChannelList", methods = ['POST'])
def GetChannelList():
    return jsons.dump ({"success": True , "data": listOfChannels})



# --------------------------------------------------------
#
@app.route("/AddChannel")
@login_required
def AddChannel():

    # if the user have come here directly then move back to index page.
    return render_template("addchannel.html")



# --------------------------------------------------------
#
@socketio.on('add_channel' )
def handle_add_channel_event(data):
    """Broadcast messages"""

    ChannelName = data['ChannelName']
    ChannelGenre = data['ChannelGenre']

    if ((None == ChannelName) or (not(ChannelName and ChannelName.strip()))):
        return jsons.dump({"success": False, "reason": "Channel name is empty"})
    if ((None == ChannelGenre) or (not(ChannelGenre and ChannelGenre.strip()))):
        return jsons.dump({"success": False, "reason": "Channel genere is empty"})

    ChannelName = ChannelName.strip()
    ChannelGenre = ChannelGenre.strip()

    AlreadyPresent = any ( x for x in listOfChannels if x.ChannelName.lower() == ChannelName.lower())
    if True == AlreadyPresent :
        return jsons.dump({"success": False , "reason": "Channel with given name already present"}) 

    # here i am trying to maintain the case for the genre if already added with same.
    ExistingGenre = next ( ( x.ChannelGenre for x in listOfChannels if x.ChannelGenre.lower() == ChannelGenre.lower() ) , None )
    if ( ExistingGenre ) :
        ChannelGenre = ExistingGenre
    listOfChannels.append ( Channeldata(ChannelName,ChannelGenre))

    outputjason = jsons.dump ({"success": True , "data": listOfChannels})
    emit("Channel_List_Updated", outputjason , broadcast=True )
    return jsons.dump({"success": True }) 



# --------------------------------------------------------
#
@app.route("/ShowChannel/<channel_name>", methods = ['GET', 'POST'])
@login_required
def ShowChannel(channel_name=""):

    channel_name = channel_name.strip()
    # if the user have come here directly then move back to index page.
    return render_template("showchannel.html", username=current_user.username, channelname=channel_name)



# --------------------------------------------------------
#
@socketio.on('get_channel_post')
def handle_get_channel_post_event(data):
    """get the list of post for this channel"""

    userName = data['username']
    channelName = data['channelname']
    LastPostID = data.get('LastPostID',-1)

    if ( None == listOfPostData.get (channelName.lower()) ):
        listOfPostData[channelName.lower()] = []
    ChannelPostList = listOfPostData[channelName.lower()]
    
    startindex = 0
    if ( LastPostID > 0 ):
        ExistingMsgIndex = next ( ( i for i, msg in enumerate ( ChannelPostList ) if msg.PostID == LastPostID ) , -1 )
        if ( ExistingMsgIndex >= 0 ) :
            startindex = ExistingMsgIndex + 1       # Get the next post data 

    # Get the last index
    endindex = startindex + MAX_POST_TO_SEND_PER_REUEST 
    PostAdded = ChannelPostList[startindex:endindex]

    #  now lets broadcast this new post to all the recipients.
    return jsons.dump ({"success": True , "userName":userName , "channelName":channelName, "PostAdded": PostAdded })



# --------------------------------------------------------
#
@socketio.on('join_channel')
def handle_join_channel_event(data):
    """User joins a channel"""

    channel = data["channel"]
    join_room(channel.lower())



# --------------------------------------------------------
#
@socketio.on('leave_channel')
def handle_leave_channel_event(data):
    """User leaves a channel"""

    channel = data['channel']
    leave_room(channel.lower())



# --------------------------------------------------------
#
@socketio.on('send_message' )
def handle_send_message_event(data):
    """Broadcast messages"""

    userName = data['username']
    channelName = data['channelname']
    channelPost = data['PostString']

    if ( None == listOfPostData.get (channelName.lower()) ):
        listOfPostData[channelName.lower()] = []

    NewPostData = PostData ( userName , datetime.utcnow() , channelPost )
    PostAdded = listOfPostData[channelName.lower()] 
    PostAdded.insert(0,NewPostData)

    postDeleted = []
    while ( len ( PostAdded ) > MAX_ALLOWED_POST_PER_CHANNEL ):
        postDeleted.append ( PostAdded[len ( PostAdded )-1].PostID )
        PostAdded.pop()

    PostAdded = []
    PostAdded.append(NewPostData)

    #  now lets broadcast this new post to all the recipients.
    emit("PostList_Updated", jsons.dump ({"success": True , "PostAdded": PostAdded , "PostDeleted" : postDeleted }), broadcast=True  , room=channelName.lower()  )
    return jsons.dump({"success": True })





# --------------------------------------------------------
#
@socketio.on('delete_message' )
def handle_delete_message_event(data):
    """Broadcast messages"""

    userName = data['username']
    channelName = data['channel']
    PostToDeleted = data['PostDeleted']

    ChannelPostList = listOfPostData[channelName.lower()]

    # Now lets try to get the message   
    ExistingMsgIndex = next ( ( i for i, msg in enumerate ( ChannelPostList ) if msg.PostID == PostToDeleted ) , -1 )
    if ( ExistingMsgIndex < 0  ):
        return # this should not happen

    ExistingMsg = ChannelPostList[ExistingMsgIndex]
    if ( userName.lower() != ExistingMsg.UserName.lower() ):
        return # this should not happen

    ChannelPostList.pop (ExistingMsgIndex)
    postDeleted = []
    postDeleted.append (PostToDeleted)

    #  now lets broadcast this new post to all the recipients.
    emit("PostList_Updated", jsons.dump ({"success": True , "PostDeleted" : postDeleted }), broadcast=True  , room=channelName.lower()  )
    return jsons.dump({"success": True })










if __name__ == '__main__':
    socketio.run(app , debug=True)
