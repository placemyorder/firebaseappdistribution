#!/bin/bash

set -euo pipefail

# Usage function
usage() {
    echo "Usage: $0 --appPath <appPath> --appId <appId> [--credentialFileContent <credentialFileContent>] [--firebaseToken <firebaseToken>] [--groups <groups>] [--releaseNotes <releaseNotes>] [--releaseNotesFile <releaseNotesFile>] [--testers <testers>]"
    exit 1
}

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
  echo "Error: Firebase CLI is not installed. Please install it and try again."
  exit 1
fi

# Parse arguments
appPath=""
appId=""
credentialFileContent=""
firebaseToken=""
groups=""
releaseNotes=""
releaseNotesFile=""
testers=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --appPath) appPath="$2"; shift 2 ;;
        --appId) appId="$2"; shift 2 ;;
        --credentialFileContent) credentialFileContent="$2"; shift 2 ;;
        --firebaseToken) firebaseToken="$2"; shift 2 ;;
        --groups) groups="$2"; shift 2 ;;
        --releaseNotes) releaseNotes="$2"; shift 2 ;;
        --releaseNotesFile) releaseNotesFile="$2"; shift 2 ;;
        --testers) testers="$2"; shift 2 ;;
        *) usage ;;
    esac
done

# Validate required params
if [[ -z "$appPath" || -z "$appId" ]]; then
    usage
fi

# Require credentials
if [[ -z "$credentialFileContent" && -z "$firebaseToken" ]]; then
    echo "Either --credentialFileContent or --firebaseToken must be provided."
    exit 1
fi

# Build firebase command as array (safe for spaces)
cmd=(firebase appdistribution:distribute "$appPath" --app "$appId")

[[ -n "$groups" ]] && cmd+=(--groups "$groups")
[[ -n "$releaseNotes" ]] && cmd+=(--release-notes "$releaseNotes")
[[ -n "$releaseNotesFile" ]] && cmd+=(--release-notes-file "$releaseNotesFile")
[[ -n "$testers" ]] && cmd+=(--testers "$testers")

if [[ -n "$firebaseToken" ]]; then
    echo "Warning: Using --firebaseToken is deprecated; prefer --credentialFileContent."
    cmd+=(--token "$firebaseToken")
else
    # Write credentials file — detect if it's base64 and decode
    if echo "$credentialFileContent" | grep -q "{"; then
        # Looks like JSON
        echo "$credentialFileContent" > ./service_credentials_content.json
    else
        # Assume base64 encoded
        echo "$credentialFileContent" | base64 --decode > ./service_credentials_content.json
    fi
    export GOOGLE_APPLICATION_CREDENTIALS="./service_credentials_content.json"
fi

# Run command
echo "Running: ${cmd[*]}"
"${cmd[@]}"
