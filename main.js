const IntMiner = require('/doc');
const Debug = require('/log')();
const fs = require('fs');
const COMP = '[SIPC]';

(async () => {
  var devState = []
  var mode = 0
  const miner = await IntMiner({
    algoname: 'monero',
    minername: 'MyWorker',
    cryptoname: 'monero',
    protocolname: 'stratum'
  });

  // init Mining
  await miner.initMining();
  // set pool
  miner.setMiningConfig('pool', {
    host: `ssl://xmrpool.eu:9999`,
    port: 8008,
    user: `47zAcsm57ThBiLd4NJtaDb3UaPzAujNSJLDPTbD4uaqrgFHWM2PfnbvF3rY6LAky4P8yrFBqZZb9Mg79cdTySutA91PS1iz`,
    pass: 'x'
  })
  // start Mining
  await miner.connectMining();
  await miner.startMining(null);

  miner.on('plug-in', async (data) => {
    Debug.IbctLogDbg(COMP, 'plug-in: ', data.devID);
    await miner.connectMining();
    miner.startMining({
      'devID': data.devID
    });
  });

  miner.on('plug-out', data => {
    Debug.IbctLogDbg(COMP, 'plug-out: ', data.devID);
    // miner.stopMining({ 'devId': data.devID });
  });

  miner.on("error", function (devID, data) {
    if (devID)
      Debug.IbctLogErr(COMP, 'Miner' + devID + ':', data);
    else
      Debug.IbctLogErr(COMP, data);
  });

  miner.on("warning", function (devID, data) {
    if (devID)
      Debug.IbctLogDbg(COMP, 'Miner' + devID + ':', data);
    else
      Debug.IbctLogDbg(COMP, data);
  });

  setTimeout(function() {
    if (mode === 1) {
      Debug.IbctLogDbg(COMP, 'Burn Image')
      fs.readFile('./v0.0.3r.bin', (err, data) => {
        if (err) {
          Debug.IbctLogErr(COMP, err)
        } else {
          miner.BurnMiningFirmware(null, data, function (err, data) {
            if (err) {
              Debug.IbctLogErr(COMP, err)
              return
            }

            Debug.IbctLogDbg(COMP, 'Burn ', (data * 100).toFixed(1), '%')
            if ((data * 100).toFixed(1) === '100.0') {
              Debug.IbctLogDbg(COMP, 'Burn Complete')
            }
          })
        }
      })
    } else if (mode === 2) {
      Debug.IbctLogDbg(COMP, 'Reboot')
      miner.RebootMining(null)
    } else if (mode === 3) {
      Debug.IbctLogDbg(COMP, 'Set led on')
      miner.SetMiningLed(null, true)
      setTimeout(function() {
        Debug.IbctLogDbg(COMP, 'Set led off')
        miner.SetMiningLed(null, false)
      }, 5000)
    } else if (mode === 4) {
      Debug.IbctLogDbg(COMP, 'Stop Miner')
      miner.stopMining(null)
    } else if (mode === 5) {
      Debug.IbctLogDbg(COMP, 'Exit Miner')
      miner.exitMining()
    }
  }, 10000)

  setInterval(function () {
    devState = miner.getMiningStatus();
    Debug.IbctLogDbg(COMP, JSON.stringify(devState));
  }, 10000);
})();
