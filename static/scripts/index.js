const LoggedUserKey = 'LoggedUserName' ;
const LoggedChannelKey = 'LoggedChannelName' ;



//------------------------------------------------------------------
function fnGetCurUserName ( bCanUseLocalStorage )
{
    // Retrieve current channel name for the page
    let CurUserName = "" ;
    if ( document.querySelector('#get-username') ) 
        CurUserName = document.querySelector('#get-username').innerHTML;

    if ( CurUserName.length < 1 && bCanUseLocalStorage )
    {
        if (localStorage.getItem(LoggedUserKey))
            CurUserName = localStorage.getItem(LoggedUserKey);
    }

    return CurUserName ;
}

function fnSetCurUserNameInLocalStorage ( LoggedUserName = "")
{
    LoggedUserName = LoggedUserName.trim() ;
    localStorage.setItem(LoggedUserKey, LoggedUserName);
}


//------------------------------------------------------------------
function fnGetCurChannelName ( bCanUseLocalStorage )
{
    // Retrieve current channel name for the page
    let CurChannelName = "" ;
    if ( document.querySelector('#get-channelname') ) 
        CurChannelName = document.querySelector('#get-channelname').innerHTML;

    if ( CurChannelName.length < 1 && bCanUseLocalStorage )
    {
        if (localStorage.getItem(LoggedChannelKey))
            CurChannelName = localStorage.getItem(LoggedChannelKey);
    }

    return CurChannelName ;
}


//------------------------------------------------------------------
function fnSetCurChannelNameInLocalStorage ( channelName )
{
    channelName = channelName.trim() ;
    localStorage.setItem(LoggedChannelKey, channelName);
}


//------------------------------------------------------------------
// Sets the height of the text box for best fit...
// 
function fnSetAutoHeight( nodeelement)
{
    if ( nodeelement )
    {
        nodeelement.style.overflow = 'hidden';
        nodeelement.style.height = 0;
        nodeelement.style.height = nodeelement.scrollHeight + 'px';
    }
}


//------------------------------------------------------------------
// adds the element with given ID to update its height automatically as per the text typed...
// 
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


//------------------------------------------------------------------
// Just to validate if the name is in valid format or not...
// 
function IsValidUserName( UserName , CanContainBlank ) {
    if ( null == UserName )
        return "cannot be empty." ;

    UserName = UserName.trim() ;    
    if (UserName.length < 1)
        return "cannot be empty." ;

    if ( !CanContainBlank && -1 != UserName.indexOf (" ") )
        return "cannot contain blank spaces." ;

    if ( -1 != UserName.indexOf ("'") ||
        -1 != UserName.indexOf ('"') ||
        -1 != UserName.indexOf ("=") ||
        -1 != UserName.indexOf (":") ||
        -1 != UserName.indexOf (";") ||
        -1 != UserName.indexOf ("|") ||
        -1 != UserName.indexOf ("=") ||
        -1 != UserName.indexOf ("*") ||
        -1 != UserName.indexOf ("%") ||
        -1 != UserName.indexOf ("/") ||
        -1 != UserName.indexOf ("\\") ||
        -1 != UserName.indexOf ("<") ||
        -1 != UserName.indexOf (">") ||
        -1 != UserName.indexOf ("!") ||
        -1 != UserName.indexOf ("?") 
        )
        return "cannot contain following special character   \' \" \= \: \; \| \= \* \% \/ \\ \? \< \> \!." ;
    return "" ;
}





