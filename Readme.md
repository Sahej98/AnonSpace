
# AnonSpace - Anonymous Posting Platform

AnonSpace is a modern, anonymous social platform that allows users to share thoughts, confessions, and interact without the pressure of a permanent identity.

## 🚀 Features

### Core Experience
- **Truly Anonymous**: No email, no phone number, no passwords. Authentication is handled via a unique, persistent User ID.
- **Dynamic Identities**: Every post and comment is assigned a randomized alias (e.g., "Witty Fox", "Brave Bear") and a unique color signature that persists only for that interaction.
- **Dark/Light Mode**: Fully responsive UI with theme switching capabilities.

### Content & Interaction
- **Confessions (Posts)**: Share thoughts freely with a 280-character limit.
- **Polls**: Create interactive polls to gauge community opinion.
- **Engagement**: Upvote (Like) posts with a satisfying confetti effect.
- **Comments**: Discuss posts anonymously with threaded conversations.
- **Trending Tags**: See what topics are currently hot in the community.

### Live Chat
- **Anonymous 1-on-1 Chat**: Match with a random stranger for a private conversation.
- **Ephemeral Messaging**: Chats automatically expire after 12 hours.
- **Privacy Focused**: Only the last 5 messages are stored and visible to encourage in-the-moment conversation.

### Moderation & Safety
- **Report System**: Users can report inappropriate content (Posts, Comments, Chats).
- **Admin Dashboard**: A dedicated interface for admins to:
  - View platform statistics (User count, Posts, Reports).
  - Ban/Unban users.
  - Timeout users for 24 hours.
  - Resolve reports and delete content.
- **Profanity Filter**: Automatic filtering of offensive language in posts and chats.

## 🛠️ Tech Stack

### Client
- **React 18**: Component-based UI.
- **Vite**: Fast build tool and dev server.
- **Framer Motion**: Smooth animations for UI interactions (modals, lists, toasts).
- **Lucide React**: Clean and modern icons.
- **Socket.io Client**: Real-time updates for the feed and chat.

### Server
- **Node.js & Express**: REST API backend.
- **MongoDB & Mongoose**: NoSQL database for flexible data modeling.
- **Socket.io**: Real-time bidirectional event-based communication.
- **Bad-Words**: Profanity filtering library.

## 📦 Setup & Installation

1.  **Clone the repository**
2.  **Install Dependencies**
    ```bash
    npm install
    ```
    This will install dependencies for both the root (concurrently), client, and server.

3.  **Environment Variables**
    Create a `.env` file in the `server/` directory:
    ```env
    PORT=3001
    MONGODB_URI=your_mongodb_connection_string
    ```

4.  **Run the App**
    From the root directory, run:
    ```bash
    npm start
    ```
    This command uses `concurrently` to start both the Vite client (port 5173) and the Express server (port 3001).

5.  **Access the App**
    Open your browser and navigate to `http://localhost:5173`.

## 🎨 Customization

- **Logo**: Place your custom logo at `client/public/logo.png`.
- **Themes**: Modify CSS variables in `client/src/index.css` to change the color palette.

## 📜 License

ISC
