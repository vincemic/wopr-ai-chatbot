# WOPR Sound Effects

## Expected Files

Place your audio files in this directory:

- **dialup.wav** - Dial-up modem connection sound (plays at startup)

  - Recommended duration: 3-10 seconds
  - Format: WAV, MP3, or OGG
  - Volume will be automatically set to 60%

- **computer-beeps.wav** - Computer beeping sounds for launch code cracking sequence

  - Recommended duration: 3-10 seconds (will loop automatically)
  - Format: WAV, MP3, or OGG
  - Volume will be automatically set to 30%
  - Suggested audio: Authentic 1980s computer beeping sounds

## Notes

- The dial-up sound plays automatically when the WOPR interface initializes
- The computer beeps play during the `/launchcodes` or `/crack` command sequence
- Users can toggle audio on/off using the `/tension` or `/music` commands
- Both audio files add to the authentic War Games computer experience
- Computer beeps will loop continuously during the 30-second launch code sequence

## File Naming

Make sure your audio files are named exactly:

- `dialup.wav` - for the dial-up modem sound
- `computer-beeps.wav` - for the launch code computer beeps

If you use different formats, update the filenames in the component:

- Dialup: `frontend/wopr-frontend/src/app/wopr-chat/wopr-chat.ts`
- Computer beeps: `frontend/wopr-frontend/src/app/services/launch-code.service.ts`
