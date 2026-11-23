# lbl-visitor-fill

A browser bookmarklet that fills in the host part of the LBNL Site Access
visitor request form (Veoci) with your default values, so you don't have to
type them in for every visitor.

It fills in:

- Host (selected from the host list by your name)
- Host phone number
- Host country of citizenship and country of birth
- Host division
- Primary visiting building or location
- The "I certify ..." checkboxes
- The Real ID confirmation

It **never submits** the form. Review everything, add the visitor details and
click Submit yourself.

It works in Firefox, Chrome, Edge and other current desktop browsers.

## Requirements

- [Node.js](https://nodejs.org/), only to build the bookmarklet.

## Configure

Your personal values live in `config.js`, which is ignored by git.

```sh
cp config.example.js config.js
```

Edit `config.js`:

| Setting              | Meaning                                                              |
|----------------------|----------------------------------------------------------------------|
| `hostName`           | Your name as it appears in the LBNL host list, as `First Last`       |
| `hostPhone`          | Your phone number                                                    |
| `hostCitizenship`    | `search`: text typed into the dropdown; `option`: regex the entry must match |
| `hostBirth`          | Same, for the country of birth                                       |
| `division`           | Same, for your division, e.g. `{ search: 'AA', option: /^\s*AA\s*-/i }` |
| `building`           | Building(s) or location, e.g. `'50'` or `'50,50A'`                   |
| `tickCertifications` | `true` to tick all "I certify ..." checkboxes                        |
| `tickRealId`         | `true` to tick the Real ID confirmation                              |

## Build

```sh
node build.js
```

This creates `bookmarklet.txt` and `install.html`. Both contain your personal
values and are ignored by git, so don't share them.

## Install

1. Open `install.html` in your browser.
2. Drag the "Fill visitor defaults" link to your bookmarks toolbar.
   (Show the toolbar with Ctrl+Shift+B if it is hidden.)

Alternatively, create a new bookmark by hand and paste the content of
`bookmarklet.txt` as its URL.

After changing `config.js`, run `node build.js` again and replace the bookmark.

## Use

1. Open the Site Access visitor request form.
2. Click the bookmark.
3. A status box in the top right corner shows what was filled in (✓) and what
   failed (✗). Click the box to close it.
4. Check the form, fill in the visitor's details and submit.

If a step fails, the form layout has probably changed. Fill in that field by
hand; the source is in `fill-visitor.js`.

## Notes

- Company-managed browsers may block `javascript:` bookmarks by policy. If
  clicking the bookmark does nothing at all, that is the likely reason.
