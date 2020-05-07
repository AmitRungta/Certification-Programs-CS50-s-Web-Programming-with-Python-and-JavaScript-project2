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
    def __init__(self, UserName , PostDate , PostString,PostID):
        self.UserName = UserName
        self.PostDate = PostDate
        self.PostString = PostString
        self.PostID = PostID


class Channeldata:       
    """class to store individual channel data. """
    def __init__(self, ChannelName , ChannelGenre):
        self.ChannelName = ChannelName
        self.ChannelGenre = ChannelGenre


# list of selected users.
listOfUsers =[]

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



























# AmitTempCode TO delete here....
votes = {"yes": 0, "no": 0, "maybe": 0}

@app.route("/postpage")
def postpage():
    return render_template("UserPost.html")


@socketio.on("submit vote")
def vote(data):
    if data:
        selection = data["selection"]
        votes[selection] += 1
        emit("vote totals", votes, broadcast=True)




@app.route("/posts", methods=["POST"])
def posts():

    # Get start and end point for posts to generate.
    start = int(request.form.get("start") or 0)
    end = int(request.form.get("end") or (start + 9))

    # Generate list of posts.
    data = []
    for i in range(start, end + 1):
        data.append(f"Post #{i}")

    # Artificially delay speed of response.
    time.sleep(1)

    # Return list of posts.
    return jsonify(data)
