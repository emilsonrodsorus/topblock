App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    console.log('loading auth');
    console.log(web3);
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Blocks.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var BlockArtifact = data;
      App.contracts.Blocks = TruffleContract(BlockArtifact);
    
      // Set the provider for our contract
      App.contracts.Blocks.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      App.markBlocked();
      App.handleMintABlock("");
      return App.markBlocked();
    });    

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleMintABlock);
  },

  markBlocked: function() {
    var blockInstance;

    App.contracts.Blocks.deployed().then(function(instance) {
      blockInstance = instance;

      return blockInstance.getBlockers.call();
    }).then(function(blockers) {
      console.log('blockers');
      console.log(blockers);
      for (i = 0; i < blockers.length; i++) {
        if (blockers[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleMintABlock: function(event) {
    //event.preventDefault();

    //var blockId = parseInt($(event.target).data('id'));
    var blockId = 2;

    var blockInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Blocks.deployed().then(function(instance) {
        blockInstance = instance;

        // Execute adopt as a transaction by sending account
        return blockInstance.mintABlock(blockId, {from: account});
      }).then(function(result) {
        return App.markBlocked();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
