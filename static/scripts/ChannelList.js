//------------------------------------------------------------------
// This function will show the list of channels.
//
function fnUpdateChannelList ( ChannelList)
{
    let ChannelPresentCount = 0 

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

            const theTemplateScriptChannel = document.querySelector('#headingtemplateChannel').innerHTML ;
            const theTemplateChannel = Handlebars.compile (theTemplateScriptChannel);

            const theTemplateScriptGenre = document.querySelector('#headingtemplateGenre').innerHTML ;
            const theTemplateGenre = Handlebars.compile (theTemplateScriptGenre );


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
                // AmitTempCode 
                // if ( CurChannelName != "" )
                // {
                //     let SelChannelGenre = CurGenreChannelList.filter(item => {
                //         let k = item.ChannelName;
                //         return ( k === CurChannelName ) ? true : false ;
                //     });
                //     selectedgenre =  SelChannelGenre.length > 0 ;
                // }
                

                // WE have out current genre and list of channels for this genre...
                const showdata = selectedgenre ? "show" : "" ;
                const channelcontent = theTemplateChannel({ 'values': CurGenreChannelList , 'CurChannelGenere': CurChannelGenere , 'showdata' : showdata });
                const visiblecmd = selectedgenre ? "true" : "false" ;
                const collapsedcmd = selectedgenre ? "" : "collapsed" ;
                const genrecontent = theTemplateGenre({ 'CurChannelGenere': CurChannelGenere , 'CurChannelGenereChannelsData':channelcontent, "DisplayType" : visiblecmd , 'collapsedcmd':collapsedcmd});

                ChannelListNode.innerHTML += genrecontent;
            }

            ChannelPresentCount = ChannelDataList.length ;
        }
    }

    return ChannelPresentCount ;
}



//------------------------------------------------------------------
// Adds the post from the list..
//
function fnUpdatePostList ( PostList , bClearOldData = true )
{
    if (PostList.success) {
        if ("PostAdded" in PostList) {
            for (postindex = PostList.PostAdded.length - 1; postindex >= 0; postindex--) {
                fnAddPost(PostList.PostAdded[postindex], bClearOldData, false);
                bClearOldData = false;
            }
        }

        if ("PostDeleted" in PostList) {
            for (postindex = PostList.PostDeleted.length - 1; postindex >= 0; postindex--) {
                fnDeletePost(PostList.PostDeleted[postindex]);
            }
        }

        
    }
}






function fnGetLocalTimeStringFromUTC( PostDateTime)
{
    CurDate = new Date(PostDateTime);
    return String(CurDate.getFullYear()).padStart(4, '0') + '/' +
        String((CurDate.getMonth() + 1)).padStart(2, '0') + '/' +
        String(CurDate.getDate()).padStart(2, '0') + ' ' +
        String(CurDate.getHours()).padStart(2, '0') + ':' +
        String(CurDate.getMinutes()).padStart(2, '0') + ':' +
        String(CurDate.getSeconds()).padStart(2, '0');
}




//------------------------------------------------------------------
// Adds a single post in the display 
//
function fnAddPost ( content , bClearOldData  = false , bAddInEnd = false )
{
    postNode = document.querySelector('#display-message-section') ;
    if ( null === postNode )
        return ;

    if ( bClearOldData )
        postNode.innerHTML = "";

    // Retrieve username
    const username = document.querySelector('#get-username').innerHTML;

    // Retrieve current channel name for the page
    const CurChannelName = document.querySelector('#get-channelname').innerHTML;

    const p = document.createElement('p');
    const span_username = document.createElement('span');
    const span_timestamp = document.createElement('span');
    const span_deletemsg = document.createElement('button');
    const br = document.createElement('br')

    // Display user's own message
    if (content.UserName == username) {
        p.setAttribute("class", "my-msg");

        // Username
        span_username.setAttribute("class", "my-username");

        // Timestamp
        span_timestamp.setAttribute("class", "timestamp");

        // Delete Self messages.
        span_deletemsg.setAttribute("class", "btn btn-outline-danger btn-sm delete-button ");
        span_deletemsg.setAttribute("data-postid", content.PostID);
        span_deletemsg.setAttribute("onclick", "fnDeletePostMsg( this )");
        
        span_deletemsg.innerHTML = "Delete" ;
    }
    // Display other users' messages
    else {
        p.setAttribute("class", "others-msg");

        // Username
        span_username.setAttribute("class", "other-username");

        // Timestamp
        span_timestamp.setAttribute("class", "timestamp");
    }

    p.setAttribute("id", "PostID-"+content.PostID);
    span_username.innerText = content.UserName;
    span_timestamp.innerText = fnGetLocalTimeStringFromUTC(content.PostDate);

    // HTML to append
    p.innerHTML += span_username.outerHTML ;
    if ( span_deletemsg.innerText.length )
        p.innerHTML += span_deletemsg.outerHTML ;
    p.innerHTML += span_timestamp.outerHTML ;
    p.innerHTML +=  br.outerHTML + content.PostString 

    //Append
    if ( bAddInEnd )
        postNode.append(p);
    else
        postNode.insertBefore(p,postNode.firstChild);
}





//------------------------------------------------------------------
// deletes a single post in the display list 
//
function fnDeletePost ( PostIDDeleted )
{
    postNode = document.querySelector('#PostID-'+PostIDDeleted) ;
    if ( null == postNode )
        return ;

    postNode.style.animationName = 'hide';
    postNode.style.animationDuration = '1s' ;
    postNode.style.animationFillMode = 'forwards';
    postNode.style.animationPlayState = 'running';
    postNode.addEventListener('animationend', () =>  {
        postNode.remove();
    });
}


//------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

    // When channel list is updated for for some new channel added
    fnUpdateChannelList (null );

    expandTextarea('inputPost');

    //------------------------------------------------------------------
    // Make 'enter' key submit message
    let PostMessageNode = document.getElementById("inputPost");
    if (PostMessageNode) {
        PostMessageNode.addEventListener("keyup", function (event) {
            event.preventDefault();
            if (event.keyCode === 13) {
                document.getElementById("PostMsg").click();
            }
        });
    }
  
    

});