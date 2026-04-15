# MMM-Face-Multi-User-Recognition-SMAI

A modernized [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror) module that displays a user profile image and time-based greeting when face-recognition login events are received.

This module is a **UI layer** for [MMM-Face-Reco-DNN](https://github.com/nischi/MMM-Face-Reco-DNN), which performs the actual face detection/recognition.

## Compatibility

- MagicMirror²: **>= 2.35.0**
- Node.js: **>= 22.21.1 < 23 OR >= 24**
- npm: **>= 10** (recommended)

## Features

- Personalized greeting messages (morning/afternoon/evening)
- Guest fallback state when no user is logged in
- Loading and error states in the UI
- Supports multiple image extensions (`jpg`, `jpeg`, `png`, `webp`, `gif`)
- Translation support (`en`, `de`, `es`, `ko`)

## Installation

### Step 1: Clone into your MagicMirror modules directory

```bash
cd ~/MagicMirror/modules
git clone https://github.com/jimbydude/MMM-Face-Multi-User-Recognition-SMAI.git
cd MMM-Face-Multi-User-Recognition-SMAI
```

### Step 2: Install dependencies

Option A (recommended):

```bash
./install.sh
```

Option B (manual):

```bash
npm install
```

### Step 3: Add module config to `config/config.js`

```js
{
  module: "MMM-Face-Multi-User-Recognition-SMAI",
  position: "top_right",
  config: {
    useMMMFaceRecoDNN: true,
    width: "220px",
    position: "center",
    imageType: "jpg",
    imageExtensions: ["jpg", "jpeg", "png", "webp", "gif"],
    morningStartTime: 3,
    morningEndTime: 12,
    afternoonStartTime: 12,
    afternoonEndTime: 17,
    animationSpeed: 300
  }
}
```

### Step 4: Ensure image assets exist

Put images in:

```text
modules/MMM-Face-Multi-User-Recognition-SMAI/public/
```

Expected example structure:

```text
public/
  guest.gif
  james.jpg
  roseann.png
```

The image base name should match the username emitted by `MMM-Face-Reco-DNN` in the `USERS_LOGIN` notification.

## Configuration options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `useMMMFaceRecoDNN` | `boolean` | `true` | Enables reaction to DNN face recognition notifications. |
| `width` | `string` | `"200px"` | Width for the content container. |
| `position` | `string` | `"lower_third"` | Alignment class used in the module (`left`, `center`, `right`, etc.). |
| `imageType` | `string` | `"jpg"` | Preferred extension for user image lookup. |
| `imageExtensions` | `string[]` | `['jpg','jpeg','png','webp','gif']` | Extensions searched when loading user avatars. |
| `morningStartTime` | `number` | `3` | Start hour (24h) of morning greeting. |
| `morningEndTime` | `number` | `12` | End hour (24h) of morning greeting. |
| `afternoonStartTime` | `number` | `12` | Start hour (24h) of afternoon greeting. |
| `afternoonEndTime` | `number` | `17` | End hour (24h) of afternoon greeting. |
| `animationSpeed` | `number` | `300` | DOM update animation speed in ms. |
| `updateInterval` | `number` | `10000` | Retained for compatibility. |
| `retryDelay` | `number` | `5000` | Retained for compatibility. |
| `interval` | `number` | `2000` | Retained for compatibility. |

## Notifications consumed

- `USERS_LOGIN` — payload expected to be a user name string
- `USERS_LOGOUT_MODULES` — logs out active user and returns to guest state

## Development scripts

```bash
npm run lint
npm run lint:js
npm run lint:css
npm run lint:md
npm run format
```

## Troubleshooting

### Module shows loading forever

- Check that `public/guest.gif` exists.
- Confirm file permissions allow MagicMirror to read the file.
- Open the browser dev console and look for module errors.

### User image does not appear

- Confirm the username from `USERS_LOGIN` exactly matches the image filename base.
- Ensure one of the configured extensions exists in `public/`.
- Example: username `james` can match `james.jpg`, `james.png`, etc.

### No login updates are shown

- Verify `MMM-Face-Reco-DNN` is installed and running.
- Confirm this module is loaded in `config.js`.
- Keep `useMMMFaceRecoDNN: true`.

### Node version mismatch / npm install fails

- Check Node version: `node -v`
- Install a compatible Node release:
  - `>= 22.21.1 < 23`, or
  - `>= 24`

## Credits

- Original module by James Macdonald
- Based on prior work from Eben Kouao: [MMM-Face-Recognition-SMAI](https://github.com/EbenKouao/MMM-Face-Recognition-SMAI)
- Integrates with MMM-Face-Reco-DNN by nischi

## License

MIT
