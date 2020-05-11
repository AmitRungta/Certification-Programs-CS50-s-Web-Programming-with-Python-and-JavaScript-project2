// This function will show the list of channels.
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




function fnAddPostList ( PostList )
{
    if ( PostList.success )
    {
        bClearOldData = true ;
        for ( postindex in PostList.postlist )
        {
            fnAddPost (PostList.postlist[postindex] , bClearOldData ) ;
            bClearOldData = false ;
        }
    }
}






function fnAddPost ( content , bClearOldData  = false )
{
    const theTemplateScriptPost = document.querySelector('#templateChannelPost').innerHTML ;
    const theTemplatePost = Handlebars.compile (theTemplateScriptPost);

    postNode = document.querySelector('#posts_list') ;
    if ( null === postNode )
        return ;

    if ( bClearOldData )
        postNode.innerHTML = "";

    // Create new post.
    const post = theTemplatePost({'contents': content});
    postNode.innerHTML += post;
}






document.addEventListener('DOMContentLoaded', () => {

    // When channel list is updated for for some new channel added
    fnUpdateChannelList (null );

    expandTextarea('inputPost');

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