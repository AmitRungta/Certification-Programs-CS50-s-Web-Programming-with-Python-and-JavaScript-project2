

# class UserData:
#     """class to save user name and his registered channels. """
#     def __init__(self, DisplayName):
#         self.DisplayName = DisplayName
#         self.ChannelList = []

#     def RegisterChannel(self, ChhanelName):
#         if ( ( None == ChhanelName ) or (not(ChhanelName and ChhanelName.strip())) ) :
#             return "Channel name is not valid"
        
#         if ( ChhanelName in self.ChannelList ):
#             return "Already registered with this channel"

#         self.ChannelList.append (ChhanelName)

#         return True


class User:

    def __init__(self, username):
        self.username = username

    @staticmethod
    def is_authenticated():
        return True

    @staticmethod
    def is_active():
        return True

    @staticmethod
    def is_anonymous():
        return False

    def get_id(self):
        return self.username




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
    LastChannelID = 0 
    def __init__(self, ChannelName , ChannelGenre):
        self.ChannelName = ChannelName
        self.ChannelGenre = ChannelGenre
        self.ChannelID = Channeldata.LastChannelID + 1
        Channeldata.LastChannelID += 1



def get_user(username):
    return User(username) if username and username.strip else None

