# WOPR Sound Effects

## Expected Files

Place your audio files in this directory:

- **dialup.wav** - Dial-up modem connection sound (plays at startup)
  - Recommended duration: 3-10 seconds
  - Format: WAV, MP3, or OGG
  - Volume will be automatically set to 60%

## Notes

- The dial-up sound will play automatically when the WOPR interface initializes
- Users can toggle the dial-up sound on/off using the phone button (📞/📵)
- For best effect, use authentic dial-up modem sounds from the 1980s era
- The sound adds to the authentic War Games computer experience

## File Naming

Make sure your dial-up modem sound file is named exactly: `dialup.wav`

If you use a different format, update the filename in the component:
`frontend/wopr-frontend/src/app/wopr-chat/wopr-chat.ts` line ~108