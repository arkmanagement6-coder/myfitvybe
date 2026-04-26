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

// Hero Slider Logic
let currentSlideIndex = 0;
let slides, dots, slideInterval;

function initSlider() {
    slides = document.querySelectorAll('.slide');
    dots = document.querySelectorAll('.nav-dot');
    if (slides.length === 0) return;
    startSlideTimer();
}

function updateSlider(index) {
    if(!slides || slides.length === 0) return;
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlideIndex = index;
}

function nextSlide() {
    if(!slides || slides.length === 0) return;
    let nextIndex = (currentSlideIndex + 1) % slides.length;
    updateSlider(nextIndex);
    resetSlideTimer();
}

function prevSlide() {
    if(!slides || slides.length === 0) return;
    let prevIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    updateSlider(prevIndex);
    resetSlideTimer();
}

function goToSlide(index) {
    updateSlider(index);
    resetSlideTimer();
}

function startSlideTimer() {
    slideInterval = setInterval(nextSlide, 5000);
}

function resetSlideTimer() {
    clearInterval(slideInterval);
    startSlideTimer();
}

document.addEventListener('DOMContentLoaded', initSlider);
