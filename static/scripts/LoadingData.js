

//------------------------------------------------------------------
// Function for showing the loading data progess dialog...
//
function openModal() {
  nodetouse = document.getElementById('modal');
  if (nodetouse)
    nodetouse.style.display = 'block';

    nodetouse = document.getElementById('fade');
  if (nodetouse)
    nodetouse.style.display = 'block';
}


//------------------------------------------------------------------
// Function for cloasing the loading data progess dialog...
//
function closeModal() {
  nodetouse = document.getElementById('modal');
  if (nodetouse)
    nodetouse.style.display = 'none';

    nodetouse = document.getElementById('fade');
  if (nodetouse)
    nodetouse.style.display = 'none';
}
