# Location Lookup Feature for WOPR AI Chatbot

## Overview
Added comprehensive location lookup functionality to the WOPR AI chatbot that integrates with OpenAI's function calling API.

## Features Added

### 1. Core Location Function
- **Function Name**: `get_current_location`
- **Description**: Retrieve current geographical location coordinates and address information for tactical analysis
- **Integration**: Available as OpenAI function call when API key is configured
- **Default Fallback**: Seattle, Washington coordinates when GPS is unavailable or denied

### 2. Parameters
- `precision`: Location precision level (high/medium/low)
  - **High**: GPS with maximum accuracy, 15s timeout
  - **Medium**: Balanced GPS accuracy, 10s timeout (default)
  - **Low**: Network-based positioning, 5s timeout
- `include_address`: Boolean to include reverse geocoded address information (default: true)

### 3. Capabilities
- **GPS Coordinates**: Latitude, longitude with accuracy measurements
- **Default Location**: Falls back to Seattle, Washington (47.6062°, -122.3321°) when GPS unavailable
- **Additional Data**: Altitude, heading, speed (when available)
- **Military Grid Reference System (MGRS)**: Simplified grid coordinates
- **Strategic Assessment**: Basic tactical value assessment
- **Reverse Geocoding**: Address lookup using OpenStreetMap Nominatim API
- **Error Handling**: Graceful fallback to default Seattle location on any geolocation failure

### 4. Slash Commands
- `/location` or `/gps`: Test the tactical positioning system directly
- **Help Integration**: Commands appear in `/help` output

### 5. Data Output Format
```
TACTICAL LOCATION ACQUISITION COMPLETE
[USING DEFAULT NORAD SECTOR COORDINATES - when GPS unavailable]

COORDINATES ACQUIRED:
- Latitude: XX.XXXXXX°
- Longitude: XX.XXXXXX°
- Accuracy: ±XX meters (or ±1000 meters DEFAULT SECTOR)
- Acquisition Time: XXXms
- Precision Level: MEDIUM (or DEFAULT FALLBACK)
- Data Source: GPS CONSTELLATION (or NORAD SECTOR DATABASE)

MILITARY GRID REFERENCE:
XX XXXXX XXXXX

TACTICAL ASSESSMENT:
- Position Quality: EXCELLENT/GOOD/FAIR/BASELINE
- Strategic Value: [Context-based assessment]
- Sector: [Geographic region or PACIFIC NORTHWEST COMMAND]

LOCATION INTELLIGENCE:
- Address: [Reverse geocoded address or Seattle default]
- City: [City name or Seattle]
- Region: [State/region or Washington]
- Country: [Country or United States]
- Postal Code: [ZIP code]

FALLBACK STATUS: ACTIVE (when using default location)
NOTE: GPS UNAVAILABLE - USING NORAD DEFAULT COORDINATES (when applicable)
RECOMMENDATION: ENABLE LOCATION SERVICES FOR PRECISE POSITIONING

TIMESTAMP: [ISO timestamp]
CLASSIFICATION: CONFIDENTIAL
```

## Technical Implementation

### Files Modified
1. **`src/app/services/wopr-tools.service.ts`**
   - Added `get_current_location` function definition
   - Implemented `getCurrentLocation()` method
   - Added helper methods for MGRS, strategic assessment, reverse geocoding

2. **`src/app/models/wopr-tools.models.ts`**
   - Added `LocationData` interface

3. **`src/app/wopr-chat/wopr-chat.ts`**
   - Added `/location` and `/gps` slash commands
   - Implemented `testLocationLookup()` method
   - Updated help command to include location commands

### Dependencies
- **Browser Geolocation API**: Core positioning functionality
- **OpenStreetMap Nominatim API**: Free reverse geocoding service
- **OpenAI Function Calling**: Integration with AI chat

## Security & Privacy
- **User Consent**: Requires explicit user permission for location access
- **Local Processing**: No location data sent to external servers except OpenStreetMap for reverse geocoding
- **Error Handling**: Graceful degradation when location access is denied
- **Classification**: Data marked as "CONFIDENTIAL" in WOPR style

## Testing
- Created comprehensive test suite in `tests/wopr-location.spec.ts`
- Tests cover:
  - Help command integration
  - Slash command functionality
  - OpenAI function calling integration
  - Error handling scenarios

## Usage Examples

### Via OpenAI Chat (with API key configured)
```
User: "What is my current location?"
WOPR: [Executes get_current_location function and provides tactical assessment]
```

### Via Slash Commands
```
/location
/gps
```

### Function Calling Parameters
```json
{
  "precision": "high",
  "include_address": true
}
```

## Error Scenarios Handled
1. **Geolocation not supported**: Clear error message with alternatives
2. **Permission denied**: Instructions for enabling location permissions
3. **Position unavailable**: Suggestions for better positioning
4. **Timeout**: Retry recommendations with lower precision
5. **Reverse geocoding failure**: Graceful fallback with coordinate-only data

## Browser Compatibility
- **Modern browsers**: Full functionality with HTML5 Geolocation API
- **HTTPS required**: Most browsers require secure context for geolocation
- **Mobile devices**: Optimized for mobile GPS and network positioning

## Integration with WOPR Theme
- Military-style output formatting
- DEFCON/tactical terminology
- Strategic assessment language
- Classification markings
- Grid reference systems (MGRS)
- Error messages in WOPR voice

This implementation provides a robust, secure, and thematically appropriate location lookup system that enhances the WOPR chatbot's tactical capabilities while maintaining the authentic 1980s military computer aesthetic.