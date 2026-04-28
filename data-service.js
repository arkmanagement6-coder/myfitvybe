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

    let products = JSON.parse(localStorage.getItem('products')) || [];
    if (products.length === 0) products = fallbackProducts;

    let services = JSON.parse(localStorage.getItem('services')) || [];
    // Force update local storage if it contains the old mock data (3 or fewer items)
    if (services.length === 0 || services.length <= 3) {
        services = fallbackServices;
        localStorage.setItem('services', JSON.stringify(services));
    }

    // Render Products dynamically into any container with class .dynamic-product-grid
    const productGrids = document.querySelectorAll('.dynamic-product-grid');
    productGrids.forEach(grid => {
        grid.innerHTML = products.map(p => {
            const imgUrl = (p.images && p.images.length > 0) ? p.images[0] : (p.img || 'assets/product.png');
            // Clean up relative paths if coming from admin dashboard
            const cleanImgUrl = imgUrl.startsWith('../') ? imgUrl.substring(3) : imgUrl;
            
            return `
            <div class="card product-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <img src="${cleanImgUrl}" alt="${p.name}" class="product-img" style="height: 200px; object-fit: contain;">
                    <h3>${p.name}</h3>
                    <p class="text-muted" style="font-size: 0.9rem; margin-top: 10px; height: 60px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">${p.desc}</p>
                </div>
                <div style="margin-top: 20px;">
                    <div class="product-price" style="margin-top: 0;">₹${p.price} <span class="original-price">₹${p.originalPrice}</span></div>
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button class="btn btn-outline add-to-cart-btn" data-id="${p.id || p.name}" data-name="${String(p.name).replace(/"/g, '&quot;')}" data-price="${p.price}" data-img="${cleanImgUrl}" style="flex:1; padding: 10px; font-size: 0.9rem;"><i class="fas fa-cart-plus"></i> Add</button>
                        <button class="btn btn-primary buy-now-btn" data-id="${p.id || p.name}" data-name="${String(p.name).replace(/"/g, '&quot;')}" data-price="${p.price}" data-img="${cleanImgUrl}" style="flex:1; padding: 10px; font-size: 0.9rem;">Buy Now</button>
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
