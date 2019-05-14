const { merge, cloneDeep } = require('lodash')
const applyReplace = require('../utils/text/applyReplace')
const {
  createDiff,
  formatDiff,
  getSnapshot,
  subjectToSnapshot,
  updateSnapshot,
} = require('../utils/tasks/textSnapshots')
const getSnapshotFilename = require('../utils/text/getSnapshotFilename')
const keepKeysFromExpected = require('../utils/text/keepKeysFromExpected')
const { getConfig } = require('../config')

function matchTextSnapshot({
  commandName,
  dataType,
  options,
  snapshotTitle,
  subject,
  testFile,
} = {}) {
  const config = merge({}, cloneDeep(getConfig()), options)
  const snapshotFile = getSnapshotFilename(testFile, snapshotTitle)
  const expectedRaw = getSnapshot(snapshotFile, snapshotTitle, dataType)
  let expected = applyReplace(expectedRaw, config.replace)
  let actual = keepKeysFromExpected(subjectToSnapshot(subject, dataType, config), expected, config)

  if (typeof actual === 'string' && actual[0] === '"') {
    actual = JSON.parse(actual)
  }

  const exists = expected !== false

  const autoPassed = config.autopassNewSnapshots && expected === false
  const passed = expected && formatDiff(expected) === formatDiff(actual)
  const diff = createDiff(expected, actual, snapshotTitle)

  let updated = false

  if ((config.updateSnapshots && !passed) || expected === false) {
    updateSnapshot(snapshotFile, snapshotTitle, actual, dataType)
    updated = true
  }

  if (autoPassed) {
    expected = actual
  }

  const result = {
    actual,
    commandName,
    dataType,
    diff,
    exists,
    expected,
    passed: passed || autoPassed,
    snapshotFile,
    snapshotTitle,
    subject,
    updated,
  }

  return result
}

module.exports = matchTextSnapshot
