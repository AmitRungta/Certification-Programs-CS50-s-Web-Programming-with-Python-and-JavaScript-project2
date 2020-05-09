const LoggedUserKey = 'LoggedUserName' ;
const LoggedChannelKey = 'LoggedChannelName' ;
const LastAddedChannelKey = 'LastAddedChannelName' ;


function fnGetCurUserName ()
{
    let LoggedUserName = "";
    if (localStorage.getItem(LoggedUserKey))
        LoggedUserName = localStorage.getItem(LoggedUserKey );

    LoggedUserName = LoggedUserName.trim() ;
    return LoggedUserName ;
}

function fnSetCurUserName ( LoggedUserName = "")
{
    LoggedUserName = LoggedUserName.trim() ;
    localStorage.setItem(LoggedUserKey, LoggedUserName);
}


function fnGetCurChannelName ()
{
    let LoggedChannelName = "";
    if (localStorage.getItem(LoggedChannelKey))
        LoggedChannelName = localStorage.getItem(LoggedChannelKey );

    LoggedChannelName = LoggedChannelName.trim() ;
    return LoggedChannelName ;
}

function fnSetCurChannelName ( LoggedChannelName = "")
{
    LoggedChannelName = LoggedChannelName.trim() ;
    localStorage.setItem(LoggedChannelKey, LoggedChannelName);
}


function fnGetLastAddedChannelName ()
{
    let ChannelName = "";
    if (localStorage.getItem(LastAddedChannelKey))
        ChannelName = localStorage.getItem(LastAddedChannelKey );

    ChannelName = ChannelName.trim() ;
    return ChannelName ;
}

function fnSetLastAddedChannelName ( ChannelName = "")
{
    ChannelName = ChannelName.trim() ;
    localStorage.setItem(LastAddedChannelKey, ChannelName);
}


function fnLoadUserPage( )
{
    // Lets first check if any user is checked or not.
    const LoggedUserName = fnGetCurUserName () ;
    if ( LoggedUserName === "" )
        return false ;

    const LoggedChannelName = fnGetCurChannelName () ;
    if ( LoggedChannelName === "" )
    {
        window.open ( "/AddChannel" , "_top");
        return true ;
    }

    window.open ( "/ShowChannel" , "_top");
    return true ;
}


// Login button from login form.    
function fnLogin(event)
{
    retNode = document.querySelector('#inputUserName') ;
    if ( null === retNode)
        return false ;
    LoggedUserName = retNode.value;
    LoggedUserName = LoggedUserName.trim() ;
    if ( LoggedUserName === "" )
    {
        alert(`Username cannot be left empty!!!`);
        return false ;
    }         
    fnSetCurUserName(LoggedUserName);
    event.preventDefault()
    fnLoadUserPage( );
}


// Logout from current user.    
function fnLogout(event)
{
    fnSetCurUserName("");
    fnSetCurChannelName("");
    fnSetLastAddedChannelName("") ;
    window.open ( "/" , "_top");
    event.preventDefault()
}




// Add a new channel button from add channel form.    
function fnAddChannel(event) {

    event.preventDefault()
    
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


    const request = new XMLHttpRequest();
    request.open('POST', '/AddChannel');

    // Callback function for when request completes
    request.onload = () => {

        // Extract JSON data from request
        const data = JSON.parse(request.responseText);
        let UsrErrMsgNode = document.querySelector('#UserErrMsg') ; 
        ChannelNameNode = document.querySelector('#inputChannelName');
        ChannelGenreNode = document.querySelector('#inputChannelGenre');
    

        // Update the result div
        if (data.success) 
        {
            if ( UsrErrMsgNode)
                UsrErrMsgNode.innerHTML = "";
            if ( ChannelNameNode )
                ChannelNameNode.value ="" ;
            if ( ChannelGenreNode )
                ChannelGenreNode.value ="" ;
            
            fnSetLastAddedChannelName(ChannelName) ;
        }
        else 
        {
            if ( UsrErrMsgNode)
            {
                if ( data.reason )
                    UsrErrMsgNode.innerHTML = data.reason ;
                else 
                    UsrErrMsgNode.innerHTML = "Unknowm reason" ;
                UsrErrMsgNode.style.display = "block";
            }
        }
    }

    // Add data to send with request
    const data = new FormData();
    data.append('ChannelName', ChannelName);
    data.append('ChannelGenre', ChannelGenre);

    // Send request
    request.send(data);
}

function fnSetAutoHeight( nodeelement)
{
    if ( nodeelement )
    {
        nodeelement.style.overflow = 'hidden';
        nodeelement.style.height = 0;
        nodeelement.style.height = nodeelement.scrollHeight + 'px';
    }
}


function expandTextarea(id) {
    nodeelement = document.getElementById(id);
    if (nodeelement) {
        nodeelement.addEventListener('keyup', function () {
            fnSetAutoHeight(this);
        }, false);

        // Set the height initially..
        fnSetAutoHeight( nodeelement) ; 
    }
}

document.addEventListener('DOMContentLoaded', () => {

    let UsrErrMsgNode = document.querySelector('#UserErrMsg') ; 
    if ( UsrErrMsgNode && UsrErrMsgNode.innerHTML.trim() === "" )
    {
        UsrErrMsgNode.style.display = "none";
    }
});
