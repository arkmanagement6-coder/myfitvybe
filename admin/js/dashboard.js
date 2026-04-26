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
        
        // Load data based on view
        if (targetId === 'products') loadProducts();
        if (targetId === 'inquiries') loadInquiries();
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

// Handle Form Submit
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('prodId').value;
    const imgInput = document.getElementById('prodImg').value;
    const images = imgInput.split('\n').map(url => url.trim()).filter(url => url.length > 0);
    
    const productData = {
        name: document.getElementById('prodName').value,
        price: Number(document.getElementById('prodPrice').value),
        originalPrice: Number(document.getElementById('prodOriginalPrice').value),
        category: document.getElementById('prodCategory').value,
        desc: document.getElementById('prodDesc').value,
        images: images
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
        
        const imgUrls = product.images ? product.images.join('\n') : (product.img || '');
        document.getElementById('prodImg').value = imgUrls;
        
        document.getElementById('productModalTitle').textContent = 'Edit Product';
        openModal('productModal');
    }
}

// --- Inquiries View ---
async function loadInquiries() {
    // Coming soon stub
    const inquiriesTableBody = document.getElementById('inquiriesTableBody');
    inquiriesTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No inquiries found. Ensure forms are pointing to Firebase.</td></tr>';
}

// Initialize Overview Stats
setTimeout(() => {
    if (isMockMode) {
        document.getElementById('stat-products').textContent = MockDB.get('products').length;
        document.getElementById('stat-inquiries').textContent = "0";
    }
}, 500);
