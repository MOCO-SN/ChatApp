# Chat Nova - WhatsApp-style Real-time Messaging App

A modern, WhatsApp-inspired messaging application built with React, Firebase, and Vite. Features a clean, glass-morphism design with smooth animations, real-time chat functionality, and end-to-end encrypted messaging.

## Key Features

- **WhatsApp-style UI** - Clean, familiar interface with green accent colors
- **Real-time Messaging** - Instant message delivery with Firebase
- **Glass-morphism Design** - Modern backdrop-blur effects
- **Responsive Layout** - Works perfectly on desktop and mobile
- **File Sharing** - Support for images and videos
- **User Status** - Online/offline indicators with timestamp
- **Chat Search** - Quick search functionality
- **Profile Management** - Edit profile, view media, and account settings
- **End-to-End Encryption** - RSA-OAEP + AES-GCM encrypted messages
- **Auto-Resizable Input** - Multiline message input that grows with content
- **Emoji Picker** - Built-in emoji selector for quick reactions
- **WhatsApp Business Features** - Business accounts with invoice, notice, and data templates

## Technology Stack

- **Frontend**: React, Vite, JavaScript
- **Styling**: CSS with modern custom properties
- **Backend**: Firebase (Authentication, Firestore)
- **Encryption**: Web Crypto API (RSA-OAEP + AES-GCM)
- **File Upload**: Cloudinary integration
- **State Management**: React Context API

## Installation

```bash
npm install
npm run dev
```

## Features

### Chat Interface
- Clean WhatsApp-style header with user profile and status
- Message bubbles with distinct styling for sent and received messages
- Real-time message updates with smooth scrolling
- File attachment support (images and videos)
- Timestamp display for each message
- Auto-resizable message input for long messages
- End-to-end encrypted messaging
- Built-in emoji picker for quick reactions
- Business tools: invoice, notice, and data templates

### User Experience
- Instant chat switching with automatic scroll to bottom
- Search functionality to find conversations quickly
- Online/offline status indicators
- Profile editing and media view options
- Responsive design for all screen sizes
- Business profile with company info, industry, and website

### Security
- End-to-end encryption using RSA-OAEP + AES-GCM
- Private keys stored locally in browser storage
- Public keys shared via Firestore user profiles
- Graceful fallback to plaintext if recipient keys are unavailable

### Technical Highlights
- Firebase authentication and real-time database
- Cloudinary for file uploads
- Glass-morphism UI with backdrop-blur effects
- End-to-end encryption with Web Crypto API
- Smooth animations and transitions
- Mobile-first responsive design
- Auto-resizing chat input
- Built-in emoji picker
- Business messaging templates

## Project Structure

```
ChatApp/
├── src/
│   ├── components/
│   │   ├── LeftSidebar/          # Chat list and search
│   │   ├── ChatBox/              # Main chat interface with business tools
│   │   └── RightSidebar/         # Profile and media panel
│   ├── context/                # App-level state management
│   ├── config/                 # Firebase configuration
│   ├── lib/                    # Utility functions (Cloudinary upload, E2EE)
│   ├── pages/                  # Login, Chat, Profile Update
│   │   ├── Login/              # Login with business account support
│   │   └── ProfileUpdate/      # Profile with business fields
│   ├── assets/                 # App assets (icons, images)
│   └── index.css              # Global styles
├── .env                       # Environment variables
├── vite.config.js             # Vite configuration
└── README.md                  # Project documentation
```

## Development

### Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint linting
- `npm run preview` - Preview the built application

### Environment Setup

Create a `.env` file in the project root with the following variables:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_CLOUDINARY_FOLDER=chatnova
```

## Features Implemented

### UI/UX Improvements
- ✅ WhatsApp-style green theme throughout the application
- ✅ Modern glass-morphism design with backdrop-blur effects
- ✅ Clean, intuitive interface with familiar WhatsApp patterns
- ✅ Responsive design optimized for mobile and desktop
- ✅ Smooth animations and transitions
- ✅ Real-time chat experience
- ✅ File sharing capabilities
- ✅ User status indicators
- ✅ Chat search functionality
- ✅ Profile management
- ✅ Media gallery viewing
- ✅ Auto-resizable chat input
- ✅ Emoji picker support
- ✅ WhatsApp Business-style templates (Invoice, Notice, Data)
- ✅ Business account type with company profile fields

### Security & Encryption
- ✅ End-to-end message encryption (RSA-OAEP + AES-GCM)
- ✅ Per-user key pair generation and storage
- ✅ Public key distribution via Firestore user profiles
- ✅ Graceful plaintext fallback when recipient keys are unavailable

### Technical Enhancements
- ✅ Firebase integration for real-time messaging
- ✅ Cloudinary for file uploads
- ✅ TypeScript for type safety
- ✅ ESLint for code quality
- ✅ Component-based architecture
- ✅ Responsive breakpoints for mobile optimization

## Future Enhancements

The project has a solid foundation for future development:

- **Dark Mode** - Toggle between light and dark themes
- **Emoji Reactions** - Add emoji reactions to messages
- **Message Read Receipts** - Track message delivery status
- **Typing Indicators** - Show when others are typing
- **Message Search** - Search within conversations
- **Call Integration** - Voice and video call functionality
- **Group Chats** - Multi-user chat support
- **Key Rotation** - End-to-end encryption key refresh workflow
- **Forward Secrecy** - Per-message session keys
- **Business Catalog** - Product catalog for business accounts
- **Payment Integration** - Inline payments for invoices
- **Business Analytics** - Message delivery and engagement stats

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is licensed under the MIT License.
