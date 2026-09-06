// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(window.firebaseConfig);
}

// Initialize Firestore reference
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
    // --- Mobile Navigation Menu ---
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const navRightContainer = document.querySelector(".nav-right-container");

    if (mobileMenuBtn && navRightContainer) {
        mobileMenuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            navRightContainer.classList.toggle("active");
        });

        document.addEventListener("click", (e) => {
            if (
                navRightContainer.classList.contains("active") &&
                !navRightContainer.contains(e.target) &&
                !mobileMenuBtn.contains(e.target)
            ) {
                navRightContainer.classList.remove("active");
            }
        });
    }
    // --- Donation Page Interactive Logic ---
    const amountBtns = document.querySelectorAll(".amount-btn");
    const customAmountInput = document.getElementById("customAmount");
    const btnAmountText = document.getElementById("btnAmountText");
    const paymentOptions = document.querySelectorAll(".payment-option");
    const donationForm = document.getElementById("donationForm");
    const thankYouModal = document.getElementById("thankYouModal");
    const closeModalBtn = document.getElementById("closeModalBtn");

    if (donationForm) {
        // Sync amount buttons with custom input & button text
        amountBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                amountBtns.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");

                const val = btn.getAttribute("data-amount");
                if (customAmountInput) customAmountInput.value = val;
                if (btnAmountText) btnAmountText.textContent = val;
            });
        });

        if (customAmountInput) {
            customAmountInput.addEventListener("input", (e) => {
                amountBtns.forEach((b) => b.classList.remove("active"));
                const val = e.target.value || 0;
                if (btnAmountText) btnAmountText.textContent = val;
            });
        }

        // Toggle Payment Option Active State
        paymentOptions.forEach((option) => {
            option.addEventListener("click", () => {
                paymentOptions.forEach((o) => o.classList.remove("active"));
                option.classList.add("active");
                const radio = option.querySelector("input[type='radio']");
                if (radio) radio.checked = true;
            });
        });

        // Handle Form Submit
        donationForm.addEventListener("submit", (e) => {
            e.preventDefault();
            if (thankYouModal) {
                thankYouModal.classList.add("active");
            }
        });

        if (closeModalBtn) {
            closeModalBtn.addEventListener("click", () => {
                thankYouModal.classList.remove("active");
                donationForm.reset();
                btnAmountText.textContent = "5";
                amountBtns[0].click();
            });
        }
    }
    // --- Lightbox Modal Logic ---
    const galleryImages = Array.from(document.querySelectorAll(".gallery-img"));
    const lightboxModal = document.getElementById("lightboxModal");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxClose = document.getElementById("lightboxClose");
    const lightboxPrev = document.getElementById("lightboxPrev");
    const lightboxNext = document.getElementById("lightboxNext");

    let currentIndex = 0;

    if (lightboxModal && lightboxImg && galleryImages.length > 0) {
        // Function to show image at specific index
        const showImage = (index) => {
            if (index < 0) {
                currentIndex = galleryImages.length - 1;
            } else if (index >= galleryImages.length) {
                currentIndex = 0;
            } else {
                currentIndex = index;
            }
            const targetImg = galleryImages[currentIndex];
            lightboxImg.src = targetImg.src;
            lightboxImg.alt = targetImg.alt || "Enlarged photo";
        };

        // Open lightbox when clicking any gallery image
        galleryImages.forEach((img, idx) => {
            img.addEventListener("click", (e) => {
                e.stopPropagation();
                showImage(idx);
                lightboxModal.classList.add("active");
                document.body.style.overflow = "hidden"; // Prevent background scrolling
            });
        });

        // Close Lightbox
        const closeLightbox = () => {
            lightboxModal.classList.remove("active");
            document.body.style.overflow = ""; // Restore scrolling
        };

        // Close button click
        if (lightboxClose) {
            lightboxClose.addEventListener("click", (e) => {
                e.stopPropagation();
                closeLightbox();
            });
        }

        // Prev button click
        if (lightboxPrev) {
            lightboxPrev.addEventListener("click", (e) => {
                e.stopPropagation();
                showImage(currentIndex - 1);
            });
        }

        // Next button click
        if (lightboxNext) {
            lightboxNext.addEventListener("click", (e) => {
                e.stopPropagation();
                showImage(currentIndex + 1);
            });
        }

        // Close when clicking directly on dark backdrop (outside controls/image)
        lightboxModal.addEventListener("click", (e) => {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });

        // Keyboard Controls (Left, Right, Escape)
        document.addEventListener("keydown", (e) => {
            if (!lightboxModal.classList.contains("active")) return;

            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") showImage(currentIndex - 1);
            if (e.key === "ArrowRight") showImage(currentIndex + 1);
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    // Mobile Navigation Toggle
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const navLinks = document.getElementById("navLinks");

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener("click", function () {
            navLinks.classList.toggle("active");
            const expanded = mobileMenuBtn.getAttribute("aria-expanded") === "true" || false;
            mobileMenuBtn.setAttribute("aria-expanded", !expanded);
        });
    }

    // Gallery Image Lightbox (Enlarge on click)
    const lightbox = document.getElementById("imageLightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const closeBtn = document.getElementById("closeLightbox");

    // Select all images inside gallery cards/containers
    const galleryImages = document.querySelectorAll(".gallery-card img, .gallery-item img, .gallery-grid img");

    if (lightbox && lightboxImg) {
        galleryImages.forEach((img) => {
            img.style.cursor = "pointer";
            img.addEventListener("click", function () {
                lightboxImg.src = this.src;
                lightboxImg.alt = this.alt || "Gallery Image";
                lightbox.style.display = "flex";
            });
        });

        // Close modal when clicking the close button or outside the image
        if (closeBtn) {
            closeBtn.addEventListener("click", function () {
                lightbox.style.display = "none";
            });
        }

        lightbox.addEventListener("click", function (e) {
            if (e.target !== lightboxImg) {
                lightbox.style.display = "none";
            }
        });
    }
});
/* --- Orders (drinks only) and staff pages JS (append) --- */
(function () {
    document.addEventListener("DOMContentLoaded", () => {
        // Shared helpers
        const formatUSD = (n) => "USD " + Number(n || 0).toFixed(2);
        const ORDERS_KEY = "orders"; // localStorage key; replace with server POST if available
        const ORDER_API_URL = window.ORDER_API_URL || null; // set this globally if you have a backend

        // ---------- ORDER PAGE LOGIC ----------
        const menuList = document.getElementById("menuList");
        const orderForm = document.getElementById("orderForm");
        if (menuList && orderForm) {
            const cartItemsContainer = document.getElementById("cartItems");
            const subtotalEl = document.getElementById("subtotal");
            const deliveryEl = document.getElementById("delivery");
            const totalEl = document.getElementById("total");
            const orderSuccessModal = document.getElementById("orderSuccessModal");
            const closeSuccess = document.getElementById("closeSuccess");
            const clearCartBtn = document.getElementById("clearCartBtn");

            let cart = [];

            function calculateTotals() {
                const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
                const delivery = subtotal >= 10 ? 0 : subtotal === 0 ? 0 : 0.5;
                const total = subtotal + delivery;
                if (subtotalEl) subtotalEl.textContent = formatUSD(subtotal);
                if (deliveryEl) deliveryEl.textContent = formatUSD(delivery);
                if (totalEl) totalEl.textContent = formatUSD(total);
                return { subtotal, delivery, total };
            }

            function renderCart() {
                cartItemsContainer.innerHTML = "";
                if (cart.length === 0) {
                    cartItemsContainer.innerHTML = '<p class="muted">No items yet. Use the menu to add items.</p>';
                } else {
                    cart.forEach((it, idx) => {
                        const div = document.createElement("div");
                        div.className = "cart-item";
                        div.innerHTML = `
              <div>
                <div><strong>${it.name}</strong></div>
                <div class="muted">USD ${it.price.toFixed(2)} × ${it.qty}</div>
              </div>
              <div style="text-align:right;">
                <div><strong>USD ${(it.price * it.qty).toFixed(2)}</strong></div>
                <div style="margin-top:6px;">
                  <button class="btn btn-secondary-outline decrease" data-idx="${idx}">-</button>
                  <button class="btn btn-secondary-outline increase" data-idx="${idx}">+</button>
                  <button class="remove-btn" data-idx="${idx}" title="Remove">✕</button>
                </div>
              </div>
            `;
                        cartItemsContainer.appendChild(div);
                    });
                }
                calculateTotals();
            }

            function addToCart(id, name, price, qty) {
                qty = Math.max(1, parseInt(qty || 1, 10));
                const existing = cart.find((c) => c.id === id);
                if (existing) existing.qty += qty;
                else cart.push({ id, name, price, qty });
                renderCart();
            }

            // attach add buttons
            menuList.querySelectorAll(".menu-card").forEach((card) => {
                const addBtn = card.querySelector(".add-item-btn");
                if (!addBtn) return;
                addBtn.addEventListener("click", () => {
                    const id = card.dataset.id;
                    const name = card.dataset.name;
                    const price = parseFloat(card.dataset.price);
                    const qtyInput = card.querySelector(".item-qty");
                    const qty = qtyInput ? parseInt(qtyInput.value || 1, 10) : 1;
                    addToCart(id, name, price, qty);
                });
            });

            // cart button delegation
            cartItemsContainer.addEventListener("click", (e) => {
                const btn = e.target.closest("button");
                if (!btn) return;
                const idx = Number(btn.getAttribute("data-idx"));
                if (btn.classList.contains("decrease")) {
                    cart[idx].qty = Math.max(1, cart[idx].qty - 1);
                    renderCart();
                } else if (btn.classList.contains("increase")) {
                    cart[idx].qty = cart[idx].qty + 1;
                    renderCart();
                } else if (btn.classList.contains("remove-btn")) {
                    cart.splice(idx, 1);
                    renderCart();
                }
            });

            if (clearCartBtn)
                clearCartBtn.addEventListener("click", () => {
                    cart = [];
                    renderCart();
                });

            // submit order
            orderForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                if (cart.length === 0) {
                    alert("Please add at least one item to your cart.");
                    return;
                }
                const name = document.getElementById("fullName").value.trim();
                const building = document.getElementById("building").value;
                const room = document.getElementById("room").value.trim();
                const phone = document.getElementById("phone").value.trim();
                if (!name || !building || !room) {
                    alert("Please provide your name, building, and room.");
                    return;
                }

                const totals = calculateTotals();
                const order = {
                    id: Date.now(),
                    name,
                    building,
                    room,
                    phone,
                    items: cart.slice(),
                    subtotal: totals.subtotal,
                    delivery: totals.delivery,
                    total: totals.total,
                    status: "pending",
                    createdAt: new Date().toISOString()
                };

                // If you have a backend, set window.ORDER_API_URL to the endpoint and implement server-side storing.
                if (ORDER_API_URL) {
                    try {
                        await fetch(ORDER_API_URL, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(order)
                        });
                    } catch (err) {
                        console.warn("Server order failed, saving locally instead.", err);
                        const existing = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
                        existing.push(order);
                        localStorage.setItem(ORDERS_KEY, JSON.stringify(existing));
                    }
                } else {
                    const existing = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
                    existing.push(order);
                    localStorage.setItem(ORDERS_KEY, JSON.stringify(existing));
                }

                // clear and show success
                cart = [];
                renderCart();
                orderForm.reset();
                if (subtotalEl) subtotalEl.textContent = formatUSD(0);
                if (deliveryEl) deliveryEl.textContent = formatUSD(0);
                if (totalEl) totalEl.textContent = formatUSD(0);
                const successMessage = document.getElementById("successMessage");
                if (successMessage) {
                    successMessage.textContent = `Thanks ${order.name}! Your order total is ${formatUSD(order.total)}. It will be delivered to building ${order.building}, room ${order.room}.`;
                }
                if (orderSuccessModal) {
                    orderSuccessModal.classList.add("active");
                    orderSuccessModal.style.display = "flex";
                }
            });

            if (closeSuccess)
                closeSuccess.addEventListener("click", () => {
                    const orderSuccessModal = document.getElementById("orderSuccessModal");
                    if (orderSuccessModal) {
                        orderSuccessModal.classList.remove("active");
                        orderSuccessModal.style.display = "none";
                    }
                });

            renderCart();
        } // end order page logic

        // ---------- STAFF PAGE LOGIC ----------
        const staffLogin = document.getElementById("staffLogin");
        const ordersPanel = document.getElementById("ordersPanel");
        if (staffLogin && ordersPanel) {
            // CONFIG: change the PIN here if needed (client-side only)
            const STAFF_PIN = window.STAFF_PIN || "1234"; // change to your secret PIN

            const staffPinInput = document.getElementById("staffPin");
            const staffLoginBtn = document.getElementById("staffLoginBtn");
            const ordersList = document.getElementById("ordersList");
            const refreshBtn = document.getElementById("refreshOrders");
            const logoutBtn = document.getElementById("logoutBtn");

            function getOrders() {
                if (ORDER_API_URL) {
                    // if you later provide a server endpoint, fetch from it instead
                    return fetch(ORDER_API_URL)
                        .then((r) => r.json())
                        .catch(() => JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]"));
                }
                return Promise.resolve(JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]"));
            }

            function saveOrders(orders) {
                if (ORDER_API_URL) {
                    // ideally send updates to server; fallback to localStorage
                    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
                } else {
                    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
                }
            }

            function renderOrdersUI(orders) {
                ordersList.innerHTML = "";
                if (!orders || orders.length === 0) {
                    ordersList.innerHTML = "<p class='muted'>No orders yet.</p>";
                    return;
                }

                const table = document.createElement("table");
                table.className = "order-table";
                table.innerHTML = `
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Time</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody></tbody>
        `;
                const tbody = table.querySelector("tbody");

                orders
                    .slice()
                    .reverse()
                    .forEach((o) => {
                        const tr = document.createElement("tr");
                        const itemsHtml = o.items.map((it) => `${it.name} × ${it.qty}`).join("<br/>");
                        tr.innerHTML = `
            <td>#${o.id}</td>
            <td>${o.name}<br/><small>${o.building} / ${o.room}${o.phone ? "<br/>" + o.phone : ""}</small></td>
            <td>${itemsHtml}</td>
            <td>${formatUSD(o.total)}</td>
            <td>${new Date(o.createdAt).toLocaleString()}</td>
            <td><span class="order-status ${o.status}">${o.status}</span></td>
            <td>
              <button class="btn btn-secondary-outline fulfill-btn" data-id="${o.id}">Mark fulfilled</button>
              <button class="btn btn-secondary-outline delete-btn" data-id="${o.id}">Delete</button>
            </td>
          `;
                        tbody.appendChild(tr);
                    });

                ordersList.appendChild(table);
            }

            function lockUI() {
                staffLogin.style.display = "";
                ordersPanel.style.display = "none";
            }
            function unlockUI() {
                staffLogin.style.display = "none";
                ordersPanel.style.display = "";
            }

            // check sessionStorage for previous auth
            if (sessionStorage.getItem("staffAuth") === "1") {
                unlockUI();
                getOrders().then(renderOrdersUI);
            } else {
                lockUI();
            }

            staffLoginBtn.addEventListener("click", async () => {
                const pin = (staffPinInput.value || "").trim();
                if (!pin) return alert("Enter staff PIN.");
                if (pin === STAFF_PIN) {
                    sessionStorage.setItem("staffAuth", "1");
                    unlockUI();
                    const orders = await getOrders();
                    renderOrdersUI(orders);
                } else {
                    alert("Incorrect PIN.");
                }
            });

            // Delegated actions: fulfill, delete
            ordersList.addEventListener("click", async (e) => {
                const btn = e.target.closest("button");
                if (!btn) return;
                const id = Number(btn.getAttribute("data-id"));
                let orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
                const idx = orders.findIndex((o) => o.id === id);
                if (idx === -1) return;
                if (btn.classList.contains("fulfill-btn")) {
                    orders[idx].status = "fulfilled";
                    saveOrders(orders);
                    renderOrdersUI(orders);
                } else if (btn.classList.contains("delete-btn")) {
                    if (!confirm("Delete this order?")) return;
                    orders.splice(idx, 1);
                    saveOrders(orders);
                    renderOrdersUI(orders);
                }
            });

            refreshBtn.addEventListener("click", async () => {
                const orders = await getOrders();
                renderOrdersUI(orders);
            });

            logoutBtn.addEventListener("click", () => {
                sessionStorage.removeItem("staffAuth");
                lockUI();
            });
        } // end staff logic
    }); // DOMContentLoaded
})();
