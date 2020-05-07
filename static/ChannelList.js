

// This function will show the list of channels.
function fnUpdateChannelList ( ChannelList)
{
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


            // Template for roll results
            const template = Handlebars.compile("<li>{{ value }}</li>");

            ChannelListNode.innerHTML = "Channel List";
            ChannelListNode.innerHTML += "<ol>";
            ChannelDataList.forEach(function(channeldata) {
                const content = template({ 'value': channeldata.ChannelName + " - " + channeldata.ChannelGenre });
                ChannelListNode.innerHTML += content;
              });
            ChannelListNode.innerHTML += "</ol>";
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    fnUpdateChannelList (null);



    // Connect to websocket
    let socketlocation = location.protocol + '//' + document.domain + ':' + location.port  + '/ChannelList' ;
    var socket = io.connect(socketlocation);

    // When channel list is updated for for some new channel added
    socket.on('Channel_List_Updated', data => {
        fnUpdateChannelList (data);

    });
});
