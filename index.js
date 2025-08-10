const core = require('@actions/core');
const { spawn } = require('child_process');
const path = require('path');

const inputs = {
    appPath: core.getInput('appPath', { trimWhitespace: false }),
    appId: core.getInput('appId'),
    credentialFileContent: core.getInput('credentialFileContent', { trimWhitespace: false }),
    firebaseToken: core.getInput('firebaseToken'),
    groups: core.getInput('groups'),
    releaseNotes: core.getInput('releaseNotes', { trimWhitespace: false }),
    releaseNotesFile: core.getInput('releaseNotesFile'),
    testers: core.getInput('testers')
};

const exec = (cmd, args = []) =>
    new Promise((resolve, reject) => {
        console.log(`Running command: ${cmd} ${args.map(a => a.includes(' ') ? `"${a}"` : a).join(' ')}`);
        const app = spawn(cmd, args, { stdio: 'inherit' });
        app.on('close', code => {
            if (code !== 0) {
                const err = new Error(`Invalid status code: ${code}`);
                err.code = code;
                return reject(err);
            }
            resolve();
        });
        app.on('error', reject);
    });

(async () => {
    try {
        const args = [path.join(__dirname, './entrypoint.sh')];

        Object.entries(inputs).forEach(([key, value]) => {
            if (value) args.push(`--${key}`, value);
        });

        await exec('bash', args);
    } catch (err) {
        console.error(err);
        process.exit(err.code || 1);
    }
})();
