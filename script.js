document.addEventListener('DOMContentLoaded', () => {
  // Navbar Scroll Effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.add('scrolled'); // keep it scrolled for visibility on white bg, or toggle
      if(window.scrollY === 0) navbar.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuToggle.innerHTML = navLinks.classList.contains('active') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
  }

  // Countdown Timer
  const countdownElements = document.querySelectorAll('.countdown');
  countdownElements.forEach(el => {
    // Set 15 mins from now
    const dest = new Date().getTime() + 15 * 60 * 1000;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = dest - now;
      
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      el.innerHTML = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      if (distance < 0) {
        clearInterval(interval);
        el.innerHTML = "EXPIRED";
      }
    }, 1000);
  });

  // Exit Intent Popup
  let popupShown = false;
  const exitPopup = document.getElementById('exitPopup');
  const closePopupBtn = document.querySelector('.close-popup');

  if (exitPopup) {
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY < 0 && !popupShown) {
        exitPopup.classList.add('active');
        popupShown = true;
      }
    });

    closePopupBtn.addEventListener('click', () => {
      exitPopup.classList.remove('active');
    });

    exitPopup.addEventListener('click', (e) => {
      if (e.target === exitPopup) {
        exitPopup.classList.remove('active');
      }
    });
  }

  // Highlight active nav link
  const currentPath = window.location.pathname.split('/').pop();
  const navItems = document.querySelectorAll('.nav-links a');
  navItems.forEach(item => {
    const itemPath = item.getAttribute('href');
    if (itemPath === currentPath || (currentPath === '' && itemPath === 'index.html')) {
      item.classList.add('active');
    }
  });
});
