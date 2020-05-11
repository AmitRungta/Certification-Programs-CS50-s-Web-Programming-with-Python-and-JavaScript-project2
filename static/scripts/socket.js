document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    let socketlocation = location.protocol + '//' + document.domain + ':' + location.port   ;
    var socket = io.connect(socketlocation);

    // Retrieve username
    const username = document.querySelector('#get-username').innerHTML;
    const CurChannelName = document.querySelector('#get-channelname').innerHTML;

    let UsrErrMsgNode = document.querySelector('#UserErrMsg') ;
    if ( "" == UsrErrMsgNode.innerHTML.trim() ) 
        UsrErrMsgNode.style.display = "none";


    let AddChannelFormNode = document.getElementById('AddChannelForm');
    if (AddChannelFormNode) {
        AddChannelFormNode.onsubmit = function (e) {
            e.preventDefault();

            let UsrErrMsgNode = document.querySelector('#UserErrMsg') ; 
            UsrErrMsgNode.style.display = "none";
        
            ChannelNameNode = document.querySelector('#inputChannelName');
            ChannelGenreNode = document.querySelector('#inputChannelGenre');
            if (null === ChannelNameNode || null === ChannelGenreNode)
                return false;
        
            ChannelName = ChannelNameNode.value;
            ChannelName = ChannelName.trim();
            if (ChannelName === "") {
                UsrErrMsgNode.innerHTML = `Channel name cannot be left empty!!!`;
                UsrErrMsgNode.style.display = "block";
                return false;
            }
        
            ChannelGenre = ChannelGenreNode.value;
            ChannelGenre = ChannelGenre.trim();
            if (ChannelGenre === "") {
                UsrErrMsgNode.innerHTML = `Channel genre cannot be left empty!!!`;
                UsrErrMsgNode.style.display = "block";
                return false;
            }
        
            socket.emit('add_channel', {
                'ChannelName': ChannelName,
                'ChannelGenre': ChannelGenre,
            } , callback=fnAddChannelResponse )
        }
    }


    function fnAddChannelResponse ( data )
    {
        let UsrErrMsgNode = document.querySelector('#UserErrMsg');
        UsrErrMsgNode.style.display = "none";

        ChannelNameNode = document.querySelector('#inputChannelName');
        ChannelGenreNode = document.querySelector('#inputChannelGenre');
        if (null === ChannelNameNode || null === ChannelGenreNode)
            return false;

        if (data['success']) {
            ChannelNameNode.value = '';
            ChannelGenreNode.value = '';
            ChannelNameNode.focus();
        }
        else {
            UsrErrMsgNode.innerHTML = data['reason'];
            UsrErrMsgNode.style.display = "block";
            return false;
        }
    }

    // When channel list is updated for for some new channel added
    socket.on('Channel_List_Updated', data => {
        fnUpdateChannelList(data);
    });

    // When new post is added in the channels
    socket.on('PostList_Updated', data => {
        if ( data.success )
            fnAddPost(data.NewPost , false );
    });


    socket.on('connect', function () {
        fnJoinRoom(username, CurChannelName);

        let ChannelPostFormNode = document.getElementById('ChannelPostForm');
        if (ChannelPostFormNode) {
            ChannelPostFormNode.onsubmit = function (e) {
                e.preventDefault();

                let UsrErrMsgNode = document.querySelector('#UserErrMsg');
                UsrErrMsgNode.style.display = "none";

                PostMessageNode = document.querySelector('#inputPost');
                if (null === PostMessageNode)
                    return false;

                PostMessage = PostMessageNode.value;
                PostMessage = PostMessage.trim();
                if (PostMessage === "") {
                    UsrErrMsgNode.innerHTML = `Please specify a message to post first !!!`;
                    UsrErrMsgNode.style.display = "block";
                    return false;
                }

                socket.emit('send_message', {
                    username: username,
                    channelname: CurChannelName,
                    PostString: PostMessage
                })

                PostMessageNode.value = '';
                PostMessageNode.focus();
            }

            let postNode = document.querySelector('#posts_list') ;
            if ( postNode )
            {
                // get the list of messages for this channel.
                socket.emit('get_channel_post', {
                    username: username,
                    channelname: CurChannelName,
                }, callback = fnAddPostList)
            }



        }




    });

    window.onbeforeunload = function () {
        fnLeaveRoom(username, CurChannelName);
    };



    // Trigger 'join' event
    function fnJoinRoom (username, CurChannelName)
    {
        socket.emit('join_channel', {
            username: username,
            channel: CurChannelName
        });
    }
    
    
    // Trigger 'leave' event if user was previously on a room
    function fnLeaveRoom (username, CurChannelName)
    {
        socket.emit('leave_channel', {
            username: username,
            channel: CurChannelName
        });
    }
    
});

