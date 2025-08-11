const productsGrid = document.querySelector('.products-grid');
const categoryFilter = document.querySelector('.category-filter');
const cartIcon = document.querySelector('.cart-icon');
const cartModal = document.querySelector('.cart-modal');
const closeModal = document.querySelector('.close-modal');
const cartItemsContainer = document.querySelector('.cart-items');
const cartCount = document.querySelector('.cart-count');
const checkoutBtn = document.querySelector('.checkout-btn');

let loginform = document.querySelector(".login-form");
let regform = document.querySelector(".reg-form");

let phoneLogin = document.querySelector(".phoneLogin")
let passwordLogin = document.querySelector(".passwordLogin")
let btnLogin = document.querySelector(".btnLogin")

let password = document.querySelector(".password");
let regEmail = document.querySelector(".regEmail");
let firstNameReg = document.querySelector(".FirstNamReg");
let lastNameReg = document.querySelector(".LastNamReg");
let numberReg = document.querySelector(".NumberReg");
let btnReg = document.querySelector(".btnReg");


let linkRegister = document.querySelector(".link-register");
let linkLogin = document.querySelector(".link-login");
let cartContent = document.querySelector(".cart");
let logOut = document.querySelector(".logOut")
let filterButton = document.querySelector(".filter-button")
let extraFilter = document.querySelector("#extra-filter")
let extraFilterBtn = document.querySelector('.extra-filter-btn');

let nutsValue = document.querySelector('#nuts');
let vegetarianValue = document.querySelector('#vegetables');
let spicenessValue = document.querySelector('#range');

let spiceLevel = document.querySelector("#spice-level")

let allProducts = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

let categoryId = null;

document.addEventListener('DOMContentLoaded', () => {
  fetchCategories();
  fetchProducts();
  updateCartCount();
});

async function fetchCategories() {
  try {
    const response = await fetch('https://restaurant.stepprojects.ge/api/Categories/GetAll');
    const categories = await response.json();
    displayCategories(categories);
  } catch (error) {
    console.error('კატეგორიების ჩატვირთვის შეცდომა:', error);
  }
}

function displayCategories(categories) {
  const allButton = document.createElement('button');
  allButton.textContent = 'All';
  allButton.dataset.category = 'all';
  allButton.classList.add('active');
  allButton.addEventListener('click', filterProducts);
  categoryFilter.appendChild(allButton);

  categories.forEach(category => {
    const button = document.createElement('button');
    button.textContent = category.name;
    button.dataset.category = category.id;
    button.addEventListener('click', filterProducts);
    categoryFilter.appendChild(button);
  });
}

async function fetchProducts() {
  try {
    const response = await fetch('https://restaurant.stepprojects.ge/api/Products/GetAll');
    const products = await response.json();
    allProducts = products;
    displayProducts(products);
  } catch (error) {
    console.error('პროდუქტების ჩატვირთვის შეცდომა:', error);
  }
}

async function fetchFilteredProducts() {
  try {

    const params = new URLSearchParams();

    params.append('vegetarian', vegetarianValue.checked);
    params.append('nuts', nutsValue.checked);
    params.append('spiceness', spicenessValue.value);

    if (categoryId !== null && categoryId !== 'all') {
      params.append('categoryId', categoryId);
    }


    const response = await fetch(`https://restaurant.stepprojects.ge/api/Products/GetFiltered?${params.toString()}`, {
      method: 'GET'
    });


    const products = await response.json();
    allProducts = products;
    displayProducts(products);
  } catch (error) {
    console.error('პროდუქტების ჩატვირთვის შეცდომა:', error);
  }
}

function displayProducts(products) {
  productsGrid.innerHTML = '';
  products.forEach(product => {
    console.log(product)

    let vegetable = product.vegeterian;
    let nuts = product.nuts;

    if (vegetable === true) {
      vegetableString = 'yes';
    } else {
      vegetableString = 'No';
    }

    if (nuts === true) {
      nutsString = 'Yes';
    } else {
      nutsString = 'No';
    }

    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    productCard.innerHTML = `
      <a href="./details.html?id=${product.id}" class="product-detail"> <img src="${product.image}" alt="${product.name}" class="product-image"> </a>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.price} €</p>
        <p>Spiciness: ${product.spiciness}</p>
        <p>Nuts: ${nutsString}</p>
        <p>Vegetarian:  ${vegetableString}</p>
        <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
      </div>
    `;
    productsGrid.appendChild(productCard);
  });

  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', addToCart);
  });
}

function addToCart(e) {
  const productId = e.target.dataset.id;
  const product = allProducts.find(p => p.id == productId);

  if (!product) return;

  const existingItem = cart.find(item => item.id == productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  }

  updateCartCount();
  saveCartToLocalStorage();
  renderCartItems();

}

function renderCartItems() {
  if (localStorage.getItem("token") !== null) {
    cartContent.classList.add("active");
    loginform.classList.remove("active");
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p>🛒 კალათა ცარიელია</p>';
      return;
    }

    let totalSum = 0;

    cart.forEach((item, index) => {
      const total = item.price * item.quantity;
      totalSum += total;

      const cartItem = document.createElement('div');
      cartItem.classList.add('cart-item');
      cartItem.innerHTML = `
      <div class="item-info">
        <strong>${item.name}</strong><br>
        ფასი: ${item.price} €<br>
        ჯამი: ${total.toFixed(2)} €
      </div>
      <div class="cart-actions">
        <button class="remove-item" data-index="${index}">X remove</button>
        <div class="quantity-controls">
          <button class="decrease-qty" data-id="${item.id}">-</button>
          <span class="qty-number">${item.quantity}</span>
          <button class="increase-qty" data-id="${item.id}">+</button>
        </div>
      </div>
    `;

      cartItemsContainer.appendChild(cartItem);

    });

    const totalDisplay = document.createElement('div');
    totalDisplay.classList.add('cart-total');
    totalDisplay.innerHTML = `<hr><p><strong>სრული ჯამი: ${totalSum.toFixed(2)} €</strong></p>`;
    cartItemsContainer.appendChild(totalDisplay);

    document.querySelectorAll('.remove-item').forEach(button => {
      button.addEventListener('click', removeFromCart);
    });
    document.querySelectorAll('.increase-qty').forEach(button => {
      button.addEventListener('click', increaseQuantity);
    });
    document.querySelectorAll('.decrease-qty').forEach(button => {
      button.addEventListener('click', decreaseQuantity);
    });
  }
}

function increaseQuantity(e) {
  const id = e.target.dataset.id;
  const item = cart.find(p => p.id == id);
  if (item) {
    item.quantity++;
    saveCartToLocalStorage();
    updateCartCount();
    renderCartItems();
  }
}

function decreaseQuantity(e) {
  const id = e.target.dataset.id;
  const item = cart.find(p => p.id == id);
  if (item && item.quantity > 1) {
    item.quantity--;
  } else if (item) {
    cart = cart.filter(p => p.id != id);
  }
  saveCartToLocalStorage();
  updateCartCount();
  renderCartItems();
}

function removeFromCart(e) {
  const index = e.target.dataset.index;
  cart.splice(index, 1);
  saveCartToLocalStorage();
  updateCartCount();
  renderCartItems();
}

function updateCartCount() {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = totalItems;
}

function saveCartToLocalStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

cartIcon.addEventListener('click', () => {
  cartModal.classList.remove('hidden');
  renderCartItems();
});

closeModal.addEventListener('click', () => {
  cartModal.classList.add('hidden');
});

checkoutBtn.addEventListener('click', async () => {
  if (cart.length === 0) return;

  const order = {
    products: cart.map(item => ({
      productId: item.id,
      quantity: item.quantity
    })),
    tableId: "1"
  };

  try {
    const response = await fetch('https://restaurant.stepprojects.ge/api/Orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });

    if (response.ok) {
      alert('შეკვეთა მიღებულია! გმადლობთ!');
      cart = [];
      saveCartToLocalStorage();
      updateCartCount();
      cartModal.classList.add('hidden');
    }
  } catch (error) {
    console.error('შეკვეთის შეცდომა:', error);
  }
});

function filterProducts(e) {
  let selectedCategoryId = e.target.dataset.category;
  categoryId = selectedCategoryId;

  document.querySelectorAll('.category-filter button').forEach(btn => {
    btn.classList.remove('active');
  });
  e.target.classList.add('active');

  if (categoryId === 'all') {
    fetchProducts();
  } else {
  
    fetchFilteredProductsByCategoryId(categoryId);
  }
}


async function fetchFilteredProductsByCategoryId(categoryId) {
  try {

    const params = new URLSearchParams({

      categoryId: categoryId,
    });

    const response = await fetch(`https://restaurant.stepprojects.ge/api/Products/GetFiltered?${params.toString()}`, {
      method: 'GET'
    });


    const products = await response.json();
    allProducts = products;
    displayProducts(products);
  } catch (error) {
    console.error('პროდუქტების ჩატვირთვის შეცდომა:', error);
  }
}



linkRegister.addEventListener("click", (e) => {
  regform.classList.add("active");
  loginform.classList.remove("active");
});

linkLogin.addEventListener("click", (e) => {
  regform.classList.remove("active");
  loginform.classList.add("active")
});

spicenessValue.addEventListener("change", (e) => {
  
  spiceLevel.innerHTML = spicenessValue.value
  
  
});

extraFilterBtn.addEventListener("click", (e) => {
  fetchFilteredProducts();




});





btnLogin.addEventListener("click", (e) => {
  e.preventDefault()
  console.log(phoneLogin.value, passwordLogin.value)

  fetch("https://rentcar.stepprojects.ge/api/Users/login", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "phoneNumber": phoneLogin.value,
      "password": passwordLogin.value
    })
  }).then(resp => resp.json())
    .then(resp => {
      console.log(resp)
      Swal.fire({
        title: "Logged In Successfully",
        icon: "success",
        draggable: true
      });
      localStorage.setItem("token", resp.token)
      cartContent.classList.add("active");
      loginform.classList.remove("active");
      renderCartItems();

    }).catch(resp => {
      Swal.fire({
        icon: "error",
        title: "Incorrect username or password",
        text: "Try again!",
       
      });
    })

})


logOut.addEventListener("click", (e) => {
  localStorage.removeItem("token")
  loginform.classList.add("active");
  cartContent.classList.remove("active");

})


btnReg.addEventListener("click", (e) => {
  e.preventDefault()
  console.log(
    password.value,
    regEmail.value,
    firstNameReg.value, lastNameReg.value, numberReg.value
  )

  fetch("https://rentcar.stepprojects.ge/api/Users/register", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({

      "phoneNumber": numberReg.value,
      "password": password.value,
      "email": regEmail.value,
      "firstName": firstNameReg.value,
      "lastName": lastNameReg.value,

    })
  }).then(resp => resp.json())
    .then(resp => {
      console.log(resp)
      alert("Benutzer wurde registriert");
    })


})



filterButton.addEventListener("click", (e) => {
  extraFilter.classList.toggle("active")
});



///  GET // POST PUT DELETE