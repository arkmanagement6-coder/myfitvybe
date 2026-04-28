// data-service.js
// Fetches dynamic data from the MockDB (localStorage) created by the Admin Dashboard.
// In Phase 4, this will be swapped to fetch from Firebase Firestore.

document.addEventListener('DOMContentLoaded', () => {
    
    // Fallback Mock Data if Admin Panel hasn't been used yet to prevent empty sections
    const fallbackProducts = [
        { name: 'Vybe Whey Protein Isolate', price: 2499, originalPrice: 3999, category: 'Supplement', images: ['assets/product.png'], desc: 'Advanced rapid-absorbing whey isolate for optimal muscle recovery. Zero bloat, incredible taste, and zero added sugar.' },
        { name: 'Fat Burner Pro', price: 1299, originalPrice: 1999, category: 'Supplement', images: ['assets/product.png'], desc: 'Natural thermogenic fat burner to boost your metabolism.' },
        { name: 'Daily Multi-Vitamins', price: 899, originalPrice: 1299, category: 'Supplement', images: ['assets/product.png'], desc: 'Complete daily nutritional support for active individuals.' }
    ];

    const fallbackServices = [
        { name: 'Weight Loss Program', desc: 'Lose 5-7kg per month naturally', features: ['Customized Indian Diet Chart', 'No starvation or crash diets', 'Weekly Progress Tracking', '24x7 WhatsApp Coach Support'], icon: 'fas fa-weight' },
        { name: 'Weight Gain Program', desc: 'Build healthy muscle mass', features: ['Calorie-surplus delicious meals', 'Focus on muscle, not fat', 'Supplementation guidance', 'Weekly Video Check-ins'], icon: 'fas fa-dumbbell' },
        { name: 'Customized Diet Plan', desc: 'Tailored for PCOD, Thyroid & Diabetes', features: ['Hormone-balancing foods', 'Insulin sensitivity protocols', 'Designed by Clinical Nutritionists', 'Blood report analysis included'], icon: 'fas fa-notes-medical' },
        { name: 'One to One Consultation', desc: 'Expert guidance from lead nutritionists', features: ['30-minute detailed video call', 'In-depth lifestyle analysis', 'Actionable dietary roadmap', 'Q&A session for doubts'], icon: 'fas fa-user-md' }
    ];

    let storedProducts = localStorage.getItem('products');
    let products = [];
    if (storedProducts === null) {
        products = fallbackProducts;
    } else {
        products = JSON.parse(storedProducts);
    }

    let services = JSON.parse(localStorage.getItem('services')) || [];
    // Force update local storage if it contains the old mock data (3 or fewer items)
    if (services.length === 0 || services.length <= 3) {
        services = fallbackServices;
        localStorage.setItem('services', JSON.stringify(services));
    }

    // Render Products dynamically into any container with class .dynamic-product-grid
    const productGrids = document.querySelectorAll('.dynamic-product-grid');
    productGrids.forEach(grid => {
        if (products.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">No products available at the moment. Please check back later.</div>';
            return;
        }

        grid.innerHTML = products.map((p, idx) => {
            const imgUrl = (p.images && p.images.length > 0) ? p.images[0] : (p.img || 'assets/product.png');
            // Clean up relative paths if coming from admin dashboard
            const cleanImgUrl = imgUrl.startsWith('../') ? imgUrl.substring(3) : imgUrl;
            
            return `
            <div class="program-card animate-up" style="display: flex; flex-direction: column; justify-content: space-between; animation-delay: ${idx * 0.1}s;">
                <div style="position: relative; background: var(--bg-light); padding: 30px; text-align: center; border-bottom: 1px solid #eee; height: 260px; display: flex; align-items: center; justify-content: center;">
                    ${p.originalPrice > p.price ? `<div style="position: absolute; top: 15px; left: 15px; background: var(--primary-red); color: white; padding: 5px 12px; border-radius: 20px; font-weight: bold; font-size: 0.85rem; z-index: 2; box-shadow: 0 4px 10px rgba(230, 57, 70, 0.3);">Save ₹${p.originalPrice - p.price}</div>` : ''}
                    <img src="${cleanImgUrl}" alt="${p.name}" style="max-height: 200px; max-width: 100%; object-fit: contain; transition: transform 0.4s ease;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
                </div>
                <div style="padding: 25px; flex: 1; display: flex; flex-direction: column;">
                    <div style="color: #FFD700; font-size: 0.9rem; margin-bottom: 8px;"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i> <span style="color: var(--text-muted);">(4.8/5)</span></div>
                    <h3 style="font-size: 1.3rem; margin-bottom: 10px; color: var(--primary-blue);">${p.name}</h3>
                    <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.5; margin-bottom: 20px; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${p.desc}</p>
                    
                    <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 20px;">
                        <span style="font-size: 1.8rem; font-weight: 800; color: var(--text-dark);">₹${p.price}</span>
                        ${p.originalPrice > p.price ? `<span style="text-decoration: line-through; color: var(--text-muted); font-size: 1.1rem;">₹${p.originalPrice}</span>` : ''}
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <button class="btn btn-outline add-to-cart-btn" data-id="${p.id || p.name}" data-name="${String(p.name).replace(/"/g, '&quot;')}" data-price="${p.price}" data-img="${cleanImgUrl}" style="padding: 12px; font-weight: bold;"><i class="fas fa-cart-plus"></i> Add</button>
                        <button class="btn btn-primary buy-now-btn" data-id="${p.id || p.name}" data-name="${String(p.name).replace(/"/g, '&quot;')}" data-price="${p.price}" data-img="${cleanImgUrl}" style="padding: 12px; font-weight: bold;">Buy Now</button>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    });

    // Render Services dynamically into any container with class .dynamic-service-grid
    const serviceGrids = document.querySelectorAll('.dynamic-service-grid');
    serviceGrids.forEach(grid => {
        grid.innerHTML = services.map((s, idx) => `
        <div class="program-card animate-up" style="animation-delay: ${idx * 0.1}s;">
            <div class="program-header">
                <div class="program-icon"><i class="${s.icon || 'fas fa-star'}"></i></div>
                <h3>${s.name}</h3>
                <p class="text-muted">${s.desc}</p>
            </div>
            <div class="program-body">
                <ul class="program-features">
                    ${(s.features || []).map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
                </ul>
                <a href="quiz.html" class="btn btn-outline" style="width: 100%;">View Details & Pricing</a>
            </div>
        </div>
        `).join('');
    });

    // Re-observe newly injected elements for scroll animations
    if (window.scrollObserver) {
        document.querySelectorAll('.dynamic-service-grid .animate-up, .dynamic-product-grid .animate-up').forEach(el => {
            window.scrollObserver.observe(el);
        });
    }

    // Global event listener for Add/Buy buttons to prevent inline syntax errors
    document.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.add-to-cart-btn');
        if (addBtn) {
            const priceNum = Number(String(addBtn.dataset.price).replace(/[^0-9.-]+/g,"")) || 0;
            if(window.addToCart) {
                window.addToCart(addBtn.dataset.id, addBtn.dataset.name, priceNum, addBtn.dataset.img);
            } else {
                alert("Cart system is still loading, please wait a moment.");
            }
        }

        const buyBtn = e.target.closest('.buy-now-btn');
        if (buyBtn) {
            const priceNum = Number(String(buyBtn.dataset.price).replace(/[^0-9.-]+/g,"")) || 0;
            if(window.addToCart) {
                window.addToCart(buyBtn.dataset.id, buyBtn.dataset.name, priceNum, buyBtn.dataset.img);
                window.location.href = 'checkout.html';
            } else {
                alert("Cart system is still loading, please wait a moment.");
            }
        }
    });
});
