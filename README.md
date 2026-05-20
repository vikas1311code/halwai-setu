# Halwai Setu

A full-stack mobile booking platform that connects clients with halwais (caterers) for events and functions across India.


## Features

### For Clients
- Search halwais by event type (Wedding, Party, Festival, Corporate)
- Location-based halwai discovery
- Browse halwai profiles with ratings and pricing
- Book halwais with date/time selection
- Payment integration
- Real-time order tracking
- In-app chat with halwai
- Push notifications

### For Halwais
- Dashboard with earnings overview
- Order management (Accept/Reject)
- Earnings tracker (Weekly, Monthly, Yearly)
- ️ Profile management
- New booking notifications

## ️ Tech Stack

- **Frontend:** React Native, Expo
- **Navigation:** React Navigation (Stack + Bottom Tabs)
- **State Management:** React Context API
- **Storage:** AsyncStorage
- **UI:** Custom components with theme system
- **Auth:** OTP-based authentication, Email/Password login

## Project Structure

```
halwai-app/
├── App.js         # Entry point, navigation setup
├── src/
│  ├── context/
│  │  └── AuthContext.js # Auth state management
│  ├── screens/
│  │  ├── client/     # Client-side screens
│  │  ├── halwai/     # Halwai-side screens
│  │  ├── LoginScreen.js
│  │  ├── RegisterScreen.js
│  │  └── ...
│  └── utils/
│    ├── api.js     # API configuration
│    └── theme.js    # Colors and styling
```

## ️ Installation

```bash
# Clone the repository
git clone https://github.com/vikas1311code/halwai-setu.git

# Navigate to project directory
cd halwai-setu

# Install dependencies
npm install

# Start the development server
npx expo start
```

## ‍ Author

**Vikas Pandey** 
B.Tech CSE — IIIT Manipur 
[GitHub](https://github.com/vikas1311code) | [Email](mailto:vikaspandey131118@gmail.com)
