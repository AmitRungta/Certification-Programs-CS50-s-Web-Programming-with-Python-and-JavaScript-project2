// This function will show the list of channels.
function fnUpdateChannelList ( ChannelList)
{
    let CurChannelName = fnGetCurChannelName() ;
    if ( "" === CurChannelName )
        CurChannelName = fnGetLastAddedChannelName() ;

    if ( null == ChannelList )
    {
        // Fetch a new channel list from the application
        const request = new XMLHttpRequest();
        //request.timeout = 5000 ; // wait for 5 sec for response and then say timeout.
        request.open('POST', '/GetChannelList' , false );

        // Send request
        request.send();

        if ( 200 == request.status )
        {
            // Extract JSON data from request
            const data = JSON.parse(request.responseText);

            // Update the result div
            if (data.success) {
                ChannelList = data
            }
        }
    }

    let ChannelListNode = document.querySelector('#ChannelDisplayList');
    if (ChannelListNode) {
        if (null == ChannelList || null == ChannelList.data || ChannelList.data.length < 1 ) {
            if (ChannelListNode)
                ChannelListNode.innerHTML = "No Channel list is found. Please create a channel first before proceeding."
        }
        else {

            // Now lets sort the list of channels 
            let ChannelDataList = ChannelList.data ;
            ChannelDataList.sort ( function(data1, data2){
                let strcomp1 = data1.ChannelGenre.toLowerCase() ;
                let strcomp2 = data2.ChannelGenre.toLowerCase() ;
                 
                if ( strcomp1 === strcomp2 )
                {
                    if ( data1.ChannelName.toLowerCase() < data2.ChannelName.toLowerCase() ) 
                        return -1 ;
                    return 1 ; 
                }

                if ( strcomp1 < strcomp2 )
                    return -1 ;
                return 1 ; 
            } )

            
            // Lets get the list of unique genre names..
            let seen = new Set();
            let UniqueGenreList = ChannelDataList.filter(item => {
                let k = item.ChannelGenre;
                return seen.has(k) ? false : seen.add(k);
            });

            

            ChannelListNode.innerHTML = "<b>Channel List</b>";

            var theTemplateScriptChannel = document.querySelector('#headingtemplateChannel').innerHTML ;
            var theTemplateChannel = Handlebars.compile (theTemplateScriptChannel);

            var theTemplateScriptGenre = document.querySelector('#headingtemplateGenre').innerHTML ;
            var theTemplateGenre = Handlebars.compile (theTemplateScriptGenre );


            // Now lets generate the list of channels for each genre
            for ( loopindex in UniqueGenreList )
            {
                let CurChannelGenere = UniqueGenreList[loopindex].ChannelGenre ;
                let CurGenreChannelList = ChannelDataList.filter(item => {
                    let k = item.ChannelGenre;
                    return ( k === CurChannelGenere ) ? true : false ;
                });
    
                let len = CurGenreChannelList.length ;
                let selectedgenre = ( 0 == loopindex ) ? true : false ; 
                if ( CurChannelName != "" )
                {
                    let SelChannelGenre = CurGenreChannelList.filter(item => {
                        let k = item.ChannelName;
                        return ( k === CurChannelName ) ? true : false ;
                    });
                    selectedgenre =  SelChannelGenre.length > 0 ;
                }
                

                // WE have out current genre and list of channels for this genre...
                const showdata = selectedgenre ? "show" : "" ;
                const channelcontent = theTemplateChannel({ 'values': CurGenreChannelList , 'CurChannelGenere': CurChannelGenere , 'showdata' : showdata });
                const visiblecmd = selectedgenre ? "true" : "false" ;
                const collapsedcmd = selectedgenre ? "" : "collapsed" ;
                const genrecontent = theTemplateGenre({ 'CurChannelGenere': CurChannelGenere , 'CurChannelGenereChannelsData':channelcontent, "DisplayType" : visiblecmd , 'collapsedcmd':collapsedcmd});

                ChannelListNode.innerHTML += genrecontent;
            }
        }
    }

    // Have each button change the color of the heading
    document.querySelectorAll('.channel-change').forEach(button => {
        button.onclick = function() { 
            fnSelectChannel ( button.dataset.channelname );
         }
    });
}

// Function to select the channel as current displayed channel. 
function fnSelectChannel ( channelname )
{
    event.preventDefault() ;
    lastChannelName = fnGetCurChannelName() ;
    if ( lastChannelName === channelname  )
        return ;

    fnSetCurChannelName ( channelname) ;
    fnLoadUserPage( ) ;
}



// This function will get all the content of the desired channel.
function fnGetChannelContent(CurChannelName) {
    if ("" === CurChannelName)
        CurChannelName = fnGetCurChannelName();

    if ("" === CurChannelName)
        return false;

    // Fetch the content of this channel
    openModal();
    try {
        const request = new XMLHttpRequest();
        request.open('POST', '/ShowChannel');
        request.onload = () => {
            closeModal();
            if (200 == request.status) {
                // Extract JSON data from request
                const data = JSON.parse(request.responseText);

                // Update the posts div
                if (data.success) {
                    data.data.forEach(fnAddPost);
                }
            }
        };

        // Add the channel name in the request.
        const data = new FormData();
        data.append('ChannelName', CurChannelName);

        // Send request.
        request.send(data);
    } catch (error) {
        closeModal();
    }
}





document.addEventListener('DOMContentLoaded', () => {
    fnUpdateChannelList (null);
    
    if (location.pathname === '/ShowChannel' )
        fnGetChannelContent("")

    // Connect to websocket
    let socketlocation = location.protocol + '//' + document.domain + ':' + location.port  + '/ChannelList' ;
    var socket = io.connect(socketlocation);

    // When channel list is updated for for some new channel added
    socket.on('Channel_List_Updated', data => {
        fnUpdateChannelList (data );

    });
});
