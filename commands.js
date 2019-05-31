/* globals Cypress, before, after, cy */
/* eslint-env browser */
const {
  merge,
  cloneDeep
} = require('lodash');
const { initUi } = require('./src/ui');
const { initConfig } = require('./src/config');
const commands = require('./src/commands/index');
const cleanUpSnapshots = require('./src/utils/commands/cleanupSnapshots');
const getConfig = require('./src/utils/commands/getConfig');
const { NO_LOG } = require('./src/constants');

function addCommand(commandName, method) {
  Cypress.Commands.add(commandName, {
    prevSubject: true
  }, (commandSubject, taskOptions) => {
    if (!commandSubject) {
      return commandSubject;
    }

    const options = merge({}, cloneDeep(getConfig()), taskOptions);
    return cy.wrap(commandSubject, NO_LOG)
      .then((subject) => method(subject, options));
  });
}

function initCommands() {
  // Initialize config by getting it once
  const config = getConfig();
  initConfig(config)

  // Inject CSS & JavaScript
  before(() => {
    initUi();
  });

  function closeSnapshotModal() {
    try {
      if (window.top.closeSnapshotModal) {
        window.top.closeSnapshotModal();
      }
    } catch(ex) {
      window.console.error(ex);
    }
  }

  // Close snapshot modal before all test restart
  Cypress.on('window:before:unload', closeSnapshotModal);

  // Clean up unused snapshots
  after(() => {
    cleanUpSnapshots();
  });

  // Add commands
  Object.keys(commands).forEach(key => addCommand(key, commands[key]));
}

module.exports = {
  initCommands,
};

if (!process.env.JEST_WORKER_ID) {
  initCommands();
}
