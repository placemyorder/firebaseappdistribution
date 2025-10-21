const core = require('@actions/core');
const { spawn } = require('child_process');
const path = require('path');

const inputs = {
    appPath: core.getInput('appPath', { trimWhitespace: false }),
    appId: core.getInput('appId'),
    credentialFileContent: core.getInput('credentialFileContent', { trimWhitespace: false }),
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

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    const maxRetries = 3;
    let attempt = 0;

    const args = [path.join(__dirname, './entrypoint.sh')];
    Object.entries(inputs).forEach(([key, value]) => {
        if (value) args.push(`--${key}`, value);
    });

    while (attempt < maxRetries) {
        try {
            attempt++;
            console.log(`Attempt ${attempt} of ${maxRetries}`);
            await exec('bash', args);
            console.log('Command succeeded');
            break;
        } catch (err) {
            console.error(`Attempt ${attempt} failed with error:`, err.message);
            if (attempt >= maxRetries) {
                console.error('Max retry attempts reached. Exiting.');
                process.exit(err.code || 1);
            }
            console.log('Retrying in 5 seconds...');
            await sleep(5000);
        }
    }
})();
