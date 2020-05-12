var socket = null ;
// Retrieve username
var username = "";
var CurChannelName = "";
var bOldFooterVisible = false ; 

document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    let socketlocation = location.protocol + '//' + document.domain + ':' + location.port   ;
    socket = io.connect(socketlocation);

    // Retrieve username
    username = document.querySelector('#get-username').innerHTML;

    // Retrieve current channel name for the page
    CurChannelName = fnGetCurChannelName ( false ) ;

    bOldFooterVisible = false ;

    // Retrieve user error message node.
    let UsrErrMsgNode = document.querySelector('#UserErrMsg') ;
    if ( "" == UsrErrMsgNode.innerHTML.trim() ) 
        UsrErrMsgNode.style.display = "none";


    // Processing for add a new channel form.
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

    // function for processing the response of add a new channel. In this response we get the new list of channel.
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

    //------------------------------------------------------------------
    // When channel list is updated for for some new channel added
    socket.on('Channel_List_Updated', data => {
        fnUpdateChannelList(data);
    });

    //------------------------------------------------------------------
    // When new post is added in the channels
    socket.on('PostList_Updated', data => {
        //Start the wait progress..
        openModal() ;

        fnUpdatePostList ( data ) ;
    });


    socket.on('connect', function () {
        fnJoinRoom();

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
                expandTextarea('inputPost');
            }

            let postNode = document.querySelector('#display-message-section') ;
            if ( postNode )
            {
                // Lets first clear the old data.
                postNode.innerHTML = "";

                //Start the wait progress..
                openModal();

                // get the list of messages for this channel.
                socket.emit('get_channel_post', {
                    username: username,
                    channelname: CurChannelName,
                }, callback = fnUpdatePostList)
            }
        }
    });


   


    //------------------------------------------------------------------
    // When leaving the page lets leave this channel for new messages. 
    window.addEventListener ("beforeunload"  , () => {
        fnLeaveRoom();
    }) ;

    //------------------------------------------------------------------
    // When page is unloaded close the socket. 
    window.addEventListener ("unload"  , () => {
        if ( null != socket )
            socket.close() ;
        socket = null ;
    }) ;

    //------------------------------------------------------------------
    // If scrolled to bottom, load the next 20 posts.
    window.addEventListener ("scroll" , fnCheckAndFetchMoreMessages) ;
    window.addEventListener ("resize" , fnCheckAndFetchMoreMessages) ;




    // Trigger 'join' event
    function fnJoinRoom ()
    {
        socket.emit('join_channel', {
            username: username,
            channel: CurChannelName
        });
    }
    
    
    // Trigger 'leave' event if user was previously on a room
    function fnLeaveRoom ()
    {
        socket.emit('leave_channel', {
            username: username,
            channel: CurChannelName
        });
    }
    

});


//------------------------------------------------------------------
// Check if a given component is visible or not.
function isInViewport(element) {
    if (null == element)
        return false;

    var bounding = element.getBoundingClientRect();
    return (
        bounding.top >= 0 &&
        bounding.left >= 0 &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function fnCheckAndFetchMoreMessages()
{
    var visible = isInViewport(document.querySelector("#footer-display-data")) ;
    if ( visible && !bOldFooterVisible )
    {
        fnFetchMoreMessages();
    }
    bOldFooterVisible = visible ;
}


function fnFetchMoreMessages() {
    let postNode = document.querySelector('#display-message-section');
    if (postNode) {

        //Start the wait progress..
        openModal() ;

        getchannelposrdata = {
            username: username,
            channelname: CurChannelName,
        };

        CurrNode = postNode.lastChild;
        if (CurrNode && CurrNode.innerText.length > 0 && CurrNode.hasAttribute("PostID")) {
            lastpostID = parseInt(CurrNode.getAttribute("PostID"));
            getchannelposrdata['LastPostID'] = lastpostID;
        }

        // get the list of messages for this channel.
        socket.emit('get_channel_post', getchannelposrdata, callback = fnUpdatePostList)
    }
}


// Trigger 'delete_post' event
function fnDeletePostMsg ( buttonelement )
{
    if ( null == socket || null == buttonelement )
        return ;
    PostID = parseInt ( buttonelement.dataset.postid) ;

    socket.emit('delete_message', {
        'username': username,
        'channel': CurChannelName,
        'PostDeleted':PostID
    });
}



