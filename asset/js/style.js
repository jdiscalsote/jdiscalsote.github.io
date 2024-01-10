function toggleMenu()
{
    const navItems = document.querySelector('.nav-items');
    navItems.style.display === 'none' || navItems.style.display === '' ? 
    navItems.style.display = 'flex' : 
    navItems.style.display = 'none';
}
  