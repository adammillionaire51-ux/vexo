# VEXO portfolio

A responsive trilingual (Arabic, English, French) portfolio and Firebase-backed project manager. Projects are stored in Cloud Firestore and their videos are embedded from YouTube, Instagram Reels, or TikTok; video files are not uploaded.

## Run locally

Do not double-click `index.html`: Firebase browser modules require an HTTP/HTTPS origin. In VS Code, start the **Live Server** extension and open its `http://localhost` address. Alternatively, if Python is installed, serve this folder over HTTP:

```powershell
py -m http.server 8000
```

Open `http://localhost:8000`. Firebase Authentication and Firestore must be configured in the Firebase project. Opening the HTML file directly now displays instructions instead of an endless loading indicator.

## Firebase setup

1. In Firebase Console, enable **Authentication → Sign-in method → Email/Password**.
2. Create the administrator account under **Authentication → Users**. Do not add a public sign-up form.
3. Create a Cloud Firestore database.
4. In `firestore.rules`, replace `owner@yourdomain.com` with the administrator's verified email address, then publish the rules. Only that verified account can create, edit, or delete projects; project reads are public.
5. Publish the contents of this folder on a static host. Add the deployed domain and `localhost` to **Authentication → Settings → Authorized domains** if needed.
6. Replace the sample `hello@vexo.studio` contact address in `index.html` with your own email address.

The Firebase web API key in `firebase.js` identifies the Firebase project; it is not an administrator password. Security depends on Firebase Authentication and the Firestore rules. Never put an admin password in client-side code.

## Managing projects

Open `admin.html` directly, sign in with the Firebase administrator account, and add a title, category, and supported video link. YouTube covers are generated automatically, TikTok covers are retrieved when the public video is available, and Instagram shows an embedded preview when the post is public and allows embedding. For private or non-embeddable Instagram videos, use the optional cover image URL. The TikTok thumbnail lookup uses the public TikWM service. Visitors can play supported embeds in the project viewer.

The app loads Firebase's browser SDK from Google's CDN. It does not require a build step or a package install.
