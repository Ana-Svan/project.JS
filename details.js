document.addEventListener('DOMContentLoaded', () => {
  const productDetails = document.getElementById('product-details');

  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get('id'));



  async function fetchProducts() {
    try {
      const response = await fetch('https://restaurant.stepprojects.ge/api/Products/GetAll');
      const products = await response.json();
      allProducts = products;
      return allProducts;
    } catch (error) {
      console.error('კატეგორიების ჩატვირთვის შეცდომა:', error);
    }
  }

  fetchProducts().then(data => {
    const product = data.find(item => item.id === productId);
    console.log(product);
    showProduct(product);
  });

  function showProduct(product) {
    if (!product) {
      productDetails.innerHTML = '<p>Produkt nicht gefunden.</p>';
      return;
    }

    const nuts = product.nuts ? 'Yes' : 'No';
    const vegeterian = product.vegeterian ? 'Yes' : 'No';

    productDetails.innerHTML = `
    <div class='product-card-details'>
    <img src="${product.image}" alt="${product.name}" class="product-image">
    <div class="product-info">
      <h2>${product.name}</h2>
      <p><strong>Preis:</strong> ${product.price} €</p>
      <p><strong>Schärfe:</strong> ${product.spiciness}</p>
      <p><strong>Enthält Nüsse:</strong> ${nuts}</p>
      <p><strong>Vegetarisch:</strong> ${vegeterian}</p>
    </div>
    </div>
  `;
  }
});
