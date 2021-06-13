const fs = require('fs');
const path = require('path');

function enumeratePackages(dir) {
    const files = fs.readdirSync(dir)
        .map((file) => path.resolve(dir, file));

    const subDirs = files.filter((file) => {
        const basename = path.basename(file);

        if (basename === 'node_modules') {
            return false;
        }

        const stats = fs.lstatSync(file);

        return stats.isDirectory();
    });

    const packages = subDirs.reduce(
        (packages, subDir) => {
            return packages.concat(
                enumeratePackages(subDir)
            );
        },
        files.filter(
            (file) => path.basename(file) === 'package.json'
        )
    );

    return packages;
};

module.exports = enumeratePackages;
