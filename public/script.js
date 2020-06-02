"use-strict"

// Extract URL search parameters to display error of non ucd email
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const emailError = urlParams.get('email')

const errormsg = document.querySelector('#errorMsg');

if (emailError === 'notUCD') {
    errormsg.textContent = 'You must use a UC Davis Email to login';
    errormsg.style.display = 'block';
}
