import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import lightwallet from 'eth-lightwallet'

class Txfield extends Component{
  constructor(props){
    super(props)
    this.state= {value:this.props.value};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event){
    this.props.update(event.target.value);
    this.setState({value:event.target.value});
  }

  render(){
    return(
      <div>
        {this.props.property + ": "}<br/>
        <textarea value = {this.state.value} onChange = {this.handleChange} />
      </div>
    )
  }
}

class App extends Component {
  constructor(props){
    console.log(lightwallet)
    super(props);
    this.state = {
                    password: 'testpass',
                    pwDerivedKey: null,
                    address: null,
                    initialRunTime: null,
                  };
    
    this.txObject = { // value will change integers into appropriate form
      to: '0xc7e29a573d4c6b8800682b6618a0f04177accb78',
      gasLimit: 5000000000,
      gasPrice: 500000,
      value: 10,
      nonce: 0
    }
    var startTime = new Date() //track start time for initialization
    var thisObject = this; //hold this object for scope reasons
    //Light Wallet Initialization
    lightwallet.keystore.createVault({
      password:this.state.password,
      seedPhrase:"forget track antique track nurse offer armed garden bus lady lobster umbrella", // need to learn how to generate seed phrases
      hdPathString: "m/44'/60'/0'/0"
    },function(err,ks){
      thisObject.ks = ks; // save keyStore into parent object for future use.
      ks.keyFromPassword(thisObject .state.password, function(err,pwDerivedKey){
        if(err) throw err;

        ks.generateNewAddress(pwDerivedKey,1); // generates new addresses based on keys
        
        thisObject.passwordProvider = function(pw,callback){ // not sure what this call back is for.
          callback(null,pw);
        }
        var tempDate = new Date()
        //set state to load new components
        thisObject.setState({
                            pwDerivedKey:pwDerivedKey,
                            address: ks.getAddresses()[0],
                            initialRunTime: (tempDate - startTime)
                          });
      })
    })
  }

  updateTxValue(property,newVal){
      this.txObject[property] = newVal;
  }

  renderTxField(property){
    // console.log(this.txObject[property])
      return(
        <Txfield property = {property} value = {this.txObject[property]} update = {this.updateTxValue.bind(this,property)} />
      )
  }

  renderTest(){

    if(this.state.initialRunTime != null){
      var startTime = new Date();
      this.rawTx = lightwallet.txutils.valueTx(this.txObject);
      this.signed = lightwallet.signing.signTx(this.ks,this.state.pwDerivedKey,this.rawTx,this.state.address);
      this.signTime = (new Date()) - startTime;
      return (
        <div>
            <div>
              {"Raw Tx"}
              <div className = 'data'>
                {this.rawTx}
              </div>
            </div>
            <div>
              {"Signed Tx"}
              <div className = 'data'>
                {this.signed}
              </div>
            </div>
              <br/>
              {"Sign time: " + this.signTime+"ms"}
        </div>
      )      
    } else {
      return (
        <div>
          {"Loading initializing scripts"}
        </div>
      )
    }
  }

  render() {
    return (
      <div className="App">
        
        <div>
            {"Address:"+ this.state.address}<br/>
            <button onClick = {() => this.setState({initialRunTime:this.state.initialRunTime})}> Test Performance </button>
            {this.renderTxField('to')}
            {this.renderTxField('gasLimit')}
            {this.renderTxField('gasPrice')}
            {this.renderTxField('value')}
            {this.renderTxField('nonce')}
            <br/>
            {this.renderTest()}
        </div>
      </div>
    );
  }
}

export default App;
