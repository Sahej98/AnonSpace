
const ADJECTIVES = [
    "Witty", "Clever", "Bold", "Curious", "Silent", "Brave", "Calm", "Eager",
    "Gentle", "Happy", "Jolly", "Kind", "Lively", "Merry", "Nice", "Proud",
    "Silly", "Wise", "Zany", "Fierce", "Quiet", "Lucky", "Swift", "Sturdy", "Sleepy", "Blue"
];

const ANIMALS = [
    "Bird", "Cat", "Dog", "Fish", "Rabbit", "Squirrel", "Turtle", "Bug",
    "Dolphin", "Rat", "Snail", "Snake", "Spider", "Whale", "Ghost"
];

const COLORS = [
    '#82A2F2', // Soft Blue
    '#F28B82', // Soft Red/Orange
    '#FDD663', // Soft Yellow
    '#81C995', // Soft Green
    '#B39DDB', // Soft Purple
    '#78C9B9', // Soft Teal
    '#F4A9A8', // Soft Pink
];

const generateUsername = () => {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return { name: `${adjective} ${animal}`, color };
};

module.exports = { generateUsername };