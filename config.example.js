// Copy this file to config.js and put in your own values:
//   cp config.example.js config.js
// config.js is ignored by git, so your personal data stays local.
module.exports = {
  // Your name exactly as it appears in the LBNL host list ("First Last").
  hostName: 'Jane Doe',
  // Your phone number.
  hostPhone: '510-555-0100',
  // search: text typed into the dropdown; option: regex the entry must match.
  hostCitizenship: { search: 'United States', option: /^United States$/i },
  hostBirth: { search: 'United States', option: /^United States$/i },
  // Division code, e.g. 'AA' for "AA - ...".
  division: { search: 'XX', option: /^\s*XX\s*-/i },
  // Primary visiting building(s) or location.
  building: '50',
  // Tick all "I certify ..." checkboxes.
  tickCertifications: true,
  // Tick the Real ID confirmation.
  tickRealId: true,
};
