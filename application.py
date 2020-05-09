import os
import requests
import time
import jsons

from flask import Flask, jsonify, render_template, request , redirect , url_for
from flask_socketio import SocketIO, emit

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
    def __init__(self, ChannelName , UserName , PostDate , PostString,PostID):
        self.ChannelName = ChannelName
        self.UserName = UserName
        self.PostDate = PostDate
        self.PostString = PostString
        self.PostID = PostID


class Channeldata:       
    """class to store individual channel data. """
    def __init__(self, ChannelName , ChannelGenre):
        self.ChannelName = ChannelName
        self.ChannelGenre = ChannelGenre


# list of posts.
listOfPostData =[]

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

    postlist = [x for x in listOfPostData if x.ChannelName.lower() == channelName.lower()]

    # AmitTempCode this is just for testing.
    time.sleep(5)


    return jsonify({"success": True , 'data':postlist })



