// Import modul dan style yang diperlukan
import "../../styles/product.css";
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
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Import gambar
import appIcon from "../../public/icons/simplebiz-icons.png";
import userIcon from "../../public/icons/user.svg";
import firebaseConfig from "../common/config";

// Inisialisasi Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Fungsi untuk mengambil produk pengguna dari Firestore
const fetchUserProducts = async (userId) => {
  console.log("Fetching products for user:", userId);
  try {
    const productsRef = collection(db, `users/${userId}/products`);
    const q = query(productsRef);

    // Mengeksekusi query pada database Firestore untuk produk pengguna
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map((doc) => doc.data());

    // Mengurutkan produk dalam alfabet berdasarkan nama
    products.sort((a, b) => a.name.localeCompare(b.name));

    console.log("User products:", products);

    return products;
  } catch (error) {
    console.error("Error fetching user products:", error);
    return [];
  }
};

// Flag untuk memeriksa apakah halaman produk telah dirender
let productPageRendered = false;

// Listener perubahan status autentikasi Firebase
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      console.log("User is signed in:", user.uid);

      // Merender halaman produk hanya jika belum pernah dirender sebelumnya
      if (!productPageRendered) {
        const products = await fetchUserProducts(user.uid);
        renderProductPage(products, user); // Mengirim pengguna yang terotentikasi
        productPageRendered = true; // Mengatur flag menjadi true
      }
    } catch (error) {
      console.error("Error fetching user products:", error.message);
    }
  } else {
    console.log("User is signed out");
    // Menangani status keluar
  }
});

// Fungsi untuk menunggu proses autentikasi pengguna selesai
const waitForAuthentication = () =>
  new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });

// Percobaan fungsi nama
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

// Fungsi untuk menghasilkan ID unik pada produk
const generateProductId = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

// Fungsi untuk menambahkan produk ke Firestore
const addProductToFirestoreOnClick = async () => {
  try {
    // Mendapatkan elemen di form
    const productNameInput = document.querySelector("#productName");
    const productPriceInput = document.querySelector("#productPrice");
    const productImageInput = document.querySelector("#productImage");

    // Mendapatkan data pengguna yang mengakses
    const user = auth.currentUser;

    // Memeriksa autentikasi pengguna
    if (!user || !user.uid) {
      console.error("User not authenticated.");
      return;
    }

    const userId = user.uid;
    const productId = generateProductId();

    // Mengatur referensi penyimpanan
    const storage = getStorage(firebaseApp);
    const imageRef = ref(storage, `users/${userId}/products/${productId}`);

    // Mengunggah gambar ke penyimpanan
    await uploadBytes(imageRef, productImageInput.files[0]);

    // Mendapatkan URL gambar
    const downloadURL = await getDownloadURL(imageRef);

    // Membuat data produk
    const jakartaTimezone = "Asia/Jakarta";
    const jakartaDate = new Date().toLocaleString("en-US", {
      timeZone: jakartaTimezone,
    });

    const createdAt = new Date(jakartaDate); // Mengatur createdAt sebagai objek Date

    const newProductData = {
      id: productId,
      name: productNameInput.value,
      price: productPriceInput.value,
      imageSrc: downloadURL,
      createdAt,
    };

    // Mengatur referensi ke collection products
    const productsRef = collection(db, `users/${userId}/products`);

    // Mengatur dokumen dengan data produk baru
    await setDoc(doc(productsRef, productId), newProductData);

    console.log("Product added successfully!");

    // Mereset elemen pada formulir
    productNameInput.value = "";
    productPriceInput.value = "";
    productImageInput.value = "";
    const fileInputPlaceholder = document.querySelector(
      ".file-input-placeholder"
    );
    fileInputPlaceholder.innerHTML = "<p>Masukan Foto</p>";
  } catch (error) {
    console.error("Error adding product to Firestore:", error);
  }
};

// Fungsi untuk menambahkan produk dengan addButton
const handleAddButtonClick = async () => {
  try {
    // Menunggu proses otentikasi selesai
    const user = await waitForAuthentication();

    // Memeriksa apakah pengguna terotentikasi
    if (!user || !user.uid) {
      console.error("User not authenticated.");
      return;
    }

    // Menambahkan parameter pengguna saat menambahkan produk
    await addProductToFirestoreOnClick();

    // Mengambil dan merender produk yang diperbarui
    const updatedProducts = await fetchUserProducts(user.uid);
    // Render produk yang diperbarui
    renderProducts(updatedProducts, prodList);
  } catch (error) {
    console.error("Error handling add button click:", error);
  }
};

// Fungsi untuk menghapus produk dari Firestore
const deleteProductFromFirestore = async (user, productId) => {
  try {
    const userId = user.uid;
    const productRef = doc(db, `users/${userId}/products/${productId}`);
    await deleteDoc(productRef);

    console.log("Product deleted successfully!");
  } catch (error) {
    console.error("Error deleting product from Firestore:", error);
  }
};

// Fungsi untuk memperbarui produk di Firestore
const updateProductInFirestore = async (
  productId,
  updateProductName,
  updateProductPrice,
  updateProductImageFile
) => {
  try {
    const user = auth.currentUser;

    // Memeriksa apakah pengguna terotentikasi
    if (!user || !user.uid) {
      console.error("User not authenticated.");
      return;
    }

    const userId = user.uid;
    const productRef = doc(db, `users/${userId}/products/${productId}`);
    const productSnapshot = await getDoc(productRef);

    if (productSnapshot.exists()) {
      const storage = getStorage(firebaseApp);
      const imageRef = ref(storage, `users/${userId}/products/${productId}`);
      await uploadBytes(imageRef, updateProductImageFile);
      const downloadURL = await getDownloadURL(imageRef);

      const updatedProductData = {
        name: updateProductName,
        price: updateProductPrice,
        imageSrc: downloadURL,
      };

      await updateDoc(productRef, updatedProductData);

      console.log("Product updated successfully!");
    } else {
      console.error(
        "Product not found. Check the product ID and Firestore path."
      );
    }
  } catch (error) {
    console.error("Error updating product in Firestore:", error);
  }
};

// Fungsi untuk mengambil semua produk dari Firestore dan menyortirnya secara alfabet
const getProductsFromFirestore = async () => {
  try {
    // Mendapatkan pengguna terotentikasi saat ini
    const user = auth.currentUser;

    // Memeriksa autentikasi berdasarkan UID pengguna
    if (!user || !user.uid) {
      console.error("User not authenticated or UID not available.");
      return [];
    }

    const userId = user.uid;
    const productsCollection = collection(db, `users/${userId}/products`);
    const productsSnapshot = await getDocs(productsCollection);

    const products = [];

    // Iterasi melalui dokumen Firestore dan ekstrak data produk
    productsSnapshot.forEach((doc) => {
      products.push(doc.data());
    });

    // Menyortir produk secara alfabetis berdasarkan nama
    products.sort((a, b) => {
      const productNameA = a.name.toUpperCase();
      const productNameB = b.name.toUpperCase();
      if (productNameA < productNameB) {
        return -1;
      }
      if (productNameA > productNameB) {
        return 1;
      }
      return 0;
    });

    console.log("Products from Firestore:", products);

    return products;
  } catch (error) {
    console.error("Error getting products from Firestore:", error);
    return [];
  }
};

// Fungsi untuk merender produk di halaman
const renderProducts = (products, container) => {
  container.innerHTML = "";

  // Membuat elemen HTML untuk masing-masing produk
  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.classList.add("prod-card");

    // Isi kartu produk dengan informasi produk
    productCard.innerHTML = `
      <img src="${product.imageSrc}" alt="${product.name}">
      <h2 class="prod-name">${product.name}</h2>
      <p class="prod-price">${product.price}</p>
      <div class="action-button">
        <button id="deleteProduct" data-id="${product.id}">Hapus</button>
        <button id="updateProduct" data-id="${product.id}">Perbarui</button>
      </div>
    `;

    container.appendChild(productCard);

    // Menambahkan eventListener untuk tombol hapus dan perbarui
    const deleteButton = productCard.querySelector("#deleteProduct");
    const updateProduct = productCard.querySelector("#updateProduct");

    // Menangkap informasi pengguna dan menentukan prodList sebelum digunakan
    const user = auth.currentUser;

    // Event Listener untuk tombol hapus
    deleteButton.addEventListener("click", async () => {
      await deleteProductFromFirestore(user, product.id);
      const updatedProducts = await getProductsFromFirestore();
      renderProducts(updatedProducts, prodList);
    });

    // Event Listener untuk tombol perbarui
    updateProduct.addEventListener("click", () => {
      const updateForm = document.querySelector("#updateForm");
      const updateProductNameInput =
        updateForm.querySelector("#updateProductName");
      const updateProductPriceInput = updateForm.querySelector(
        "#updateProductPrice"
      );

      // Mengambil ID produk untuk menggunakan dataset
      const productIdToUpdate = updateProduct.dataset.id;

      if (!productIdToUpdate) {
        console.error("Product ID not available for update.");
        return;
      }

      updateProductNameInput.value = product.name;
      updateProductPriceInput.value = product.price;

      // Menambahkan ID produk ke formulir pembaruan
      updateForm.dataset.productId = productIdToUpdate;
    });
  });
};

// Fungsi untuk merender halaman produk
const renderProductPage = async (container, user) => {
  // document.body.style.backgroundColor = "#F1F1F1";

  // Menunggu proses autentikasi selesai
  const authenticatedUser = await waitForAuthentication();

  if (!authenticatedUser) {
    console.error("User not authenticated.");
    return;
  }

  container.innerHTML = `
    <header class="prod-header">
      <div class="prod-app-bar">
        <div class="prod-app-bar-title">
          <img src="${appIcon}" alt="SimpleBiz Icons">
          <h1 class="prod-app-title">SimpleBiz</h1>
        </div>
        <div class="prod-menu-icon">
          <svg class="material-icons" width="36" height="36" viewBox="0 0 24 24">
            <path fill="#3d5a80" d="M3 18h18v-2H3v2zM3 13h18v-2H3v2zM3 6v2h18V6H3z"></path>
          </svg>
        </div>
        <nav id="productDrawer" class="prod-nav">
        <ul class="prod-nav-list">
        <li class="nav-item"><a href="/dashboard" class="nav-link">Dashboard</a></li>
        <li class="nav-item"><a href="/transaction" class="nav-link">Transaksi</a></li>
        <li class="nav-item prod-user-button">
            <button>
                <img src="${userIcon}" alt="User Profile">
                <span>Nama User</span>
            </button>
        </li>
    </ul>
        </nav>
      </div>
    </header>
    <main class="prod-main">
      <div class="prod-side-form">
        <div class="prod-form-container" id="addForm">
          <h2>Tambah Produk</h2>
          <form class="prod-input-form">
            <div class="prod-form-group">
              <label for="productName">Nama Produk</label>
              <input type="text" id="productName" name="productName" required>
            </div>
            <div class="prod-form-group">
              <label for="productPrice">Harga Produk</label>
              <input type="text" id="productPrice" name="productPrice" required>
            </div>
            <div class="prod-form-group">
              <label for="productImage">Foto Produk</label>
              <div class="custom-file-input">
                <input type="file" id="productImage" name="productImage" accept="image/*" required>
                <div class="file-input-placeholder">
                  <p>Masukan Foto</p>
                </div>
              </div>
            </div>
            <button id="addButton" type="button">Tambah</button>
          </form>
        </div>
        <div class="prod-form-container" id="updateForm">
          <h2>Perbarui Produk</h2>
          <form class="prod-input-form">
            <div class="prod-form-group">
              <label for="updateProductName">Nama Produk</label>
              <input type="text" id="updateProductName" name="updateProductName" required>
            </div>
            <div class="prod-form-group">
              <label for="productPrice">Harga Produk</label>
              <input type="text" id="updateProductPrice" name="updateProductPrice" required>
            </div>
            <div class="prod-form-group">
              <label for="updateProductImage">Foto Produk</label>
              <div class="custom-file-input">
                <input type="file" id="updateProductImage" name="updateProductImage" accept="image/*">
                <div class="file-input-placeholder">
                  <p>Masukan Foto</p>
                </div>
              </div>
            </div>
            <button id="updateButton" type="submit">Perbarui</button>
          </form>
        </div>
      </div>

      <div class="prod-content">
        <div class="search-bar">
          <input type="text" id="searchInput" placeholder="Cari produk...">
          <button id="searchButton" type="button">Cari</button>
        </div>
        <div class="prod-list" id="prodlist"></div>
      </div>
      
    </main>
    <footer>
      <div class="prod-footer-content">
        <p>&copy; 2023 Capstone C523-PS036's SimpleBiz Application. All rights reserved.</p>
      </div>
    </footer>
  `;

  // Elemen-elemen DOM yang diperlukan dari halaman
  const prodList = document.querySelector("#prodlist");
  const addForm = document.querySelector("#addForm");
  const addButton = document.querySelector("#addButton");
  const updateForm = document.querySelector("#updateForm");
  const updateButton = document.querySelector("#updateButton");
  const searchInput = document.querySelector("#searchInput");
  const searchButton = document.querySelector("#searchButton");

  // Mengambil produk dari Firestore
  const products = await getProductsFromFirestore(user);

  // Merender produk pada halaman
  await renderProducts(products, prodList);

  // Mendapatkan data pengguna (termasuk nama dari field "umkm")
  const userData = await getUserDataFromFirestore(user.uid);

  if (userData) {
    // Menampilkan nama pengguna di elemen "Nama User"
    const userNameElement = document.querySelector(".prod-user-button span");
    userNameElement.textContent = userData.umkm;
  } else {
    return;
  }

  // Event listener untuk tombol "Tambah"
  addButton.addEventListener("click", handleAddButtonClick);

  // Event listener untuk tombol "Cari"
  searchButton.addEventListener("click", async () => {
    const searchTerm = searchInput.value;
    const products = await getProductsFromFirestore();

    // Filter produk berdasarkan kata kunci pencarian
    const filteredProducts = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Merender produk yang sudah difilter
    renderProducts(filteredProducts, prodList);
  });

  // Event listener untuk formulir pembaruan
  updateForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Dapatkan nilai dari formulir pembaruan
    const updateProductName =
      updateForm.querySelector("#updateProductName").value;
    const updateProductPrice = updateForm.querySelector(
      "#updateProductPrice"
    ).value;
    const updateProductImageInput = updateForm.querySelector(
      "#updateProductImage"
    );
    const updateProductImageFile = updateProductImageInput.files[0];
    const productIdToUpdate = updateForm.dataset.productId;

    // Memperbarui produk di Firestore
    await updateProductInFirestore(
      productIdToUpdate,
      updateProductName,
      updateProductPrice,
      updateProductImageFile
    );

    // Ambil dan render produk yang sudah diperbarui
    const updatedProducts = await getProductsFromFirestore(user);
    renderProducts(updatedProducts, prodList);

    // Membersihkan elemen di formulir pembaruan
    updateForm.querySelector("#updateProductName").value = "";
    updateForm.querySelector("#updateProductPrice").value = "";
    updateForm.querySelector("#updateProductImage").value = "";

    const updateFileInputPlaceholder = document.querySelector(
      ".file-input-placeholder"
    );
    updateFileInputPlaceholder.innerHTML = "<p>Masukan Foto</p>";
  });
};

// Mengatur fungsi renderProductPage sebagai ekspor default
export default renderProductPage;
