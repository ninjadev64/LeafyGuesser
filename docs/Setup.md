## How to host your own game server

### Prerequisite
- Google account
- [GitHub](https://github.com/) account
- [Netlify](https://www.netlify.com/) account

### STEP1: Fork this project
Create a [GitHub](https://github.com/) account if you don't have one and fork this project. (Click the **Fork** button at the top right corner of this project page.) There should be a copy of this project on your repositories now.

### STEP2. Connect your Nelify account to your Github
You could use any other hosting service but here I use [Netlify](https://www.netlify.com/). Create a Netlify account if you don't have one. Then connect your Netlify to your GitHub. You can do it when signing up or in user settings. (Click the avatar icon at the top right corner and there is a **Connected accounts** section there.)

### STEP3. Create a realtime database on Firebase
Create your project and register your app on Firebase. You can follow [these instructions](https://firebase.google.com/docs/web/setup#create-firebase-project-and-app). (Just follow Step 1: Create a Firebase project and register your app.)
After registering your app, follow [these instructions](https://firebase.google.com/docs/database/web/start#create_a_database) to set up your database.

### STEP4. Get Google API key
Go to the [Google Cloud Console](https://console.cloud.google.com/), and create a project. Then go to project top page and select **APIs & Services > Credentials** on the left sidebar. On the Credentials page, click **Create credentials > API key**. The new API key is listed on the **Credentials** page under **API keys**.

### STEP5. Host your website
Click **New site from Git** button on your Netlify top page. Click the GitHub icon and choose your forked repository. Click the **Show advanced** button and a **New variable** button will appear. Click the **New variable** button and you can set variables for your API key and credentials you created in steps 3 and 4. Click **Deploy site**.

That's it! Your site domain will appear on the project page after the project has been deployed. Now you can play games as much as you want!
