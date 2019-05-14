const path = require('path')
const { DIR_SNAPSHOTS } = require('../../constants')
const { getConfig } = require('../../config')

function getSnapshotFilename(testFile, snapshotTitle) {
  const config = getConfig()
  if (config && typeof config.getTextSnapshotFilename === 'function') {
    return config.getTextSnapshotFilename({ testFile, snapshotTitle, dirSnapshots: DIR_SNAPSHOTS })
  }

  const dir = path.join(path.dirname(testFile), DIR_SNAPSHOTS)
  const filename = `${path.basename(testFile)}.snap`
  return path.join(dir, filename)
}

module.exports = getSnapshotFilename
