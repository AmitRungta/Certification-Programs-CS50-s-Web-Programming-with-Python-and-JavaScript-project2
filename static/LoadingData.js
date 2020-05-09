function openModal() {
  nodetouse = document.getElementById('modal');
  if (nodetouse)
    nodetouse.style.display = 'block';

    nodetouse = document.getElementById('fade');
  if (nodetouse)
    nodetouse.style.display = 'block';
}

function closeModal() {
  nodetouse = document.getElementById('modal');
  if (nodetouse)
    nodetouse.style.display = 'none';

    nodetouse = document.getElementById('fade');
  if (nodetouse)
    nodetouse.style.display = 'none';
}
