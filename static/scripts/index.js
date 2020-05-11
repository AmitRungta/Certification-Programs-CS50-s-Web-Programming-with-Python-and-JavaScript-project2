

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

