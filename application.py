import os
import requests
import time
import jsons

from flask import Flask, jsonify, render_template, request , redirect , url_for
from flask_socketio import SocketIO, emit
from datetime import datetime

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


class UserData:
    """class to save user name and his registered channels. """
    def __init__(self, DisplayName):
        self.DisplayName = DisplayName
        self.ChannelList = []

    def RegisterChannel(self, ChhanelName):
        if ( ( None == ChhanelName ) or (not(ChhanelName and ChhanelName.strip())) ) :
            return "Channel name is not valid"
        
        if ( ChhanelName in self.ChannelList ):
            return "Already registered with this channel"

        self.ChannelList.append (ChhanelName)

        return True


class PostData:       
    """class to store individual post data. """
    LastPostID = 0 
    def __init__(self, UserName , PostDate , PostString):
        self.UserName = UserName
        self.PostDate = PostDate
        self.PostString = PostString
        self.PostID = PostData.LastPostID + 1
        PostData.LastPostID += 1


class Channeldata:       
    """class to store individual channel data. """
    def __init__(self, ChannelName , ChannelGenre):
        self.ChannelName = ChannelName
        self.ChannelGenre = ChannelGenre


# list of posts.
listOfPostData ={}

# list of channels.
listOfChannels =[]


@app.route("/")
def index():
    """ Default page to retun login data """
    return render_template("index.html")



@app.route("/GetChannelList", methods = ['POST'])
def GetChannelList():
    return jsons.dump ({"success": True , "data": listOfChannels})


@app.route("/AddChannel", methods = ['GET', 'POST'])
def AddChannel():

    if request.method == 'GET':
        # if the user have come here directly then move back to index page.
        return render_template("addchannel.html")

    channelName = request.form.get('ChannelName' , "")
    channelGenre = request.form.get('ChannelGenre' , "")

    if ( ( None == channelName ) or (not(channelName and channelName.strip())) ) :
        return jsonify({"success": False , "reason": "Channel name is empty"})
    if ( ( None == channelGenre ) or (not(channelGenre and channelGenre.strip())) ) :
        return jsonify({"success": False , "reason": "Channel genere is empty"})

    channelName = channelName.strip()
    channelGenre = channelGenre.strip()

    AlreadyPresent = any ( x for x in listOfChannels if x.ChannelName.lower() == channelName.lower())
    if True == AlreadyPresent :
        return jsonify({"success": False , "reason": "Channel with given name already present"})

    # here i am trying to maintain the case for the genre if already added with same.
    ExistingGenre = next ( ( x.ChannelGenre for x in listOfChannels if x.ChannelGenre.lower() == channelGenre.lower() ) , None )
    if ( ExistingGenre ) :
        channelGenre = ExistingGenre
    listOfChannels.append ( Channeldata(channelName,channelGenre))

    emit("Channel_List_Updated", jsons.dump ({"success": True , "data": listOfChannels}), broadcast=True , namespace='/ChannelList' )
    return jsonify({"success": True })




@app.route("/ShowChannel", methods = ['GET', 'POST'])
def ShowChannel():

    if request.method == 'GET':
        # if the user have come here directly then move back to index page.
        return render_template("showchannel.html")

    channelName = request.form.get('ChannelName' , "")
    if ( ( None == channelName ) or (not(channelName and channelName.strip())) ) :
        return jsonify({"success": False , "reason": "Channel name is empty"})
    channelName = channelName.strip()
    AlreadyPresent = any ( x for x in listOfChannels if x.ChannelName.lower() == channelName.lower())
    if False == AlreadyPresent :
        return jsonify({"success": False , "reason": "Channel with given name is not present"})

    postlist = listOfPostData.get (channelName.lower() , [] )
    jasonstring = jsons.dump ({"success": True , "data": postlist})
    return jasonstring





@app.route("/AddPost", methods = ['POST'])
def AddPost():
    userName = request.form.get('UserName' , "")
    if ( ( None == userName ) or (not(userName and userName.strip())) ) :
        return jsonify({"success": False , "reason": "user name is empty"})
    userName = userName.strip()

    channelName = request.form.get('ChannelName' , "")
    if ( ( None == channelName ) or (not(channelName and channelName.strip())) ) :
        return jsonify({"success": False , "reason": "channel name is empty"})
    channelName = channelName.strip()

    channelPost = request.form.get('PostString' , "")
    if ( ( None == channelPost ) or (not(channelPost and channelPost.strip())) ) :
        return jsonify({"success": False , "reason": "post is empty"})
    channelPost = channelPost.strip()

    if ( None == listOfPostData.get (channelName.lower()) ):
        listOfPostData[channelName.lower()] = []

    NewPostData = PostData ( userName , datetime.utcnow() , channelPost ) 
    listOfPostData[channelName.lower()].append(NewPostData)

    #  now lets broadcast this new post to all the recipients.
    emit("PostList_Updated", jsons.dump ({"success": True , "NewPost": NewPostData }), broadcast=True , namespace='/ChannelList' )

    return jsonify({"success": True })



