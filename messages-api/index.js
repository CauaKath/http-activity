const express = require("express");
const { Ports, HttpStatuses } = require("../constants");
const { default: axios } = require("axios");
const app = express();
const BASE_PATH = '/messages'

app.use(express.json());

/**
 * @typedef {import('../types').Message} Message
 * @typedef {import('../types').MessageInput} MessageInput
 * @typedef {import('../types').Contact} Contact
 */

/** @type {Message[]} */
const messages = [];

const getMessageId = () => {
  return messages.length + 1;
};

/**
 * 
 * @param {number} contactId 
 * @returns {Message[]}
 */
const getMessagesFromContact = (contactId) => {
  return messages.filter(message => message.contactId === contactId);
};

/**
 * 
 * @param {string} phone 
 * @returns {Promise<Contact | null>}
 */
const getContactByPhone = async (phone) => {
  const url = `http://localhost:${Ports.Contacts}/contacts/phone/${phone}`;
  
  try {
    const response = await axios.get(url);

    if (response.status === HttpStatuses.Success) {
      /** @type {Contact} */
      return response.data;
    }

    return null;
  } catch (error) {
    console.error('Error on get contact by phone', error);
    return null;
  }
}

app.get(BASE_PATH, (_, res) => {
  res.status(HttpStatuses.Success).json(messages);
});

app.get(`${BASE_PATH}/:contactPhone`, async (req, res) => {
  const contactPhone = req.params.contactPhone;

  const contact = await getContactByPhone(contactPhone);

  if (!contact) {
    return res.status(HttpStatuses.BadRequest).json({
      message: "Contact with the given number not found"
    });
  }

  const contactMessages = getMessagesFromContact(contact.id);

  res.status(HttpStatuses.Success).json(contactMessages);
});

app.post(BASE_PATH, async (req, res) => {
  /** @type {MessageInput} */
  const message = req.body;

  if (!message.contactPhone || !message.message) {
    return res.status(HttpStatuses.BadRequest).json({
      message: "One of the required fields weren't passed (message, contactPhone)"
    });
  }

  const contact = await getContactByPhone(message.contactPhone);

  if (!contact) {
    return res.status(HttpStatuses.BadRequest).json({
      message: "Contact with the given number not found"
    });
  }

  /** @type {Message} */
  const newMessage = {
    id: getMessageId(),
    message: message.message,
    contactId: contact.id,
  };

  messages.push(newMessage);

  res.status(HttpStatuses.Created).json({
    message: "ok"
  });
})

app.listen(Ports.Messages, () => {
  console.log('Messages API running on http://localhost:', Ports.Messages);
});