import {providers,utils,BigNumber,Contract} from "ethers";
import Head from "next/head";
import React, { useEffect,useRef,useState } from "react";
import Web3Modal from "web3modal";
import {
  KRYPTO_KOIN_NFT_ADDRESS,
  KRYPTO_KOIN_NFT_ABI,
  KRYPTO_KOIN_TOKEN_ADDRESS,
  KRYPTO_KOIN_TOKEN_ABI,
} from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {
  const zero = BigNumber.from(0);
  const [walletConnected,setWalletConnected] = useState(false);
  const [loading,setLoading] = useState(false);
  const [tokensToBeClaimed,setTokensToBeClaimed] = useState(zero);
  const [balanceofKryptoKoinToken,setBalanceofKryptoKoinToken] = useState(zero);
  const [tokenAmount,setTokenAmount] = useState(zero);
  const [tokensMinted,setTokensMinted] = useState(zero);
  const [isOwner,setIsOwner] = useState(false);
  const web3ModalRef = useRef();

  async function getProviderOrSigner(needSigner = false){
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const {chainId} = await web3Provider.getNetwork();

    if(chainId !== 11155111){
      window.alert("Change the network to Goerli");
      throw new Error("Change the netwotk to Goerli");
    }

    if(needSigner){
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  async function connectWallet(){
    try{
      await getProviderOrSigner();
      setWalletConnected(true);
    }catch(err){
      console.error(err);
    }
  }

  async function getTokensToBeClaimed() {
    try{
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(KRYPTO_KOIN_NFT_ADDRESS,KRYPTO_KOIN_NFT_ABI,provider);
      const tokenContract = new Contract(KRYPTO_KOIN_TOKEN_ADDRESS,KRYPTO_KOIN_TOKEN_ABI,provider);
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const balance = await nftContract.balanceOf(address);
      if(balance === 0){
        setTokensToBeClaimed(zero);
      }else{
        var amount = 0;
        for (let i = 0;i<balance;i++){
          const tokenId = await nftContract.tokenOfOwnerByIndex(address,i);
          const claimed = await tokenContract.tokenIdsClaimed(tokenId);
          if(!claimed){
            amount++;
          }
        }
      }
      setTokensToBeClaimed(BigNumber.from(amount));
    }catch(err){
      console.error(err);
      setTokensToBeClaimed(zero);
    }
  }

  async function getBalanceofKryptoKoinToken() {
    try{
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(KRYPTO_KOIN_TOKEN_ADDRESS,KRYPTO_KOIN_TOKEN_ABI,provider);
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const balance = await tokenContract.balanceOf(address);
      setBalanceofKryptoKoinToken(balance);
    }catch(err){
      console.error(err);
      setBalanceofKryptoKoinToken(zero);
    }
  }

  async function mintKryptoKoinToken(amount){
    try{
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(KRYPTO_KOIN_TOKEN_ADDRESS,KRYPTO_KOIN_TOKEN_ABI,signer);
      const value = 0.001 * amount;
      const tx = await tokenContract.mints(amount,{value: utils.parseEther(value.toString())});
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Successfully minted Krypto Koins");
      await getBalanceofKryptoKoinToken();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    }catch(err){
    console.error(err);
    }
  }

  async function claimKryptoKoinToken(){
    try{
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(KRYPTO_KOIN_TOKEN_ADDRESS,KRYPTO_KOIN_TOKEN_ABI,signer);
      const tx = await tokenContract.claim();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Successfully claimed Krypto Koins");
      await getBalanceofKryptoKoinToken();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    }catch(err){
    console.error(err);
    }
  }

  async function getTotalTokensMinted() {
    try{
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(KRYPTO_KOIN_TOKEN_ADDRESS,KRYPTO_KOIN_TOKEN_ABI,provider);
      const _tokensMinted = await tokenContract.totalSupply();
      setTokensMinted(_tokensMinted);
    }catch(err){
      console.error(err);
    }
  }

  async function getOwner(){
    try{
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(KRYPTO_KOIN_TOKEN_ADDRESS,KRYPTO_KOIN_TOKEN_ABI,provider);
      const _owner = await tokenContract.owner();
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      if(address.toLowerCase() === _owner.toLowerCase()){
        setIsOwner(true);
      }
    }catch(err){
      console.error(err);
    }
  }

  async function withdrawCoins(){
    try{
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(KRYPTO_KOIN_TOKEN_ADDRESS,KRYPTO_KOIN_TOKEN_ABI,signer);
      const txn = await tokenContract.withdraw();
      setLoading(true);
      await txn.wait();
      setLoading(false);
      await getOwner();
    }catch(err){
      console.error(err);
      window.alert(err.reason);
    }
  }

  useEffect(()=>{
    if(!walletConnected){
      web3ModalRef.current = new Web3Modal({
        network: "sepolia",
        providerOptions:{},
        disableInjectedProvider: false,
      });
      connectWallet();
      getTotalTokensMinted();
      getTokensToBeClaimed();
      getBalanceofKryptoKoinToken();
      getOwner();
    }
  },[walletConnected]);

  function renderButton() {
    if(loading){
      return (
        <div><button className={styles.button}>Loading...</button></div>
      )
    }

    if(tokensToBeClaimed > 0){
      return(
        <div>
          <div className={styles.description}> {tokensToBeClaimed * 10} Tokens to be claimed!</div>
          <button className={styles.button} onClick={() => claimKryptoKoinToken()}>Claim Tokens</button>
        </div>
      );
    }
    return(
      <div style={{display:"flex-col"}}>
        <div>
          <input className={styles.input} type="number" placeholder="Amount of tokens" onChange={(e) => {setTokenAmount(BigNumber.from(e.target.value))}}></input>
        </div>
        <button className={styles.button} disabled ={!(tokenAmount>0)} onClick={()=>mintKryptoKoinToken(tokenAmount)}>Mint Tokens</button>
      </div>
    )
  };

  return(
    <div>
        <Head>
          <title>Krypto Koins</title>
          <meta name="description" content="ICO-Dapp" />
          <link rel="icon" href="/favicon.ico" />
      </Head>
      <div  className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Krypto Koins ICO!</h1>
            <div className={styles.description}>
              You can claim or mint Krypto Koins tokens here
            </div>
            {walletConnected? (
              <div>
                <div className={styles.description}>
                  You have minted {utils.formatEther(balanceofKryptoKoinToken)} Krypto Koins Tokens
                </div>
                <div className={styles.description}>
                  Overall {utils.formatEther(tokensMinted)}/10000 have been minted!!!
                </div>
                {renderButton()}
                {isOwner?(
                  <div>
                    {loading?<button className={styles.button}>Loading...</button>
                    : <button className={styles.button} onClick={()=>withdrawCoins()}>Withdraw Coins</button>}
                  </div>
                ):("")}
              </div>
            ):(
              <button className={styles.button} onClick={()=>connectWallet()}>Connect your wallet</button>
            )}
        </div>
        <div>
          <img className={styles.image} src="./0.svg" />
        </div>
      </div>
      <footer className={styles.footer}>
        Made with &#10084; by Krypto Koins
      </footer>
    </div>
  )

}