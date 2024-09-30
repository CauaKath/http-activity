const express = require("express");
const { HttpStatuses, Ports } = require("../constants");
const app = express();
const BASE_PATH = '/contacts'

app.use(express.json());

/**
 * @typedef {import('../types').Contact} Contact
 * @typedef {import('../types').ContactInput} ContactInput
 */

/** @type {Contact[]} */
const contacts = [];

const getContactId = () => {
  return contacts.length + 1;
};

/**
 * 
 * @param {string} phone 
 * @returns {boolean} contact phone already exists
 */
const checkAlreadyExists = (phone) => {
  return !!contacts.find(contact => contact.phone === phone);
};

/**
 * 
 * @param {number} id 
 * @returns {Contact | undefined}
 */
const getById = (id) => {
  return contacts.find(contact => contact.id === id);
}

/**
 * 
 * @param {string} phone 
 * @returns {Contact | undefined}
 */
const getByPhone = (phone) => {
  return contacts.find(contact => contact.phone === phone);
};

app.get(BASE_PATH, (_, res) => {
  res.status(HttpStatuses.Success).json(contacts);
});

app.get(`${BASE_PATH}/:id`, (req, res) => {
  const contactId = Number(req.params.id);

  const contact = getById(contactId);

  if (!contact) {
    return res.status(HttpStatuses.NotFound).json({
      message: "Contact not found with id: " + contactId
    });
  }

  res.status(HttpStatuses.Success).json(contact);
});

app.get(`${BASE_PATH}/phone/:phone`, (req, res) => {
  const contactPhone = req.params.phone;

  const contact = getByPhone(contactPhone);

  if (!contact) {
    return res.status(HttpStatuses.NotFound).json({
      message: "Contact not found with phone: " + contactPhone
    });
  }

  res.status(HttpStatuses.Success).json(contact);
})

app.post(BASE_PATH, (req, res) => {
  /** @type {ContactInput} */
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(HttpStatuses.BadRequest).json({
      message: "One of the requested fields weren't passed (name, phone)"
    });
  }

  const alreadyExists = checkAlreadyExists(phone);

  if (alreadyExists) {
    return res.status(HttpStatuses.BadRequest).json({
      message: "This phone already exists"
    });
  }

  /** @type {Contact} */
  const newContact = {
    id: getContactId(),
    name,
    phone,
  };

  contacts.push(newContact);
  
  res.status(HttpStatuses.Created).json({ 
    message: "ok"
  });
})

app.listen(Ports.Contacts, () => {
  console.log('Contacts API running on http://localhost:', Ports.Contacts);
});