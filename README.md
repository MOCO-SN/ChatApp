# Chat Nova - WhatsApp-style Real-time Messaging App

A modern, WhatsApp-inspired messaging application built with React, Firebase, and Vite. Features a clean, glass-morphism design with smooth animations and real-time chat functionality.

## Key Features

- **WhatsApp-style UI** - Clean, familiar interface with green accent colors
- **Real-time Messaging** - Instant message delivery with Firebase
- **Glass-morphism Design** - Modern backdrop-blur effects
- **Responsive Layout** - Works perfectly on desktop and mobile
- **File Sharing** - Support for images and videos
- **User Status** - Online/offline indicators with timestamp
- **Chat Search** - Quick search functionality
- **Profile Management** - Edit profile, view media, and account settings

## Technology Stack

- **Frontend**: React 19, Vite 7, TypeScript
- **Styling**: CSS with modern custom properties
- **Backend**: Firebase (Authentication, Firestore)
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

### User Experience
- Instant chat switching with automatic scroll to bottom
- Search functionality to find conversations quickly
- Online/offline status indicators
- Profile editing and media view options
- Responsive design for all screen sizes

### Technical Highlights
- Firebase authentication and real-time database
- Cloudinary for file uploads
- Glass-morphism UI with backdrop-blur effects
- Smooth animations and transitions
- Mobile-first responsive design

## Project Structure

```
ChatApp/
├── src/
│   ├── components/
│   │   ├── LeftSidebar/          # Chat list and search
│   │   ├── ChatBox/              # Main chat interface
│   │   └── RightSidebar/         # Profile and media panel
│   ├── context/                # App-level state management
│   ├── config/                 # Firebase configuration
│   ├── lib/                    # Utility functions (Cloudinary upload)
│   ├── pages/                  # Login, Chat, Profile Update
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
- **Emoji Support** - Add emoji reactions and support
- **Message Read Receipts** - Track message delivery status
- **Typing Indicators** - Show when others are typing
- **Message Search** - Search within conversations
- **Call Integration** - Voice and video call functionality
- **Group Chats** - Multi-user chat support
- **File Encryption** - Secure file transfers

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is licensed under the MIT License.
