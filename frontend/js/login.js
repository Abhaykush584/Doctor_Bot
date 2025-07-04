// Tab switching
const loginTab = document.getElementById('showLogin');
const signupTab = document.getElementById('showSignup');
const loginFormContainer = document.getElementById('loginFormContainer');
const signupFormContainer = document.getElementById('signupFormContainer');

loginTab.addEventListener('click', function() {
  loginTab.classList.add('active');
  signupTab.classList.remove('active');
  loginFormContainer.style.display = '';
  signupFormContainer.style.display = 'none';
});
signupTab.addEventListener('click', function() {
  signupTab.classList.add('active');
  loginTab.classList.remove('active');
  signupFormContainer.style.display = '';
  loginFormContainer.style.display = 'none';
});

// Login form handler
document.getElementById('loginForm').onsubmit = async function(e) {
  e.preventDefault();
  const username = document.getElementById('login_username').value.trim();
  const password = document.getElementById('login_password').value.trim();
  const res = await fetch('http://localhost:5000/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    credentials: 'include',
    body: JSON.stringify({username, password}),
  });
  const data = await res.json();
  if (res.ok && data.success) {
    window.location.href = 'index.html';
  } else {
    document.getElementById('loginError').textContent = data.message || "Login failed!";
  }
};

// Signup form handler
document.getElementById('signupForm').onsubmit = async function(e) {
  e.preventDefault();
  const username = document.getElementById('signup_username').value.trim();
  const password = document.getElementById('signup_password').value.trim();
  const res = await fetch('http://localhost:5000/signup', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    credentials: 'include',
    body: JSON.stringify({username, password}),
  });
  const data = await res.json();
  if (res.ok && data.success) {
    window.location.href = 'index.html';
  } else {
    document.getElementById('signupError').textContent = data.message || "Signup failed!";
  }
};