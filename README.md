# HandSynth

An interactive gesture-based musical instrument that uses hand tracking technology to create music through motion.

## Features

- **Gesture-controlled music**: Play melodies and chords with hand movements
- **Responsive black hole visualization**: Visuals react to your musical input
- **Multiple scales and sounds**: Choose from various musical scales and instrument presets
- **Intuitive gesture controls**: 
  - Hand position controls notes/chords
  - Pinch gestures modify reverb
  - Finger distance adjusts volume
- **Google authentication**: Secure user accounts

## Tech Stack

- **MediaPipe Hands**: Real-time hand tracking
- **Tone.js**: Audio synthesis 
- **ES Modules**: Modular JavaScript architecture
- **Google Identity Services**: User authentication
- **Web Audio API**: High-quality sound generation

## Installation

```bash
# Clone the repository
git clone https://github.com/shaharfullstack/handsynth2.0.git
cd handsynth2.0

# Install dependencies
npm install

# Start development server
npm start
```

## Google Authentication Setup

1. Configure your Google Cloud OAuth credentials:
   - Replace the `CLIENT_ID` in `src/auth/auth.js` with your Google client ID
   - Add your development URL to authorized JavaScript origins in Google Cloud Console
   - For production, add your hosted domain to authorized origins

## Usage

1. Sign in with your Google account
2. Allow camera access when prompted
3. Click "Start Audio" button
4. Control music with your hands:
   - **Right hand**: Play melody notes (position = pitch)
   - **Left hand**: Play chords (position = chord)
   - **Thumb + index pinch**: Control reverb amount
   - **Middle finger + thumb distance**: Adjust volume

## Project Structure

```
src/
├── index.js              # Entry point
├── config.js             # Configuration and constants
├── auth/                 # Authentication
├── pages/                # Page components
├── audio/                # Audio synthesis and music theory
├── visual/               # Visual components and animations
├── ui/                   # User interface elements
├── tracking/             # Hand tracking functionality
└── utils/                # Utility functions
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari (limited support for Web Audio API)

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT
