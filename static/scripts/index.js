

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

