import { db, isMockMode } from './firebase-config.js';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- SPA Navigation ---
const navItems = document.querySelectorAll('.sidebar .nav-item[data-target]');
const viewSections = document.querySelectorAll('.view-section');
const pageTitle = document.getElementById('pageTitle');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all
        navItems.forEach(nav => nav.classList.remove('active'));
        viewSections.forEach(section => section.classList.remove('active'));
        
        // Add active to clicked
        item.classList.add('active');
        const targetId = item.getAttribute('data-target');
        document.getElementById('view-' + targetId).classList.add('active');
        
        // Update Title
        pageTitle.textContent = item.textContent.trim();
        
        if (targetId === 'products') loadProducts();
        if (targetId === 'services') loadServices();
        if (targetId === 'orders') loadOrders();
        if (targetId === 'settings') loadSettings();
        if (targetId === 'enquiries') loadEnquiries();
    });
});

// --- Mock Data Service (Fallback) ---
// If the user hasn't provided real Firebase keys, we use localStorage so the dashboard works instantly.
const MockDB = {
    get: (collectionName) => JSON.parse(localStorage.getItem(collectionName) || '[]'),
    save: (collectionName, data) => localStorage.setItem(collectionName, JSON.stringify(data)),
    add: (collectionName, item) => {
        const data = MockDB.get(collectionName);
        item.id = Date.now().toString();
        data.push(item);
        MockDB.save(collectionName, data);
    },
    update: (collectionName, id, updatedItem) => {
        let data = MockDB.get(collectionName);
        data = data.map(i => i.id === id ? { ...updatedItem, id } : i);
        MockDB.save(collectionName, data);
    },
    delete: (collectionName, id) => {
        let data = MockDB.get(collectionName);
        data = data.filter(i => i.id !== id);
        MockDB.save(collectionName, data);
    }
};

// Seed Mock DB if empty
if (isMockMode && MockDB.get('products').length === 0) {
    MockDB.add('products', {
        name: 'Whey Protein Isolate', price: 2999, originalPrice: 3999, category: 'Supplement', images: ['../assets/product_supplements.png'], desc: 'Premium protein.'
    });
    MockDB.add('products', {
        name: 'Pre-Workout Blast', price: 1499, originalPrice: 1999, category: 'Supplement', images: ['../assets/product_supplements.png'], desc: 'High energy formula.'
    });
}
if (isMockMode && MockDB.get('services').length === 0) {
    MockDB.add('services', {
        name: 'Weight Loss Plan', desc: 'Lose 5-7kg per month', features: ['Customized Indian Diet Chart', 'No starvation or crash diets', 'Weekly Progress Tracking'], icon: 'fas fa-weight'
    });
    MockDB.add('services', {
        name: 'Weight Gain Plan', desc: 'Build healthy muscle mass', features: ['Calorie-surplus delicious meals', 'Focus on muscle, not fat', 'Weekly Video Check-ins'], icon: 'fas fa-dumbbell'
    });
}

if (isMockMode && MockDB.get('enquiries').length === 0) {
    MockDB.add('enquiries', {
        date: new Date().toLocaleDateString(),
        name: 'Amit Sharma',
        email: 'amit@example.com',
        phone: '+91 9876543210',
        goal: 'Weight Loss',
        metrics: '85kg -> 70kg (175cm)',
        details: 'Lifestyle: Sedentary'
    });
}

// --- CRUD Operations: Products ---
const productsTableBody = document.getElementById('productsTableBody');
const productForm = document.getElementById('productForm');

async function loadProducts() {
    productsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading...</td></tr>';
    let products = [];
    
    if (isMockMode) {
        products = MockDB.get('products');
    } else {
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            querySnapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() });
            });
        } catch (e) {
            console.error("Error reading Firestore", e);
            productsTableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Error loading database: ${e.message}</td></tr>`;
            return;
        }
    }
    
    document.getElementById('stat-products').textContent = products.length;
    renderProductsTable(products);
}

function renderProductsTable(products) {
    if (products.length === 0) {
        productsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No products found.</td></tr>';
        return;
    }
    
    productsTableBody.innerHTML = products.map(p => {
        const firstImg = (p.images && p.images.length > 0) ? p.images[0] : (p.img || '../assets/placeholder.png');
        const moreCount = (p.images && p.images.length > 1) ? `<div style="font-size: 0.7rem; color: var(--text-muted); text-align: center; margin-top: 2px;">+${p.images.length - 1}</div>` : '';
        
        return `
        <tr>
            <td style="width: 60px;">
                <img src="${firstImg}" width="40" height="40" style="border-radius: 4px; object-fit: cover; border: 1px solid var(--border-color);">
                ${moreCount}
            </td>
            <td><strong>${p.name}</strong></td>
            <td>₹${p.price} <small style="text-decoration:line-through; color:#999;">₹${p.originalPrice}</small></td>
            <td><span class="badge badge-success">${p.category}</span></td>
            <td>
                <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.8rem;" onclick="editProduct('${p.id}')">Edit</button>
                <button class="btn btn-danger" style="padding: 5px 10px; font-size: 0.8rem;" onclick="deleteProduct('${p.id}')">Delete</button>
            </td>
        </tr>
        `;
    }).join('');
}

// --- Image Upload & Auto-Resize Logic ---
let currentProductImages = [];
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const prodImgUpload = document.getElementById('prodImgUpload');

function renderImagePreviews() {
    imagePreviewContainer.innerHTML = '';
    currentProductImages.forEach((src, index) => {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        
        const img = document.createElement('img');
        img.src = src;
        img.style.width = '80px';
        img.style.height = '80px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '4px';
        img.style.border = '1px solid var(--border-color)';
        
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '&times;';
        removeBtn.style.position = 'absolute';
        removeBtn.style.top = '-5px';
        removeBtn.style.right = '-5px';
        removeBtn.style.background = 'var(--primary-red)';
        removeBtn.style.color = 'white';
        removeBtn.style.border = 'none';
        removeBtn.style.borderRadius = '50%';
        removeBtn.style.width = '20px';
        removeBtn.style.height = '20px';
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.lineHeight = '20px';
        removeBtn.style.padding = '0';
        removeBtn.onclick = (e) => {
            e.preventDefault();
            currentProductImages.splice(index, 1);
            renderImagePreviews();
        };
        
        wrapper.appendChild(img);
        wrapper.appendChild(removeBtn);
        imagePreviewContainer.appendChild(wrapper);
    });
}

function resizeImage(file, maxWidth = 800) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // Compress to 80% quality JPEG
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

prodImgUpload.addEventListener('change', async (e) => {
    const files = e.target.files;
    for (let i = 0; i < files.length; i++) {
        const base64Img = await resizeImage(files[i]);
        currentProductImages.push(base64Img);
    }
    renderImagePreviews();
    prodImgUpload.value = ''; // clear input
});

// Handle Form Submit
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (currentProductImages.length === 0) {
        alert("Please upload at least one image.");
        return;
    }
    
    const id = document.getElementById('prodId').value;
    
    const productData = {
        name: document.getElementById('prodName').value,
        price: Number(document.getElementById('prodPrice').value),
        originalPrice: Number(document.getElementById('prodOriginalPrice').value),
        category: document.getElementById('prodCategory').value,
        desc: document.getElementById('prodDesc').value,
        images: currentProductImages
    };
    
    if (isMockMode) {
        if (id) { MockDB.update('products', id, productData); } 
        else { MockDB.add('products', productData); }
    } else {
        try {
            if (id) {
                await updateDoc(doc(db, "products", id), productData);
            } else {
                await addDoc(collection(db, "products"), productData);
            }
        } catch(e) {
            alert('Firebase Error: ' + e.message);
            return;
        }
    }
    
    
    currentProductImages = [];
    renderImagePreviews();
    closeModal('productModal');
    loadProducts(); // Refresh
});

// Global functions for inline HTML event handlers
window.deleteProduct = async function(id) {
    if(!confirm('Are you sure you want to delete this product?')) return;
    
    if (isMockMode) {
        MockDB.delete('products', id);
    } else {
        try { await deleteDoc(doc(db, "products", id)); } 
        catch(e) { alert(e.message); return; }
    }
    loadProducts();
}

window.editProduct = function(id) {
    let product;
    if (isMockMode) {
        product = MockDB.get('products').find(p => p.id === id);
    } else {
        // Simple hack: Instead of re-fetching, we can grab it from local state
        // For production, we'd fetch or use a state manager.
        alert("Edit in real Firestore mode requires state management. Check implementation.");
        return;
    }
    
    if (product) {
        document.getElementById('prodId').value = product.id;
        document.getElementById('prodName').value = product.name;
        document.getElementById('prodPrice').value = product.price;
        document.getElementById('prodOriginalPrice').value = product.originalPrice;
        document.getElementById('prodCategory').value = product.category;
        document.getElementById('prodDesc').value = product.desc;
        
        currentProductImages = product.images ? [...product.images] : (product.img ? [product.img] : []);
        renderImagePreviews();
        
        document.getElementById('productModalTitle').textContent = 'Edit Product';
        openModal('productModal');
    }
}

// --- CRUD Operations: Services ---
const servicesTableBody = document.getElementById('servicesTableBody');
const serviceForm = document.getElementById('serviceForm');

async function loadServices() {
    servicesTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Loading...</td></tr>';
    let services = [];
    
    if (isMockMode) {
        services = MockDB.get('services');
    } else {
        try {
            const querySnapshot = await getDocs(collection(db, "services"));
            querySnapshot.forEach((doc) => {
                services.push({ id: doc.id, ...doc.data() });
            });
        } catch (e) {
            console.error("Error reading Firestore", e);
            servicesTableBody.innerHTML = `<tr><td colspan="4" style="color:red;">Error loading database: ${e.message}</td></tr>`;
            return;
        }
    }
    
    renderServicesTable(services);
}

function renderServicesTable(services) {
    if (services.length === 0) {
        servicesTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No services found.</td></tr>';
        return;
    }
    
    servicesTableBody.innerHTML = services.map(s => `
        <tr>
            <td><i class="${s.icon}" style="color: var(--primary-red); margin-right: 10px;"></i> <strong>${s.name}</strong></td>
            <td>${s.desc}</td>
            <td>${s.features ? s.features.length + ' features' : ''}</td>
            <td>
                <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.8rem;" onclick="editService('${s.id}')">Edit</button>
                <button class="btn btn-danger" style="padding: 5px 10px; font-size: 0.8rem;" onclick="deleteService('${s.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

if(serviceForm) {
    serviceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('srvId').value;
        const serviceData = {
            name: document.getElementById('srvName').value,
            desc: document.getElementById('srvDesc').value,
            icon: document.getElementById('srvIcon').value,
            features: document.getElementById('srvFeatures').value.split(',').map(f => f.trim()).filter(f => f.length > 0)
        };
        
        if (isMockMode) {
            if (id) { MockDB.update('services', id, serviceData); } 
            else { MockDB.add('services', serviceData); }
        } else {
            try {
                if (id) {
                    await updateDoc(doc(db, "services", id), serviceData);
                } else {
                    await addDoc(collection(db, "services"), serviceData);
                }
            } catch(e) {
                alert('Firebase Error: ' + e.message);
                return;
            }
        }
        
        closeModal('serviceModal');
        loadServices();
    });
}

window.deleteService = async function(id) {
    if(!confirm('Are you sure you want to delete this service?')) return;
    
    if (isMockMode) {
        MockDB.delete('services', id);
    } else {
        try { await deleteDoc(doc(db, "services", id)); } 
        catch(e) { alert(e.message); return; }
    }
    loadServices();
}

window.editService = function(id) {
    let service;
    if (isMockMode) {
        service = MockDB.get('services').find(s => s.id === id);
    } else {
        alert("Edit in real Firestore mode requires state management. Check implementation.");
        return;
    }
    
    if (service) {
        document.getElementById('srvId').value = service.id;
        document.getElementById('srvName').value = service.name;
        document.getElementById('srvDesc').value = service.desc;
        document.getElementById('srvIcon').value = service.icon || 'fas fa-star';
        document.getElementById('srvFeatures').value = service.features ? service.features.join(', ') : '';
        document.getElementById('serviceModalTitle').textContent = 'Edit Program/Service';
        openModal('serviceModal');
    }
}

// --- Orders View ---
const ordersTableBody = document.getElementById('ordersTableBody');
async function loadOrders() {
    ordersTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading...</td></tr>';
    
    // In mock mode, fetch from localStorage
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    if (orders.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No orders found.</td></tr>';
        return;
    }

    ordersTableBody.innerHTML = orders.map(o => `
        <tr>
            <td><strong>${o.id}</strong><br><small class="text-muted">${o.date}</small></td>
            <td>${o.customer.name}<br><small>${o.customer.phone}</small></td>
            <td>₹${o.total.toLocaleString()}</td>
            <td><span class="badge ${o.paymentMethod === 'online' ? 'badge-blue' : 'badge-red'}">${o.paymentMethod.toUpperCase()}</span></td>
            <td><span class="badge" style="background:#eee; color:#333;">${o.status}</span></td>
            <td>
                <button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.8rem;" onclick="viewOrderDetails('${o.id}')">View</button>
            </td>
        </tr>
    `).join('');
}

window.viewOrderDetails = function(id) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    const o = orders.find(x => x.id === id);
    if(o) {
        let itemsStr = o.items.map(i => `${i.qty}x ${i.name}`).join('\\n');
        alert(`Order ${o.id}\\n\\nCustomer: ${o.customer.name}\\nEmail: ${o.customer.email}\\nAddress: ${o.customer.address}\\n\\nItems:\\n${itemsStr}\\n\\nTotal: ₹${o.total.toLocaleString()}`);
    }
}

// --- Settings View ---
const settingsForm = document.getElementById('settingsForm');

async function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || { paymentLink: '' };
    document.getElementById('setPaymentLink').value = settings.paymentLink;
}

if(settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const settings = {
            paymentLink: document.getElementById('setPaymentLink').value
        };
        localStorage.setItem('settings', JSON.stringify(settings));
        alert('Settings saved successfully! The checkout page will now redirect here for online payments.');
    });
}

// --- Enquiries View ---
const enquiriesTableBody = document.getElementById('enquiriesTableBody');
async function loadEnquiries() {
    enquiriesTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading...</td></tr>';
    
    let enquiries = [];
    if (isMockMode) {
        enquiries = MockDB.get('enquiries');
    } else {
        try {
            const querySnapshot = await getDocs(collection(db, "enquiries"));
            querySnapshot.forEach((doc) => {
                enquiries.push({ id: doc.id, ...doc.data() });
            });
        } catch (e) {
            console.error("Firestore Error", e);
            enquiriesTableBody.innerHTML = `<tr><td colspan="6" style="color:red;">Error: ${e.message}</td></tr>`;
            return;
        }
    }
    
    if (enquiries.length === 0) {
        enquiriesTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No enquiries found.</td></tr>';
        return;
    }

    enquiriesTableBody.innerHTML = enquiries.map(e => `
        <tr>
            <td>${e.date || 'N/A'}</td>
            <td><strong>${e.name}</strong></td>
            <td>${e.phone}<br><small>${e.email}</small></td>
            <td><span class="badge badge-blue">${e.goal}</span></td>
            <td>${e.metrics}</td>
            <td>
                <button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.8rem;" onclick="viewEnquiryDetails('${e.id}')">Details</button>
            </td>
        </tr>
    `).join('');
}

window.viewEnquiryDetails = function(id) {
    let enquiries = isMockMode ? MockDB.get('enquiries') : []; // In real mode, we should fetch or use a state
    const e = enquiries.find(x => x.id === id);
    if(e) {
        alert(`Enquiry Details\\n\\nName: ${e.name}\\nPhone: ${e.phone}\\nEmail: ${e.email}\\n\\nGoal: ${e.goal}\\nMetrics: ${e.metrics}\\nOther: ${e.details || 'N/A'}`);
    } else {
        alert("Details available in Mock Mode. Real Firestore requires state management.");
    }
}

// Initialize Overview Stats
setTimeout(() => {
    if (isMockMode) {
        document.getElementById('stat-products').textContent = MockDB.get('products').length;
        document.getElementById('stat-orders').textContent = (JSON.parse(localStorage.getItem('orders')) || []).length;
        document.getElementById('stat-enquiries').textContent = (JSON.parse(localStorage.getItem('enquiries')) || []).length;
    }
}, 500);
