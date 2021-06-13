const path = require('path');
const { Command } = require('commander');
const pkg = require('../package.json');
const {
    enumeratePackages,
    upgradePackages
} = require('./methods');

module.exports = async () => {
    const up = async () => {
        const dir = path.resolve(process.cwd());

        let packages;

        packages = enumeratePackages(dir);
        packages = await upgradePackages(packages);
    };

    const program = new Command();

    program
        .name('spruce')
        .version(pkg.version)
        .option('-e, --exclude <file | directory>', 'excludes a file or directory')
        .option('-h, --help', 'shows the program help')
        .option('-v, --verbose', 'prints details of program\'s execution')
        .command('up')
            .description('change package versions to the latest')
            .action(up);

    program.parse(process.argv);

    // const options = program.opts();

    // if (options.help) {
    //     program.outputHelp();
    // }
};