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

// --- Cart System ---
function initCartSystem() {
    // 1. Inject Cart CSS
    const style = document.createElement('style');
    style.innerHTML = `
        .cart-drawer {
            position: fixed; top: 0; right: -400px; width: 100%; max-width: 400px;
            height: 100vh; background: white; box-shadow: -5px 0 15px rgba(0,0,0,0.1);
            z-index: 2000; transition: right 0.3s ease; display: flex; flex-direction: column;
        }
        .cart-drawer.active { right: 0; }
        .cart-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
            background: rgba(0,0,0,0.5); z-index: 1999; display: none;
        }
        .cart-overlay.active { display: block; }
        .cart-header { padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .cart-body { padding: 20px; flex: 1; overflow-y: auto; }
        .cart-footer { padding: 20px; border-top: 1px solid #eee; background: #f9f9f9; }
        .cart-item { display: flex; gap: 15px; margin-bottom: 20px; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 15px; }
        .cart-item img { width: 60px; height: 60px; object-fit: contain; border-radius: 8px; border: 1px solid #eee; }
        .cart-item-details { flex: 1; }
        .cart-item-title { font-weight: bold; font-size: 0.95rem; margin-bottom: 5px; color: var(--text-dark); }
        .cart-item-price { color: var(--primary-red); font-weight: bold; }
        .qty-controls { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
        .qty-btn { background: #eee; border: none; width: 25px; height: 25px; border-radius: 4px; cursor: pointer; color: var(--text-dark); font-weight: bold; }
        .cart-total-row { display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: bold; margin-bottom: 15px; color: var(--text-dark); }
        .nav-cart-btn { position: relative; cursor: pointer; margin-left: 20px; color: var(--text-dark) !important; display: inline-flex !important; align-items: center; }
        .cart-badge { position: absolute; top: -8px; right: -12px; background: var(--primary-red); color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; font-weight: bold; }
    `;
    document.head.appendChild(style);

    // 2. Inject Cart Drawer HTML
    const overlay = document.createElement('div');
    overlay.className = 'cart-overlay';
    overlay.id = 'cartOverlay';
    
    const drawer = document.createElement('div');
    drawer.className = 'cart-drawer';
    drawer.id = 'cartDrawer';
    drawer.innerHTML = `
        <div class="cart-header">
            <h3 style="color: var(--text-dark);">Your Cart</h3>
            <button onclick="toggleCart()" style="background:none; border:none; font-size: 1.5rem; cursor: pointer; color: var(--text-dark);">&times;</button>
        </div>
        <div class="cart-body" id="cartItemsContainer">
            <!-- Items injected here -->
        </div>
        <div class="cart-footer">
            <div class="cart-total-row">
                <span>Total:</span>
                <span id="cartTotalAmt">₹0</span>
            </div>
            <a href="checkout.html" class="btn btn-primary" style="width: 100%; text-align: center; display: block;">Proceed to Checkout</a>
        </div>
    `;
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    overlay.addEventListener('click', toggleCart);

    // 3. Inject Nav Cart Icon
    const navLinks = document.querySelector('.nav-links');
    if(navLinks) {
        const cartLi = document.createElement('li');
        cartLi.innerHTML = `<a class="nav-cart-btn" onclick="toggleCart()"><i class="fas fa-shopping-cart"></i> <span class="cart-badge" id="cartBadge">0</span></a>`;
        navLinks.appendChild(cartLi);
    }

    // 4. Init State
    updateCartUI();
}

window.toggleCart = function() {
    document.getElementById('cartDrawer').classList.toggle('active');
    document.getElementById('cartOverlay').classList.toggle('active');
}

window.addToCart = function(id, name, price, img) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(i => i.id === id);
    if(existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ id, name, price, img, qty: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    toggleCart(); // Open cart to show user
}

window.updateCartQty = function(id, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(i => i.id === id);
    if(item) {
        item.qty += change;
        if(item.qty <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    }
}

function updateCartUI() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('cartItemsContainer');
    const badge = document.getElementById('cartBadge');
    const totalAmt = document.getElementById('cartTotalAmt');
    
    if(!container) return;

    if(cart.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding: 40px 20px; color: var(--text-muted);"><i class="fas fa-shopping-basket" style="font-size: 3rem; margin-bottom: 20px; opacity:0.3;"></i><br>Your cart is empty.</div>';
        if(badge) badge.textContent = '0';
        totalAmt.textContent = '₹0';
        return;
    }

    let total = 0;
    let totalItems = 0;
    
    container.innerHTML = cart.map(item => {
        total += (item.price * item.qty);
        totalItems += item.qty;
        return \`
        <div class="cart-item">
            <img src="\${item.img}" alt="\${item.name}">
            <div class="cart-item-details">
                <div class="cart-item-title">\${item.name}</div>
                <div class="cart-item-price">₹\${item.price.toLocaleString()}</div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateCartQty('\${item.id}', -1)">-</button>
                    <span>\${item.qty}</span>
                    <button class="qty-btn" onclick="updateCartQty('\${item.id}', 1)">+</button>
                </div>
            </div>
        </div>
        \`;
    }).join('');
    
    if(badge) badge.textContent = totalItems;
    totalAmt.textContent = '₹' + total.toLocaleString();
}

document.addEventListener('DOMContentLoaded', initCartSystem);
