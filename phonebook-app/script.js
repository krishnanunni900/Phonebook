const API_URL = 'https://jsonplaceholder.typicode.com/users';
let contacts = [];

const contactForm = document.getElementById('contact-form');
const contactsList = document.getElementById('contacts-list');
const searchInput = document.getElementById('search');
const errorMessage = document.getElementById('error-message');
const submitBtn = document.getElementById('submit-btn');

// Fetch all contacts
async function fetchContacts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch contacts');
        contacts = await response.json();
        displayContacts(contacts);
        errorMessage.textContent = '';
    } catch (error) {
        showError('Error fetching contacts: ' + error.message);
    }
}

// Display contacts
function displayContacts(contactsToDisplay) {
    contactsList.innerHTML = '';
    contactsToDisplay.forEach(contact => {
        const contactDiv = document.createElement('div');
        contactDiv.className = 'contact';
        contactDiv.innerHTML = `
            <div class="contact-info">
                <strong>${contact.name}</strong><br>
                Phone: ${contact.phone}<br>
                Email: ${contact.email}
            </div>
            <div class="contact-actions">
                <button onclick="editContact(${contact.id})">Edit</button>
                <button onclick="deleteContact(${contact.id})">Delete</button>
            </div>
        `;
        contactsList.appendChild(contactDiv);
    });
}

// Add or update contact
async function saveContact(event) {
    event.preventDefault();
    const id = document.getElementById('contact-id').value;
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    // Validation
    if (!name.trim()) {
        showError('Name is required.');
        return;
    }
    if (!/^\d{10}$/.test(phone)) {
        showError('Phone number must be exactly 10 digits.');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('Please enter a valid email address.');
        return;
    }

    const contactData = { name, phone, email };

    try {
        let response;
        if (id) {
            // Update
            response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });
        } else {
            // Add new
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });
        }

        if (!response.ok) throw new Error('Failed to save contact');

        const savedContact = await response.json();
        if (id) {
            // Update local array
            const index = contacts.findIndex(c => c.id == id);
            contacts[index] = savedContact;
        } else {
            // Add to local array
            contacts.push(savedContact);
        }

        displayContacts(contacts);
        contactForm.reset();
        submitBtn.textContent = 'Add Contact';
        errorMessage.textContent = '';
    } catch (error) {
        showError('Error saving contact: ' + error.message);
    }
}

// Edit contact
function editContact(id) {
    const contact = contacts.find(c => c.id == id);
    if (contact) {
        document.getElementById('contact-id').value = contact.id;
        document.getElementById('name').value = contact.name;
        document.getElementById('phone').value = contact.phone;
        document.getElementById('email').value = contact.email;
        submitBtn.textContent = 'Update Contact';
    }
}

// Delete contact
async function deleteContact(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete contact');

        contacts = contacts.filter(c => c.id != id);
        displayContacts(contacts);
        errorMessage.textContent = '';
    } catch (error) {
        showError('Error deleting contact: ' + error.message);
    }
}

// Search contacts
function searchContacts() {
    const query = searchInput.value.toLowerCase();
    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(query) ||
        contact.phone.toLowerCase().includes(query)
    );
    displayContacts(filteredContacts);
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
}

// Event listeners
contactForm.addEventListener('submit', saveContact);
searchInput.addEventListener('input', searchContacts);

// Initialize
fetchContacts();
