import React, {Component} from "react";

import {Grid, Row, Col, Panel, Image} from "react-bootstrap";
import {Button, ButtonGroup, ButtonToolbar} from "react-bootstrap";
import {InputGroup, FormControl, Radio, ListGroup, ListGroupItem} from "react-bootstrap";

import Glyphicon from "react-bootstrap/lib/Glyphicon";

import "./css/bootstrap.min.css"
import "./css/style.css"

import getWeb3 from './getWeb3';
import truffleContract from 'truffle-contract';
import CoinToFlip from './contracts/CoinToFlip.json';


class CoinFlip extends Component {

    state = {
        web3: null,
        accounts: null,
        contract: null,

        value: 0,
        checked: 0,
        houseBalance: 0,
        show: false,
        reveal: 0,
        reward: 0,
        txList: []
    };
    
    constructor(props) {
        super (props);

        this.handleClickCoin = this.handleClickCoin.bind(this);
//        this.handleClickBet        
    }

    handleClickCoin(e) {
        
        if (this.state.checked === 0 ) {
            if (e.target.id === 'Heads') {
                this.setState({checked: 2});
            } else if (e.target.id === 'Tails') {
                this.setState({checked: 1});
            }
        } else {
            this.setState({checked: 0});
        }

    }

    async handleClickBet() {

        //객체 비구조화 방식
        const {web3, accounts, contract} = this.state; //object destructuring in ES6

        if (!this.state.web3) {
            console.log("App is not ready");
            return;
        }

        if (accounts[0] === undefined) {
            alert('Please press F5 to connect Dapp');
            return;
        }

        if (this.state.value <= 0 || this.state.checked === 0) {
            this.setState({show: true});
        } else {
            //let BN = web3.utils.BN;
            // await contract.placeBet(this.state.checked, {from: accounts[0], value:web3.utils.toWei(new BN(this.state.value), 'ether')});
            await contract.placeBet(this.state.checked, {from: accounts[0], value:web3.utils.toWei(String(this.state.value), 'ether')});
            
            //reset previous state
            this.setState({show: false, reveal: 0, reward: 0});
        }

    }
    
    async handleClickFlip() {
        const {accounts, contract} = this.state;

        if (!this.state.web3) {
            console.log("App is not ready");
            return;
        }

        if (accounts[0] === undefined) {
            alert('Please press F5 to connect Dapp');
            return;
        }

        let seed = Math.floor((Math.random() * 255) +1);

        await contract.revealResult(seed, {from:accounts[0]});

    }

    handleClickReset() {

    };

    getReceiptList = async () => {

        //TODO 
        const {web3, account, contract} = this.state;
        const lowerLimit = 50;

    };

    watchEvent(error, result) {
        if (!error) {
            const {web3} = this.state;
            this.setState({reveal: web3.utils.toDeciaml(result.args.reveal), txList:[]}, this.getReceiptList);
        } else {
            console.log(error);
        }
    }

    componentDidMount = async () => {
        try {
            const web3 = await getWeb3();

            const accounts = await web3.eth.getAccounts();

            const Contract = truffleContract(CoinToFlip);
            Contract.setProvider(web3.currentProvider);
            const instance = await Contract.deployed();

            await instance.Reveal().watch((error,result) => this.watchEvent(error,result));
            await instance.Payment().watch((error, result) => this.watchPaymentEvent(error,result));

            this.setState({web3, accounts, contract: instance}, this.getHouseBalance);
            
        } catch (error) {
            alert('Failed to laod web3');
            console.log(error);
        }
    };

    render() {

        let coin_h = "/images/coin-h.png";
        let coin_t = "/images/coin-t.png";

        let coin = 
            <div>
                <Image src={coin_h} id="Heads" onClick={this.handleClickCoin} className="img-coin" />
                <Image src={coin_t} id="Tails" onClick={this.handleClickCoin} className="img-coin" />
            </div> 

        return(
            //JSX
            <Grid fluid={true}>
                <Row className="show-grid">
                    <Col md={5}>
                        <Panel bsStyle="info">
                            <Panel.Heading>
                               <Panel.Title>
                                    <Glyphicon glyph="thumbs-up" /> House: 0ETH
                                </Panel.Title> 
                            </Panel.Heading>
                            <Panel.Body className="custom-align-center">
                                <div>
                                    {coin}
                                </div>
                            </Panel.Body>
                        </Panel>
                    </Col>
                    <Col md={5}>
                        <Reveal reveal={this.state.reveal} reward={this.state.reward} />
                    </Col>
                </Row>
                <Row className="show-grid">
                    <Col md={5}>
                        <Panel bsStyle="info">
                            <Panel.Heading>
                                <Panel.Title>
                                    <Glyphicon glyph="ok-circle" /> Your Bet
                                </Panel.Title>
                            </Panel.Heading>
                            <Panel.Body className="custom-align-center">
                                <form>
                                    <InputGroup style={{paddingBottom:'10px'}}>
                                        <Radio name="coinRadioGroup" checked={this.state.checked === 2} inline disabled>
                                            Heads
                                        </Radio>
                                        <Radio name="coinRadioGroup" checked={this.state.checked === 1} inline disabled>
                                            Tails
                                        </Radio>
                                        <FormControl type="number" placeholder="Enter number" bsSize="lg" onChange={this.handleValChange} />
                                    </InputGroup>
                                </form>

                                <ButtonToolbar>
                                    <ButtonGroup justified>
                                        <Button href="#" bsStyle="primary" bsSize="large" onClick={this.handleClickBet}>
                                            Bet
                                        </Button>
                                        <Button href="#" bsStyle="success" bsSize="large" onClick={this.handleClickFlip}>
                                            Flip!
                                        </Button>
                                        <Button href="#" bsSize="large" onClick={this.handleRefund}>
                                            Cancel
                                        </Button>
                                        <Button href="#" bsStyle="info" bsSize="large" onClick={this.handleClickReset}>
                                            Reset
                                        </Button>
                                    </ButtonGroup>
                                </ButtonToolbar>
                            </Panel.Body>
                        </Panel>
                    </Col>
                    <Col md={5}>
                        4
                    </Col>
                </Row>
            </Grid>
        );
    }
}

//functional component
function Reveal(props) {

    let coinImg = '/images/coin-unknown.png';
    if (props.reveal === 2) {
        coinImg = "/images/coin-h.png";
    } else if (props.reveal === 1) {
        coinImg = "/images/coin-t.png";
    }

    let coin = <Image src={coinImg} className="img-coin" />

    return (
        <Panel bsStyle="info">
            <Panel.Heading>
                <Panel.Title>
                    <Glyphicon glyph="adjust"/>CoinReveal
                </Panel.Title>
            </Panel.Heading>
            <Panel.Body className="custom-aligh-center">
                {coin}
                {props.reward} ETH
            </Panel.Body>
        </Panel>
    );
}

export default CoinFlip;