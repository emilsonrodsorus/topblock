App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    App.countDown();
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
      //App.markBlocked();
      //App.handleMintABlock("");
      App.validateUser();
      return App.markBlocked();
    });    

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleMintABlock);
  },

  validateUser: () => {
    var blockInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if(error) console.log(error);

      if(accounts.length) {
        $('#connect-link-section').text($('#connect-link-section').text().replace("Connect Wallet", "Connected"));
      }
    })
  },

  markBlocked: function() {
    var blockInstance;

    App.contracts.Blocks.deployed().then(function(instance) {
      blockInstance = instance;

      return blockInstance.getBlockers.call();
    }).then(function(blockers) {
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
      swal("Are you sure yoy want mint!");
        
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
  },

  toDay: 0,
  toHour: 0,
  toMinute: 0,
  toSecond: 5,

  //cuenta atras
  countDown: function(){

    App.toSecond=App.toSecond-1;

    if(App.toSecond<0){
      App.toSecond=59;
      App.toMinute=App.toMinute-1;
    }

    if(App.toMinute<0){
      App.toMinute=59;
      App.toHour=App.toHour-1;
    }

    if(App.toHour<0){
      App.toHour=23;
      App.toDay=App.toDay-1;
    }

    if(App.toDay<0) {
      //final
      App.createNFT();  
    }    
    else{
      $('.text-counter').text(`${App.toDay}d ${App.toHour}h ${App.toMinute}m ${App.toSecond}s`);
      setTimeout(App.countDown,1000);
    }
  },

  // create NFT
  createNFT: function(){
    var ipfs = window.IpfsHttpClient.create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https'
    });
    console.log('creating image'); 
    domtoimage.toBlob(document.getElementById('canvas-wrapper'))
    .then(function(blob) {
      console.log('creating blob');
      console.log(blob);      
      new Response(blob).arrayBuffer().then(arrayBuffer => {
        const buf = buffer.Buffer(arrayBuffer)
        // ipfs.add(blob).then(cid => {
        //   console.log(cid)
        // }).catch(error => {
        //   console.log(error);
        // });
        ipfs.add(buf).then(result => {
          console.log('success ipfs');
          console.log(result);
        }).catch(error => {
          console.log('fail ipfs');
          console.log(error);
        });
      })
      
    }).catch(function (error){
      console.log('error');
      console.log(error);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
