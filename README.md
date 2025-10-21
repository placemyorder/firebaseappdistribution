# FirebaseAppDistribution
Used to distribute an apk, aab or ipa via Firebase App Distribution. This was initially uploadtofirebase.ps1. And later converted to an action.

## Key Difference from wzieba/Firebase-Distribution-Github-Action

This action is based on [wzieba/Firebase-Distribution-Github-Action](https://github.com/wzieba/Firebase-Distribution-Github-Action) but **does not use Docker**. Instead, it runs as a JavaScript action directly on the runner, which provides:
- Faster execution (no Docker image pull/build overhead)
- Runs natively on Linux and macOS runners - No Docker required
- Lower resource usage

Much of the documentation below is referenced from the original action

## Inputs

### `appId`

**Required** App id can be found in the Firebase console in your Projects Settings, under Your apps. It is in the following format 1:1234567890123942955466829:android:1234567890abc123abc123

### `credentialFileContent`
**Required** Content of Service Credentials private key JSON file. [Learn here how to generate one](https://github.com/wzieba/Firebase-Distribution-Github-Action/wiki/FIREBASE_TOKEN-migration).

### `appPath`

**Required** Artifact to upload (.apk, .aab or .ipa)

### `groups`

Distribution groups

### `testers`

Distribution testers. The email address of the testers you want to invite.

### `releaseNotes`

Release notes visible on release page. If not specified, plugin will add last commit's
 - hash
 - author
 - message
 
### `releaseNotesFile`

Specify the release note path to a plain text file.

## Outputs

### `FIREBASE_CONSOLE_URI`

Link to uploaded release in the Firebase console.

### `TESTING_URI`

Link to share release with testers who have access.

### `BINARY_DOWNLOAD_URI`

Link to download the release binary (link expires in 1 hour).

## Sample usage

```
name: Build & upload to Firebase App Distribution 

on: [push]

jobs:
  build:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v1
    - name: upload artifact to Firebase App Distribution
      uses: placemyorder/FirebaseAppDistribution@v1
      with:
        appId: ${{secrets.FIREBASE_APP_ID}}
        credentialFileContent: ${{ secrets.CREDENTIAL_FILE_CONTENT }}
        groups: testers
        appPath: app/build/outputs/apk/release/app-release-unsigned.apk
```
