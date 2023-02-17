import React, { lazy, Suspense, useEffect, useState, useCallback } from 'react';
import Index from "./jsx";
import "./vendor/bootstrap-select/dist/css/bootstrap-select.min.css";
import "./css/style.css";

import { 
  setup_SubstrateChain, setPolkadotInjector,
  server_tm_checkOpenJobs, server_tm_checkPendingJobs, server_tm_makeNativePayments, server_tm_makeNativeUsdPayments, server_tm_makeNonNativePayments, tm_calculateLiabilities,

} from './Setup.js';    
import { web3Accounts, web3Enable, web3FromAddress, web3AccountsSubscribe, web3FromSource, web3ListRpcProviders, web3UseRpcProvider } from '@polkadot/extension-dapp';



function App (props) {

  const [blockHeader, setBlockHeader] = useState({ number: undefined});
  const [parachainSpecs,setParachainSpecs]      = useState({ api: undefined, chainID: undefined, blockNumber: undefined });
  const [polkadtoAccountList, setPolkadtoAccountList] = useState([]);
  const [polakdotAccountSigner, setPolakdotAccountSigner] = useState({injector: null, address: null});
  const [walletConnected, setWalletConnected]   = useState(false);


  //#region PolkadotExtenionApp
      const polakdotSignerfunction = useCallback(async (SENDER) => {

        if (!SENDER) return null 
        else {
            const injector = await web3FromAddress(SENDER); // finds an injector for an address
            console.log(`polakdotSigner ===> injector: `,injector);
            // setPolakdotSigner(injector);
            setPolkadotInjector(injector,SENDER);
            setPolakdotAccountSigner({injector: injector, address: SENDER});
            return injector;    
        }
    },[]);

    useEffect( () => {
      const enbalePolakdotExt = async () => { 
          //this call fires up the authorization popup returns an array of all the injected sources (this needs to be called first, before other requests)
          const extensions = await web3Enable('ntt54 Dapp');
          if (extensions.length === 0) {
            console.log("no extension installed, or the user did not accept the authorization");
            // in this case we should inform the user and give a link to the extension
            return;
          }
  
          await web3AccountsSubscribe(( injectedAccounts ) => { 
              let substrateAccounts = []
              injectedAccounts.map(( account ) => substrateAccounts.push(account.address));
              setPolkadtoAccountList(substrateAccounts);
              
              setWalletConnected(true);
          });
  
      };
      enbalePolakdotExt();
  
    }, []);   
    //#endregion


  useEffect(() => {
    const runSetup = async () => {
        console.log("api_rel running setup ");
        const { api: api_Shibuya } = await setup_SubstrateChain("Shibuya");
        console.log("api_Shibuya: ",api_Shibuya);
        setParachainSpecs({ api: api_Shibuya, chainID: undefined, blockNumber: undefined });
    }
    runSetup();

  }, []);   


    //#region  parachain events setup
    useEffect(() => {

      const parachain = async (api) => {
          const chain = await api.rpc.system.chain();
          console.log(`App.js Parachain ${chain} is run at  Timestmap: ${new Date()}`);
          
          let count = 0;
          //Subscribe to the new headers on-chain.   
          const unsubHeads = await api.rpc.chain.subscribeNewHeads(async (lastHeader) => {
              console.log(`${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`);
              setBlockHeader({number: `${lastHeader.number}`, hash: `lastHeader.hash`, size: "header.size"});
  
              //HERE ADD  CHECKS *******
              if (((lastHeader.number)%2) ===0) 
              {
                console.log(` ********** updating ********** ||| SmartPay PROJECT START ||| at Block Number: ${lastHeader.number}`);
                await server_tm_checkOpenJobs();
                await server_tm_checkPendingJobs(); 
                await server_tm_makeNativePayments(); 
                await server_tm_makeNativeUsdPayments(); 
                await server_tm_makeNonNativePayments(); 
                await tm_calculateLiabilities();
                console.log(` ********** updating ********** ||| SmartPay PROJECT END ||| at Block Number: ${lastHeader.number}`);
              }

              // if (++count > 10) {
              //     unsubHeads();
              // }
          });
      }
  
      if (parachainSpecs.api)
      {
        parachain(parachainSpecs.api).catch((er) => { console.log(`APP.JS parachain Error: `,er);  });
      }
      else console.log(`App.js => setupSpecs.provider is undefined`);
  
    }, [parachainSpecs.api]);  
    //#endregion  parachain events setup

	return (
			<>
                <Suspense fallback={
                    <div id="preloader">
                        <div className="sk-three-bounce">
                            <div className="sk-child sk-bounce1"></div>
                            <div className="sk-child sk-bounce2"></div>
                            <div className="sk-child sk-bounce3"></div>
                        </div>
                    </div>  
                   }
                >
                    <Index 
                          astar_api={parachainSpecs.api}
                          blockHeader={blockHeader}   
                          polakdotSignerfunction={polakdotSignerfunction} 
                          polkadtoAccountList={polkadtoAccountList} 
                          walletConnected={walletConnected} 
                    />
                </Suspense>
            </>
    );
	
};


export default App;