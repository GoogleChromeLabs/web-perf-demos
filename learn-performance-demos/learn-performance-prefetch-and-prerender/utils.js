const { promisify } = require("util");

// creates an async delay for N milliseconds
const delay = promisify(setTimeout);

// generates a random length HTML string
const generateRandomString = (min, max) => {
  const length = Math.floor(Math.random() * (max - min + 1)) + min;

  return `${[...Array(length)]
    .map(
      () =>
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Doloribus dicta id, tempora rem accusamus ab ex, ratione ad exercitationem libero laudantium fugit reiciendis corrupti quis ipsam dolorum maxime perspiciatis nemo."
    )
    .join("")}`;
};

// returns the current server time in UTC format
const getTime = (date) => {
  const coeff = 1000 * 60;
  return new Date(Math.floor(date.getTime() / coeff) * coeff).toUTCString();
};

module.exports = { generateRandomString, getTime, delay };
