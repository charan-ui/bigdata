const chalk = require('chalk');

const info = (log) => {
  console.log(chalk.green(log));
}

const error = (log) => {
  console.log(chalk.redBright(log));
}

module.exports = {
  info,
  error,
};
