const fs = require('fs');
const _ = require('lodash');
const getLatestVersion = require('latest-version');

async function upgradePackages(packages) {
    return await Promise.all(
        packages
        .map(async (package) => writePackage(
            await upgradePackage(
                readPackage(package)
            )
        ))
    );
};

function readPackage(package) {
    const json = JSON.parse(
        fs.readFileSync(package, {
            encoding: 'utf-8'
        })
    );

    return {
        location: package,
        contents: json
    };
}

function writePackage(task) {
    const json = JSON.stringify(task.contents, undefined, 2);

    fs.writeFileSync(task.location, json, {
        encoding: 'utf-8'
    });

    return task;
}

async function upgradePackage(task) {
    task = await upgradeSection('dependencies', task);
    task = await upgradeSection('devDependencies', task);
    task = await upgradeSection('peerDependencies', task);

    return task;
}

async function upgradeSection(section, task) {
    let dependencies = task.contents[section];

    if (dependencies) {
        dependencies = _.fromPairs(
            await Promise.all(
                _.toPairs(dependencies).map((entry) => upgradeEntry(entry))
            )
        );

        task.contents[section] = dependencies;
    }

    return task;
}

async function upgradeEntry([name, currentVersion]) {
    let version;

    if (version !== '*') {
        try {
            const latestVersion = await getLatestVersion(name);
    
            const prefix = currentVersion.startsWith('~') || currentVersion.startsWith('^')
                ? currentVersion.slice(0, 1)
                : '';

            version = `${prefix}${latestVersion}`;
        } catch (error) {
            if (error.message !== `Package \`${name}\` could not be found`) {
                console.error(error);
            }

            version = currentVersion;
        }
    }

    return [name, version];
}

module.exports = upgradePackages;
