import '../../styles/dashboard.css';
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  getDoc,
  collection,
  query,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getStorage, ref, uploadBytes, getDownloadURL,
} from 'firebase/storage';
import appIcon from '../../public/icons/simplebiz-icons.png';
import userIcon from '../../public/icons/user.svg';
import productImage from '../../public/images/produk.jpg';
import closeIcon from '../../public/icons/close.svg';
import firebaseConfig from '../common/config';

// Import necessary functions from the Firestore modul

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

const fetchUserProducts = async (userId) => {
  console.log('Fetching products for user:', userId);
  try {
    const productsRef = collection(db, 'users', userId, 'products');
    const q = query(productsRef);

    const querySnapshot = await getDocs(q);

    const userProducts = [];
    querySnapshot.forEach((doc) => {
      const productData = doc.data();
      const productWithDate = {
        ...productData,
        createdAt: productData.createdAt.toDate(), // Assuming createdAt is a Firestore Timestamp field
      };
      userProducts.push(productWithDate);
    });

    // Return the fetched userProducts without rendering the dashboard
    return userProducts;
  } catch (error) {
    console.error('Error fetching user products:', error.message);
    // Return an empty array or handle the error accordingly
    return [];
  }
};

// Flag to check if the product page has been rendered
let productPageRendered = false;

let user; // Define user variable in a global scope

onAuthStateChanged(auth, async (authUser) => {
  user = authUser; // Store the user in the global variable

  if (user) {
    console.log('User is signed in:', user.uid);

    try {
      // Fetch user products without rendering the dashboard
      const userProducts = await fetchUserProducts(user.uid);

      // Check if the current page is the dashboard before rendering
      const isDashboardPage = window.location.pathname === '/dashboard'; // Adjust the path accordingly

      if (isDashboardPage && !productPageRendered) {
        // Render the dashboard with the fetched userProducts
        renderDashboardPage(document.body, userProducts);
        productPageRendered = true;
      }
    } catch (error) {
      console.error('Error fetching user products:', error.message);
      // Handle the error accordingly
    }
  } else {
    console.log('User is signed out');
    // Handle signed-out state
  }
});

const cartItems = [];
const addToCart = (product) => {
  // Cek apakah produk sudah ada di keranjang
  const existingCartItem = cartItems.find(
    (item) => item.product.id === product.id,
  );

  if (existingCartItem) {
    // Jika produk sudah ada, tambahkan jumlahnya
    existingCartItem.quantity += 1;
  } else {
    // Jika produk belum ada, tambahkan produk baru ke keranjang
    cartItems.push({
      product,
      quantity: 1,
    });
  }

  // Update UI untuk mencerminkan perubahan di keranjang
  updateCartUI(cartItems);
};

let totalPrice = 0;

// Function to update the cart UI based on the current cart items
const updateCartUI = (cartItems) => {
  // Logika untuk mengupdate UI berdasarkan cartItems
  const dashCartList = document.querySelector('.dash-cartList');
  dashCartList.innerHTML = '';

  // Variable untuk menyimpan total harga dan total produk
  let totalProduct = 0;

  // Update the totalPrice variable
  totalPrice = cartItems.reduce(
    (total, cartItem) => total + cartItem.product.price * cartItem.quantity,
    0,
  );

  cartItems.forEach((cartItem) => {
    const cartItemDiv = document.createElement('div');
    cartItemDiv.classList.add('dash-cartItem');

    // Menghitung total harga dan total produk
    const itemPrice = cartItem.product.price * cartItem.quantity;
    totalProduct += cartItem.quantity;
    // Mengupdate total harga dan total produk pada UI
    const totalPriceElement = document.getElementById('totalPrice');
    const totalProductElement = document.getElementById('totalProduct');

    totalPriceElement.textContent = `Rp ${totalPrice}`;
    totalProductElement.textContent = `Rp ${totalProduct}`;

    // Mengupdate nominal pembayaran dan kembalian pada UI
    const totalCashInput = document.getElementById('totalCash');
    const totalChargeElement = document.getElementById('totalCharge');

    // Event listener untuk menghitung kembalian saat mengubah nominal pembayaran
    totalCashInput.addEventListener('input', () => {
      const totalCashValue = parseFloat(totalCashInput.value) || 0;
      const totalChargeValue = totalCashValue - totalPrice;

      totalChargeElement.textContent = `Rp ${Math.max(0, totalChargeValue)}`;
    });

    // Populate cart item container with product information
    cartItemDiv.innerHTML = `
      <img src="${cartItem.product.imageSrc}" alt="${cartItem.product.name}" />
      <div class="detailItem">
        <p id="productName">${cartItem.product.name}</p>
        <p id="productPrice">${cartItem.product.price}</p>
      </div>
      <div class="quantityItem">
        <p>
          Total :
          <span id="quantityItem">${cartItem.quantity}</span>
        </p>
      </div>
    `;

    dashCartList.appendChild(cartItemDiv);
  });

  // Mengupdate total harga dan total produk pada UI
  const totalPriceElement = document.getElementById('totalPrice');
  const totalProductElement = document.getElementById('totalProduct');

  totalPriceElement.textContent = `Rp ${totalPrice}`;
  totalProductElement.textContent = `Rp ${totalProduct}`;

  // Additional logic to update other UI elements if needed
};

const decreaseCartItemQuantity = (productId) => {
  // Find the cart item with the given productId
  const cartItem = cartItems.find((item) => item.product.id === productId);

  // If the cart item is found and the quantity is greater than 1, decrease the quantity
  if (cartItem && cartItem.quantity > 1) {
    cartItem.quantity -= 1;
  } else {
    // If the quantity is 1 or the cart item is not found, remove the item from the cart
    const index = cartItems.findIndex((item) => item.product.id === productId);
    if (index !== -1) {
      cartItems.splice(index, 1);
    }
  }

  // Update UI to reflect the changes in the cart
  updateCartUI(cartItems);
};

const removeProduct = async (productId) => {
  try {
    // Call the new function to decrease the quantity or remove the item from the cart
    decreaseCartItemQuantity(productId);

    console.log('Product quantity decreased in the cart');

    // Additional logic if needed
  } catch (error) {
    console.error('Error handling product removal:', error.message);
    // Handle the error accordingly
  }
};

const addTransactionToFirestore = async (
  userId,
  cartItems,
  totalCashValue,
  totalChargeValue,
  transactionDate,
) => {
  try {
    // Generate a unique document ID based on date
    const documentId = generateDocumentId(transactionDate);

    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const transactionDocRef = doc(transactionsRef, documentId);

    // Generate a unique transaction ID with 2 random letters
    const transactionId = generateTransactionId(transactionDate);

    const newTransaction = {
      products: cartItems.map((item) => ({
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        totalPrice: item.product.price * item.quantity,
      })),
    };

    // Retrieve the existing document
    const existingDoc = await getDoc(transactionDocRef);

    if (existingDoc.exists()) {
      let updatedTransactions;

      if (existingDoc.data() && existingDoc.data().transactions) {
        // If the document has a 'transactions' field, update the array with the new transaction
        updatedTransactions = [
          ...existingDoc.data().transactions,
          newTransaction,
        ];
      } else {
        // If the document does not have a 'transactions' field, create a new array
        updatedTransactions = [newTransaction];
      }

      // Set the updated data back to Firestore
      await setDoc(transactionDocRef, { transactions: updatedTransactions });
    } else {
      // If the document does not exist, create a new one with the 'transactions' field
      await setDoc(transactionDocRef, { transactions: [newTransaction] });
    }

    console.log('Transaction added to Firestore:', newTransaction);

    // Additional logic if needed
  } catch (error) {
    console.error(
      'Error adding transaction to Firestore:',
      error.code,
      error.message,
    );
    console.error('Additional details:', error);
  }
};

const generateDocumentId = (transactionDate) =>
  // Use the transactionDate as the document ID
  transactionDate;
const generateTransactionId = (transactionDate) =>
  // Append 2 random letters to the transactionDate
  `${transactionDate}-${generateRandomLetters(2)}`;
const generateRandomLetters = (length) => Math.random()
  .toString(36)
  .substring(2, 2 + length);

// Function to render products on the dashboard
const renderDashboardProducts = (products) => {
  const productSection = document.querySelector('.productSection');
  const productContainer = productSection.querySelector('.mainProduct');

  // Clear previous products
  productContainer.innerHTML = '';

  // Render each product in the container
  products.forEach((product) => {
    const productDiv = document.createElement('div');
    productDiv.classList.add('subProduct');

    // Populate product container with product information
    productDiv.innerHTML = `
      <div class="productImage">
        <img src="${product.imageSrc}" alt="${product.name}" />
      </div>
      <div class="productDescription">
        <h1 id="productName">${product.name}</h1>
        <h2 id="productPrice">${product.price}</h2>
      </div>
      <div class="buttonProduct">
        <button class="mainButton" id="addProduct">Tambah</button>
        <button class="mainButton" id="removeProduct">Hapus</button>
      </div>
    `;

    productContainer.appendChild(productDiv);

    // Add event listeners for add and remove buttons if needed
    const addProductButton = productDiv.querySelector('#addProduct');
    const removeProductButton = productDiv.querySelector('#removeProduct');

    // Add event listener for add product button
    addProductButton.addEventListener('click', () => {
      addToCart(product);

      // Check if the cart is not already open, then open it
      const cartSection = document.getElementById('dash-cartSection');
      if (!cartSection.classList.contains('show')) {
        openCart();
      }
    });

    // Add event listener for remove product button
    removeProductButton.addEventListener('click', () => {
      removeProduct(product.id);
    });
  });
};

function openCart() {
  const cartSection = document.getElementById('dash-cartSection');
  cartSection.classList.add('show');
}
const renderDashboardPage = async (container, userProducts) => {
  container.innerHTML = `
    <header class="dash-header">
      <div class="dash-app-bar">
        <div class="dash-app-bar__title">
          <img src=${appIcon} alt="SimpleBiz Icons">
          <h1 class="dash-app-title">SimpleBiz</h1>
        </div>
        <div class="dash-menu-icon">
          <svg class="material-icons" width="36" height="36" viewBox="0 0 24 24">
            <path fill="#3d5a80" d="M3 18h18v-2H3v2zM3 13h18v-2H3v2zM3 6v2h18V6H3z"></path>
          </svg>
        </div>
        <nav id="dash-drawer" class="dash-nav">
          <ul class="dash-nav-list">
            <li class="nav-item"><a href="/product" class="nav-link">Produk</a></li>
            <li class="nav-item"><a href="/transaction" class="nav-link">Transaksi</a></li>
            <li class="nav-item" id="dash-showCart"><a href="#" class="nav-link">Keranjang</a></li>
            <li class="nav-item dash-user-button">
              <button>
                  <img src="${userIcon}" alt="User Profile">
                  <span>Nama User</span>
              </button>
            </li>
            </li>
          </ul>
        </nav>
      </div>
    </header>
    <main class="dash-main">
      <div class="resourceSection">
        <div class="subInput" id="dateInput">
          <p>Tanggal</p>
          <input class="inputForm" type="date" id="transactionDate" />
        </div>
        <div class="buttonResource">
          <button class="mainButton" id="applyResource">Simpan</button>
          <button class="mainButton" id="resetResource">Hapus</button>
        </div>
      </div>

      <div class="mainSearch">
        <input class="inputForm" type="text" id="nameInput" placeholder="Cari Produk" />
        <button class="mainButton" id="searchProduct">Cari</button>
      </div>

      <div class="productSection">
        <div class="mainProduct"></div>
      </div>

      <section id="dash-cartSection" class="dash-cartSection">
        <div class="dash-cartHeader">
          <p>Keranjang Belanja</p>
          <img id="dash-closeCart" src=${closeIcon} alt="" />
        </div>

        <div class="dash-cartList">
        </div>

        <div class="dash-cartFooter">
          <div class="totalFooter">
            <p>
              Total Harga :
              <span class="totalNumber" id="totalPrice">Rp 0</span>
            </p>
            <p>
              Total Produk :
              <span class="totalNumber" id="totalProduct">Rp 0</span>
            </p>
          </div>
          <div class="paymentFooter">
            <p>Nominal Pembayaran</p>
            <input class="inputForm" type="text" id="totalCash" placeholder="Total Pembayaran" />
          </div>
          <div class="paymentFooter">
            <p>
              Kembalian :
              <span class="totalNumber" id="totalCharge">Rp 0</span>
            </p>
          </div>
          <div class="buttonFooter">
            <button class="mainButton" id="checkoutCart">Konfirmasi</button>
            <button class="mainButton" id="resetCart">Reset</button>
          </div>
        </div>
      </section>
    </main>
    <footer>
      <div class="dash-footer-content">
        <p>&copy; 2023 Capstone C523-PS036's SimpleBiz Application. All rights reserved.</p>
      </div>
    </footer>
  `;
  const checkoutCart = () => {
    const totalCashInput = document.getElementById('totalCash');
    const totalCashValue = parseFloat(totalCashInput.value) || 0;

    // Introduce a slight delay to ensure UI updates are complete
    setTimeout(() => {
      const totalChargeElement = document.getElementById('totalCharge');
      const totalChargeValue = parseFloat(totalChargeElement.textContent.replace('Rp ', '')) || 0;

      console.log('Cart Items:', cartItems);

      // Only proceed if the payment amount is sufficient
      if (totalCashValue >= totalPrice && cartItems.length > 0) {
        // Pass the transactionDate to addTransactionToFirestore
        addTransactionToFirestore(
          auth.currentUser.uid,
          cartItems,
          totalCashValue,
          totalChargeValue,
          transactionDateInput.value, // Use the value from the transactionDate input field
        );

        // Perform some action with totalCashValue and totalChargeValue
        console.log('Payment successful!');
        console.log('Payment Amount: Rp', totalCashValue);
        console.log('Change: Rp', totalChargeValue);

        // Reset the cart and UI after successful payment
        resetCart();
        // Hide cart
        hideCart();
      } else {
        // Display a message based on the conditions
        if (cartItems.length === 0) {
          console.log('Error: Cart is empty. Add products to the cart before proceeding.');
        } else if (totalCashValue < totalPrice) {
          console.log('Error: Insufficient Payment Amount! Please provide sufficient cash.');
        } else {
          // Handle other conditions if needed
          console.log('Error: Payment could not be processed. Check the cart and payment amount.');
        }
      }
    }, 100); // You can adjust the delay as needed
  };

  const applyResourceButton = document.getElementById('applyResource');
  const resetResourceButton = document.getElementById('resetResource');
  const transactionDateInput = document.getElementById('transactionDate');

  const getUserDataFromFirestore = async (userId) => {
    try {
      const userDocRef = doc(db, `users/${userId}`);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();

        // Check if the 'umkm' field is present
        if (userData && userData.umkm != null) {
          return userData;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  };
  // Mendapatkan data pengguna (termasuk nama dari field "umkm")
  const userData = await getUserDataFromFirestore(user.uid);

  if (userData) {
    // Menampilkan nama pengguna di elemen "Nama User"
    const userNameElement = document.querySelector('.dash-user-button span');
    userNameElement.textContent = userData.umkm;
  } else {
    return;
  }

  // Set the default date to today
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDate.getDate().toString().padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  // Set the default date in the input field
  transactionDateInput.value = formattedDate;

  resetResourceButton.addEventListener('click', () => {
    // Reset the resource filter and render all products
    renderDashboardPage(container, userProducts);
  });

  // Locate the "Konfirmasi" button
  const checkoutCartButton = document.getElementById('checkoutCart');

  // Add an event listener to call the checkoutCart function on button click
  checkoutCartButton.addEventListener('click', checkoutCart);

  renderDashboardProducts(userProducts);

  // Fungsionalitas Keranjang
  const showCartButton = document.getElementById('dash-showCart'); // Tombol Keranjang
  const cartSection = document.getElementById('dash-cartSection'); // Seluruh Cart
  const closeCartButton = document.getElementById('dash-closeCart'); // Menutup Cart
  const resetCartButton = document.getElementById('resetCart'); // Tombol Reset
  resetCartButton.addEventListener('click', resetCart);

  function openCart() {
    cartSection.classList.add('show');
  }

  function hideCart() {
    cartSection.classList.remove('show');
  }

  // Mengubah isi fungsi resetCart
  function resetCart() {
    console.log('Resetting cart');

    // Mengosongkan array cartItems
    cartItems.length = 0;

    // Update UI untuk mencerminkan perubahan di keranjang
    updateCartUI(cartItems);

    // Reset total harga dan total produk pada UI
    const totalPriceElement = document.getElementById('totalPrice');
    const totalProductElement = document.getElementById('totalProduct');

    totalPriceElement.textContent = 'Rp 0';
    totalProductElement.textContent = 'Rp 0';

    // Reset nominal pembayaran dan kembalian pada UI
    const totalCashInput = document.getElementById('totalCash');
    const totalChargeElement = document.getElementById('totalCharge');

    totalCashInput.value = ''; // Mengosongkan input nominal pembayaran
    totalChargeElement.textContent = 'Rp 0';
  }

  // Membuka dan Menutup Cart
  showCartButton.addEventListener('click', openCart);
  closeCartButton.addEventListener('click', hideCart);

  const menuIcon = container.querySelector('.dash-menu-icon');
  const navList = container.querySelector('.dash-nav-list');
  const mainContent = container.querySelector('.dash-main');

  const navItems = container.querySelectorAll('.dash-nav-item a');

  mainContent.addEventListener('click', () => {
    navList.classList.remove('active');
  });

  navItems.forEach((navItem) => {
    navItem.addEventListener('click', () => {
      navList.classList.remove('active');
    });
  });

  menuIcon.addEventListener('click', () => {
    navList.classList.toggle('active');
  });

  // Function to filter products based on search input
  const filterProducts = (products, searchText) => products.filter((product) => product.name.toLowerCase().includes(searchText.toLowerCase()));

  // Function to handle search button click
  const handleSearch = () => {
    const nameInput = document.getElementById('nameInput');
    const searchProductButton = document.getElementById('searchProduct');

    // Add event listener for search product button
    searchProductButton.addEventListener('click', async () => {
      try {
        const searchText = nameInput.value.trim();

        // Fetch user products without rendering the dashboard
        const userProducts = await fetchUserProducts(auth.currentUser.uid);

        // Filter products based on search input
        const filteredProducts = filterProducts(userProducts, searchText);

        // Render the dashboard with the filtered products
        renderDashboardPage(document.body, filteredProducts);
      } catch (error) {
        console.error('Error handling search:', error.message);
        // Handle the error accordingly
      }
    });
  };

  // Call the handleSearch function to set up the event listener
  handleSearch();
};

export default renderDashboardPage;
