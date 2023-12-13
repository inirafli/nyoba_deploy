// Firebase configuration
import "../../styles/register.css";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import firebaseConfig from "../common/config";

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

const renderRegisterPage = (container) => {
  document.body.style.backgroundColor = "#3d5a80";

  container.innerHTML = `
    <main id="register-page">
      <button id="back" class="back-button" type="button">
            <svg class="vector" width="48" height="48" viewBox="0 0 63 63" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M0.21875 31.5C0.21875 48.7754 14.2246 62.7812 31.5 62.7812C48.7754 62.7812 62.7812 48.7754 62.7812 31.5C62.7812 14.2246 48.7754 0.21875 31.5 0.21875C14.2246 0.21875 0.21875 14.2246 0.21875 31.5ZM32.1993 17.7603C32.4237 17.9829 32.6021 18.2475 32.7242 18.5389C32.8463 18.8304 32.9098 19.1431 32.9111 19.4592C32.9123 19.7752 32.8513 20.0884 32.7315 20.3809C32.6117 20.6733 32.4355 20.9393 32.2129 21.1637L24.3444 29.0938H44.4336C45.0718 29.0938 45.6838 29.3473 46.1351 29.7985C46.5863 30.2498 46.8398 30.8618 46.8398 31.5C46.8398 32.1382 46.5863 32.7502 46.1351 33.2015C45.6838 33.6527 45.0718 33.9062 44.4336 33.9062H24.3444L32.2129 41.8363C32.4354 42.0609 32.6116 42.3271 32.7313 42.6197C32.851 42.9124 32.9119 43.2257 32.9105 43.5419C32.9091 43.8581 32.8454 44.1709 32.7232 44.4624C32.6009 44.754 32.4224 45.0186 32.1978 45.2412C31.9733 45.4638 31.7071 45.6399 31.4144 45.7596C31.1218 45.8793 30.8084 45.9402 30.4923 45.9388C30.1761 45.9374 29.8633 45.8738 29.5717 45.7515C29.2802 45.6292 29.0155 45.4507 28.793 45.2262L16.8535 33.1949C16.4062 32.7442 16.1552 32.135 16.1552 31.5C16.1552 30.865 16.4062 30.2558 16.8535 29.8051L28.793 17.7738C29.0156 17.549 29.2803 17.3703 29.5721 17.2479C29.8639 17.1255 30.1769 17.0619 30.4933 17.0606C30.8097 17.0593 31.1233 17.1205 31.416 17.2406C31.7087 17.3606 31.9749 17.5372 32.1993 17.7603Z"
                    fill="white" />
            </svg>
        </button>
      <div class="register-container">
        <h2 class="form-title">Daftar Akun</h2>
        <form id="register-form">
          <div class="form-group">
            <label for="name">Nama</label>
            <input type="text" id="name" name="name" required>
          </div>

          <div class="form-group">
            <label for="umkm">Nama UMKM</label>
            <input type="text" id="umkm" name="umkm" required>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
            <div class="input-container">
              <input type="checkbox" id="showPassword">
              <label for="showPassword">Tampilkan Password</label>
            </div>
          </div>

          <button type="submit" class="register-button">Daftar</button>
        </form>
        <p class="error-message">Ini adalah Warning</p>
        <p>Sudah punya akun? <a href="/login">Masuk Disini!</a></p>
      </div>
      <div class="register-headline">
        <h1>Bergabunglah dengan SimpleBiz</h1>
        <p>Daftarkan bisnis Anda hari ini dan mulailah merasakan keuntungan dari
          sistem pencatatan digital yang efisien.</p>
      </div>
    </main>
  `;

  const backButton = document.querySelector("#back");
  const showPasswordCheck = document.querySelector("#showPassword");

  const createUserProfile = async (userId, name, umkm) => {
    try {
      // Membuat profil user di database Firestore
      await setDoc(doc(firestore, "users", userId), {
        name,
        umkm,
      });
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  };
  showPasswordCheck.addEventListener("change", () => {
    const passwordInput = document.getElementById("password");
    const type = showPasswordCheck.checked ? "text" : "password";
    passwordInput.setAttribute("type", type);
  });

  backButton.addEventListener("click", () => {
    window.history.replaceState(null, null, "/");
    window.location.href = "/";
  });

  const registerForm = document.querySelector("#register-form");
  const errorMessage = document.querySelector(".error-message");

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const umkm = document.getElementById("umkm").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      // Membuat akun pada autentikasi Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Membuat profil user di database Firestore
      await createUserProfile(userCredential.user.uid, name, umkm);

      // Console log menampilkan pendaftaran berhasil
      console.log("Akun berhasil didaftarkan :", userCredential);
      errorMessage.style.display = "none";

      handleSignupSuccess(userCredential);
    } catch (error) {
      // Penanganan kesalahan pada registrasi
      console.error("Pendaftaran gagal dilakukan :", error.message);
      // Console log menampilkan error
      errorMessage.style.display = "block";
      errorMessage.textContent = error.message;
      handleSignupError(error);
    }
  });

  function handleSignupSuccess(userCredential) {
    const { user } = userCredential;
    redirectToLogin();
  }

  function handleSignupError(error) {
    console.log(error.message);
    alert("Pendaftaran gagal. Silakan coba lagi.");
  }

  function redirectToLogin() {
    window.location.href = "/login";
  }
};

export default renderRegisterPage;
