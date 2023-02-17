import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { options } from '@astar-network/astar-api';
import { DispatchError, WeightV2 } from '@polkadot/types/interfaces'
import { numberToHex, u8aToString, stringToU8a, u8aToHex, hexToString, hexToU8a, BN, hexToBn, hexToNumber, } from '@polkadot/util'; // Some helper functions used here
import { ContractPromise, Abi } from '@polkadot/api-contract';

import oracle_dex_metadata from './Abis/oracle_dex_metadata';  
import pallet_metadata from './Abis/pallet_metadata';  
import treasury_manager_metadata from './Abis/treasury_manager_metadata';  

const oracle_dex_address = "YSefjGpCV1sC9K6LGwGPiZPNyxKDTBCxRkVd7WSkEC643yD";
const DOT = "YovEh7RQkxjK6y2FKpKK8urtTofEPMdYvzQXNCFczeAqwmJ";
const USDT = "XiL4V7XGc6PhTMxCNtPfkx7kjD8zuR36R1MfA3pYbm7QYZD"

//OLD
// const pallet_address = "Xes8N2Q4JYmxtxe4W6vfpYzSj4skXdwcHa2FgKjA4Z3bDHL";
// const treasury_manager_address = "Zhs3hsuzPQV7U4rXWsH6BtxC5ag4GnJKuAoJhzTpsWufYAY";

const pallet_address = "Z5BbE8EA2vTPCzBCWKb9hnjbPMXTsrD3wDHh3HTMgiCiKTt";
const treasury_manager_address = "YxsHyDbUvxHBqCMKpqu6xJ7A5Y8Wu5c8wywhyngXfh3f88N";


const mantissa18 = new BN("1000000000000000000");
const mantissa15 = new BN("1000000000000000");

let astar_api;
let contract_boiler_plate, contract_oracle_dex, contract_pallet, contract_treasury_manager;
let polkadot_test_account;



let polkadotInjector = null, polkadotInjectorAddress=null;
const setPolkadotInjector = (injector, injectorAddress) => { 
    polkadotInjector = injector;
    polkadotInjectorAddress = injectorAddress;
    console.log(`Setup New Polkadot Signer/Injector polkadotInjectorAddress: ${polkadotInjectorAddress} polkadotInjector: `,polkadotInjector);

	// Setup New Polkadot Signer/Injector polkadotInjectorAddress: 5DAqjjBN3CJteqrmps95HUmo325xDBuErC8BoNd88ud6Cxgo polkadotInjector: ...
}


//#region ***** Setup Substrate Chain //*****
const setup_SubstrateChain = async (wsURL = 'Shibuya') => {
  console.log("setup_SubstrateChain is RUN");

  let WS_URL;
  //mainnet
  // if (wsURL === 'Shibuya') WS_URL = 'wss://rpc.shibuya.astar.network'; 
  if (wsURL === 'Shibuya') WS_URL = 'wss://shibuya-rpc.dwellir.com'; 
   
  const wsProvider = new WsProvider(WS_URL);

  // Wait for Provider
  // const api = await ApiPromise.create({ provider: wsProvider });
  const api = new ApiPromise(options({ provider: wsProvider }));

  await api.isReady;
  console.log(`api => : `,api);
  console.log(" ********** API PROPERTIES ********** ");
  console.log((await api.rpc.system.properties()).toHuman());
  console.log(" ********** API PROPERTIES ********** ");

  
  getAccountIdtoHex();   //USED FOR TESTING AND TO BE REPLACED BY POLKADOT EXTENSION

  contract_oracle_dex = new ContractPromise(api, oracle_dex_metadata, oracle_dex_address);
  contract_pallet = new ContractPromise(api, pallet_metadata, pallet_address);
  contract_treasury_manager = new ContractPromise(api, treasury_manager_metadata, treasury_manager_address);

  astar_api = api;
    
    // //MOCK JOB OneOffFutureTime Paid in DOT valueInUsd=false
  	// const title = "Tranlsation1";
	// const applicant_Usagi = "XtEUQTYNxZMxU3gMnTskEX3JFSVEDpE7hwSTBW74AowhUGV";
	// const requestedToken = DOT;
	// const valueInUsd = false;
	// const requestedValue = 1;
	// const paymentType = 0;   //0: OneOffFutureTime 1: Installments
	// const paymentSchedule_timestamp_array = ["1676501334995"];
	// const payeeAccounts_array = ["XtEUQTYNxZMxU3gMnTskEX3JFSVEDpE7hwSTBW74AowhUGV"];
	//USAGI HAD "\"999,888,775,665,677,443,667,000,778,000,223\"" DOT

  return {api};
};
//#endregion 


// FOR TESTING
//#region getAccountIdtoHex SET UP polkadot_test_account
const getAccountIdtoHex = (accountI32="") => {
  const keyring = new Keyring({ type: 'sr25519' });
//  const PHRASE = 'casual subject usage friend elder novel brick prosper order protect senior hunt';    //Alecia

	//   ## ADMIN ARISU_ASTAR
	//   X3SB29SpRwzsftcKAbCK8w584o5BQbysPdL35pz1Gd3o4RS
	//   SEED PHRASE
	//   organ cup sport decline curious quit pause sail motor okay force advance
//   const PHRASE = 'organ cup sport decline curious quit pause sail motor okay force advance';    //Arisu

  const Arisu2_PHRASE = 'bachelor axis digital trend canyon diesel pencil giraffe noise maze rose become';    //Arisu2 IS ADMIN
  //ADDRESS   5HMwBS1bxriTYnGo6m8AFEKTaoDmTKJeMvoMpQXENJsv1RBg

  const PHRASE = 'mean decade kidney strategy surround tilt friend quote kangaroo spice board silver'; //USAGI2 for server
  //ADDRESS   5EZwpfeoyhWbEhmfuSAv8ekL8BWfAc94pvRYJUFK6ASnbg4w

  const Alecia = keyring.addFromUri(PHRASE);
  polkadot_test_account = Alecia;
  console.log(`polkadot_test_account ADDRESS: ${polkadot_test_account.address}`); //5FP8MMBmPdBCMgG5AspTHVNWXXSEoR4vgJwSrehUj1qJAKxN

}
//#endregion



//READ

//#region pallet_get_treasury_manager_address
const pallet_get_treasury_manager_address = async () => {

    if (astar_api) 
    {
	  const contract = contract_pallet;
	  	
      const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
      const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
      const { gasRequired, storageDeposit, result, output } = await contract.query.getTreasuryManagerAddress(
        polkadot_test_account.address, //"5FP8MMBmPdBCMgG5AspTHVNWXXSEoR4vgJwSrehUj1qJAKxN", //polkadot_test_account.address,
        {
          gasLimit: astar_api.registry.createType('WeightV2', {
            refTime: maxGas,
            proofSize: maxGas,
          }),
          storageDepositLimit: null,
        }
      );

      // The actual result from RPC as `ContractExecResult`
      console.log("===> result.toHuman() : ",result.toHuman());
      // Ok: data: "0x00"

      // the gas consumed for contract execution
      console.log("===> gasRequired.toHuman() : ",gasRequired.toHuman()); 
      // {refTime: '6,219,235,328', proofSize: '131,072'}

      // check if the call was successful
      if (result.isOk) {
        // output the return value
        console.log('Success', output.toHuman());  //Success false
		return  output.toHuman()
      } else {
        console.error('Error', result.asErr);
		return result.asErr
      }

    }
    else { console.log(`ASTAR API IS NOT SET UP YET`); return null }
  }
//#endregion



const pallet_get_address = () => {
	return pallet_address;
}

//#region pallet_get_admin
// const pallet_get_admin = async (contract) => {
const pallet_get_admin = async () => {

    if (astar_api) 
    {
	  const contract = contract_pallet;
      const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
      const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
      const { gasRequired, storageDeposit, result, output } = await contract.query.getAdmin(
        polkadot_test_account.address, //"5FP8MMBmPdBCMgG5AspTHVNWXXSEoR4vgJwSrehUj1qJAKxN", //polkadot_test_account.address,
        {
          gasLimit: astar_api.registry.createType('WeightV2', {
            refTime: maxGas,
            proofSize: maxGas,
          }),
          storageDepositLimit: null,
        }
      );

      // The actual result from RPC as `ContractExecResult`
      console.log("===> result.toHuman() : ",result.toHuman());
      // Ok: data: "0x00"

      // the gas consumed for contract execution
      console.log("===> gasRequired.toHuman() : ",gasRequired.toHuman()); 
      // {refTime: '6,219,235,328', proofSize: '131,072'}

      // check if the call was successful
      if (result.isOk) {
        // output the return value
        console.log('Success', output.toHuman());  //Success false
		return  output.toHuman()
      } else {
        console.error('Error', result.asErr);
		return result.asErr
      }

    }
    else { console.log(`ASTAR API IS NOT SET UP YET`); return null }
  }
//#endregion




//WRITE

//#region pallet_addNewVotedJob
const pallet_addNewVotedJob = async (
	// contract, 
	title, proposalHash, applicant, _requestedToken, valueInUsd, _requestedValue, paymentType, 
	paymentSchedule_timestamp_array, payeeAccounts_array
	) => {
    
	console.log(`Setup: title:${title} proposalHash:${proposalHash} applicant:${applicant} requestedToken:${_requestedToken} valueInUsd:${valueInUsd} requestedValue:${_requestedValue} paymentType:${paymentType}`);
	console.log(`paymentSchedule_timestamp_array: `,paymentSchedule_timestamp_array);
	console.log(`payeeAccounts_array: `,payeeAccounts_array);
	
	if (astar_api) 
	// if (1>2) 
	{
	  const contract = contract_pallet;

	  //   const requestedValue = _requestedValue;
	  const requestedValue =  new BN( `${Number(_requestedValue) * mantissa18}` );
	  console.log(`requestedValue" ${requestedValue}`);

 	  let requestedToken;
	  if (_requestedToken==="DOT") requestedToken=DOT
	  else if (_requestedToken==="USDT") requestedToken=USDT;


	  // D R Y  R U N (We perform the send from an account, here using polkadot_test_account address)
	  const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
	  const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
  
	  const { gasRequired, storageDeposit, result } = await contract.query.addNewVotedJob (
		// polkadot_test_account.address, 
		polkadotInjectorAddress,

		{
		  gasLimit: astar_api.registry.createType('WeightV2', {
			refTime: maxGas,
			proofSize: maxGas,
		  }),
		  storageDepositLimit: null,
		},
		title, proposalHash, applicant, requestedToken, valueInUsd, requestedValue, paymentType, 
		paymentSchedule_timestamp_array, payeeAccounts_array
	  );

	  console.log(`outcome: ${result.isOk ? 'Ok' : 'Error'}`); // outcome: Ok
	  console.log(`gasRequired ${gasRequired.toString()}`);    // gasRequired {"refTime":6219235328,"proofSize":131072}
  
	  const gasLimit = astar_api.registry.createType('WeightV2', gasRequired); //as WeightV2
  
	  // Send the transaction, like elsewhere this is a normal extrinsic with the same rules as applied in the API (As with the read example,
	  // additional params, if required can follow - here only one is needed)
	  await contract.tx
	  .addNewVotedJob (
		{ 
		  gasLimit,
		  storageDepositLimit: null, 
		}, 
		title, proposalHash, applicant, requestedToken, valueInUsd, requestedValue, paymentType, 
		paymentSchedule_timestamp_array, payeeAccounts_array
	  )
	//   .signAndSend( polkadot_test_account, { nonce: -1 }, result => {
      .signAndSend(polkadotInjectorAddress, { signer: polkadotInjector.signer }, result => {

		if (result.status.isInBlock) {
		  console.log(' =====>>> in a block');
		} else if (result.status.isFinalized) {
		  console.log(' =====>>> finalized');
		  console.log('result: ',JSON.stringify(result,null,"\t"));
  
		}
	  });
  
	}
	else console.log(`ASTAR API IS NOT SET UP YET`);
  
}
//#endregion


//#region pallet_removeJob
const pallet_removeJob = async (id) => {
  
	if (astar_api) 
	{
	  const contract = contract_pallet;

	  // D R Y  R U N (We perform the send from an account, here using polkadot_test_account address)
	  const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
	  const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
  
	  const { gasRequired, storageDeposit, result } = await contract.query.removeJob (
		polkadot_test_account.address, 
		{
		  gasLimit: astar_api.registry.createType('WeightV2', {
			refTime: maxGas,
			proofSize: maxGas,
		  }),
		  storageDepositLimit: null,
		},
		id
	  );

	  console.log(`outcome: ${result.isOk ? 'Ok' : 'Error'}`); // outcome: Ok
	  console.log(`gasRequired ${gasRequired.toString()}`);    // gasRequired {"refTime":6219235328,"proofSize":131072}
  
	  const gasLimit = astar_api.registry.createType('WeightV2', gasRequired); //as WeightV2
  
	  // Send the transaction, like elsewhere this is a normal extrinsic with the same rules as applied in the API (As with the read example,
	  // additional params, if required can follow - here only one is needed)
	  await contract.tx
	  .removeJob (
		{ 
		  gasLimit,
		  storageDepositLimit: null, 
		}, 
		id
	  )
	  .signAndSend( polkadot_test_account, { nonce: -1 }, result => {
		if (result.status.isInBlock) {
		  console.log(' =====>>> in a block');
		} else if (result.status.isFinalized) {
		  console.log(' =====>>> finalized');
		  console.log('result: ',JSON.stringify(result,null,"\t"));
  
		}
	  });
  
	}
	else console.log(`ASTAR API IS NOT SET UP YET`);
  
}
//#endregion



//#region pallet_retrieveTreasuryManagerAddress
const pallet_retrieveTreasuryManagerAddress = async () => {
  
	if (astar_api) 
	{
	  const contract = contract_pallet;

	  // D R Y  R U N (We perform the send from an account, here using polkadot_test_account address)
	  const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
	  const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
  
	  const { gasRequired, storageDeposit, result } = await contract.query.retrieveTreasuryManagerAddress (
		polkadot_test_account.address, 
		{
		  gasLimit: astar_api.registry.createType('WeightV2', {
			refTime: maxGas,
			proofSize: maxGas,
		  }),
		  storageDepositLimit: null,
		},
	  );

	  console.log(`outcome: ${result.isOk ? 'Ok' : 'Error'}`); // outcome: Ok
	  console.log(`gasRequired ${gasRequired.toString()}`);    // gasRequired {"refTime":6219235328,"proofSize":131072}
  
	  const gasLimit = astar_api.registry.createType('WeightV2', gasRequired); //as WeightV2
  
	  // Send the transaction, like elsewhere this is a normal extrinsic with the same rules as applied in the API (As with the read example,
	  // additional params, if required can follow - here only one is needed)
	  await contract.tx
	  .retrieveTreasuryManagerAddress (
		{ 
		  gasLimit,
		  storageDepositLimit: null, 
		}, 
	  )
	  .signAndSend( polkadot_test_account, result => {
		if (result.status.isInBlock) {
		  console.log(' =====>>> in a block');
		} else if (result.status.isFinalized) {
		  console.log(' =====>>> finalized');
		  console.log('result: ',JSON.stringify(result,null,"\t"));
  
		}
	  });
  
	}
	else console.log(`ASTAR API IS NOT SET UP YET`);
  
}
//#endregion


//#region pallet_launchTreasuryManager
const pallet_launchTreasuryManager = async () => {
  
	if (astar_api) 
	{
	  const contract = contract_pallet;

	  const contractManager = polkadot_test_account.address;
	  const treasuryTokenSymbol = "DOT";
	  const treasuryTokenAddress = DOT;
	  const usdtTokenAddress = USDT;
	  const oracleDexAddress = oracle_dex_address;
	  const liabilitiesThresholdLevel = 10;   //for 10% so alerts are set at Liabilities beign at 90% of Funds and 80% of funds and top up to 130% of Liabilities

	  // D R Y  R U N (We perform the send from an account, here using polkadot_test_account address)
	  const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
	  const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
  
	  const { gasRequired, storageDeposit, result } = await contract.query.launchTreasuryManager (
		// polkadot_test_account.address, 
		polkadotInjectorAddress,

		{
		  gasLimit: astar_api.registry.createType('WeightV2', {
			refTime: maxGas,
			proofSize: maxGas,
		  }),
		  storageDepositLimit: null,
		},
		contractManager, treasuryTokenSymbol, treasuryTokenAddress, usdtTokenAddress, oracleDexAddress, liabilitiesThresholdLevel
	  );

	  console.log(`outcome: ${result.isOk ? 'Ok' : 'Error'}`); // outcome: Ok
	  console.log(`gasRequired ${gasRequired.toString()}`);    // gasRequired {"refTime":6219235328,"proofSize":131072}
  
	  const gasLimit = astar_api.registry.createType('WeightV2', gasRequired); //as WeightV2
  
	  // Send the transaction, like elsewhere this is a normal extrinsic with the same rules as applied in the API (As with the read example,
	  // additional params, if required can follow - here only one is needed)
	  await contract.tx
	  .launchTreasuryManager (
		{ 
		  gasLimit,
		  storageDepositLimit: null, 
		}, 
		contractManager, treasuryTokenSymbol, treasuryTokenAddress, usdtTokenAddress, oracleDexAddress, liabilitiesThresholdLevel
	  )
	//   .signAndSend( polkadot_test_account, { nonce: -1 }, result => {
      .signAndSend(polkadotInjectorAddress, { signer: polkadotInjector.signer }, result => {

		if (result.status.isInBlock) {
		  console.log(' =====>>> in a block');
		} else if (result.status.isFinalized) {
		  console.log(' =====>>> finalized');
		  console.log('result: ',JSON.stringify(result,null,"\t"));

		  const update_contract_treasury_manager = async () => {
			  await pallet_retrieveTreasuryManagerAddress();
			  const new_treasury_manager_address = await pallet_get_treasury_manager_address();
			  console.log(`pallet_launchTreasuryManager:|> new_treasury_manager_address: ${new_treasury_manager_address}`);
			  contract_treasury_manager = new ContractPromise(astar_api, treasury_manager_metadata, new_treasury_manager_address);
		  }
		  update_contract_treasury_manager()
  
		}
	  });
  
	}
	else console.log(`ASTAR API IS NOT SET UP YET`);
  
}
//#endregion


//#region pallet_depositFundsToTreasuryManager
const pallet_depositFundsToTreasuryManager = async (_amount) => {
  
	if (astar_api) 
	{
	  const contract = contract_pallet;

	  const amount =  new BN( `${Number(_amount) * mantissa18}` );
	  console.log(`pallet_depositFundsToTreasuryManager:|> amount" ${amount}`);

	  // D R Y  R U N (We perform the send from an account, here using polkadot_test_account address)
	  const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
	  const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
  
	  const { gasRequired, storageDeposit, result } = await contract.query.depositFundsToTreasuryManager (
		// polkadot_test_account.address, 
		polkadotInjectorAddress,
		{
		  gasLimit: astar_api.registry.createType('WeightV2', {
			refTime: maxGas,
			proofSize: maxGas,
		  }),
		  storageDepositLimit: null,
		},
		amount
	  );

	  console.log(`outcome: ${result.isOk ? 'Ok' : 'Error'}`); // outcome: Ok
	  console.log(`gasRequired ${gasRequired.toString()}`);    // gasRequired {"refTime":6219235328,"proofSize":131072}
  
	  const gasLimit = astar_api.registry.createType('WeightV2', gasRequired); //as WeightV2
  
	  // Send the transaction, like elsewhere this is a normal extrinsic with the same rules as applied in the API (As with the read example,
	  // additional params, if required can follow - here only one is needed)
	  await contract.tx
	  .depositFundsToTreasuryManager (
		{ 
		  gasLimit,
		  storageDepositLimit: null, 
		}, 
		amount
	  )
	//   .signAndSend( polkadot_test_account, { nonce: -1 }, result => {
      .signAndSend(polkadotInjectorAddress, { signer: polkadotInjector.signer }, result => {

		if (result.status.isInBlock) {
		  console.log(' =====>>> in a block');
		} else if (result.status.isFinalized) {
		  console.log(' =====>>> finalized');
		  console.log('result: ',JSON.stringify(result,null,"\t"));
  
		}
	  });
  
	}
	else console.log(`ASTAR API IS NOT SET UP YET`);
  
}
//#endregion


//#region pallet_withdrawFundsFromTreasuryManager
const pallet_withdrawFundsFromTreasuryManager = async (_amount) => {
  
	if (astar_api) 
	{
	  const contract = contract_pallet;

	  const amount =  new BN( `${Number(_amount) * mantissa18}` );
	  console.log(`pallet_depositFundsToTreasuryManager:|> amount" ${amount}`);

	  // D R Y  R U N (We perform the send from an account, here using polkadot_test_account address)
	  const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
	  const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
  
	  const { gasRequired, storageDeposit, result } = await contract.query.withdrawFundsFromTreasuryManager (
		// polkadot_test_account.address, 
		polkadotInjectorAddress,

		{
		  gasLimit: astar_api.registry.createType('WeightV2', {
			refTime: maxGas,
			proofSize: maxGas,
		  }),
		  storageDepositLimit: null,
		},
		amount
	  );

	  console.log(`outcome: ${result.isOk ? 'Ok' : 'Error'}`); // outcome: Ok
	  console.log(`gasRequired ${gasRequired.toString()}`);    // gasRequired {"refTime":6219235328,"proofSize":131072}
  
	  const gasLimit = astar_api.registry.createType('WeightV2', gasRequired); //as WeightV2
  
	  // Send the transaction, like elsewhere this is a normal extrinsic with the same rules as applied in the API (As with the read example,
	  // additional params, if required can follow - here only one is needed)
	  await contract.tx
	  .withdrawFundsFromTreasuryManager (
		{ 
		  gasLimit,
		  storageDepositLimit: null, 
		}, 
		amount
	  )
	//   .signAndSend( polkadot_test_account, { nonce: -1 }, result => {
      .signAndSend(polkadotInjectorAddress, { signer: polkadotInjector.signer }, result => {

		if (result.status.isInBlock) {
		  console.log(' =====>>> in a block');
		} else if (result.status.isFinalized) {
		  console.log(' =====>>> finalized');
		  console.log('result: ',JSON.stringify(result,null,"\t"));
  
		}
	  });
  
	}
	else console.log(`ASTAR API IS NOT SET UP YET`);
  
}
//#endregion


//#region pallet_setAdminHereAndManagerForTm
const pallet_setAdminHereAndManagerForTm = async (account) => {
  
	if (astar_api) 
	{
	  const contract = contract_pallet;

	  // D R Y  R U N (We perform the send from an account, here using polkadot_test_account address)
	  const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
	  const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
  
	  const { gasRequired, storageDeposit, result } = await contract.query.setAdminHereAndManagerForTm (
		// polkadot_test_account.address, 
		polkadotInjectorAddress,

		{
		  gasLimit: astar_api.registry.createType('WeightV2', {
			refTime: maxGas,
			proofSize: maxGas,
		  }),
		  storageDepositLimit: null,
		},
		account
	  );

	  console.log(`outcome: ${result.isOk ? 'Ok' : 'Error'}`); // outcome: Ok
	  console.log(`gasRequired ${gasRequired.toString()}`);    // gasRequired {"refTime":6219235328,"proofSize":131072}
  
	  const gasLimit = astar_api.registry.createType('WeightV2', gasRequired); //as WeightV2
  
	  // Send the transaction, like elsewhere this is a normal extrinsic with the same rules as applied in the API (As with the read example,
	  // additional params, if required can follow - here only one is needed)
	  await contract.tx
	  .setAdminHereAndManagerForTm (
		{ 
		  gasLimit,
		  storageDepositLimit: null, 
		}, 
		account
	  )
	//   .signAndSend( polkadot_test_account, { nonce: -1 }, result => {
      .signAndSend(polkadotInjectorAddress, { signer: polkadotInjector.signer }, result => {

		
		if (result.status.isInBlock) {
		  console.log(' =====>>> in a block');
		} else if (result.status.isFinalized) {
		  console.log(' =====>>> finalized');
		  console.log('result: ',JSON.stringify(result,null,"\t"));
  
		}
	  });
  
	}
	else console.log(`ASTAR API IS NOT SET UP YET`);
}
//#endregion




// READ TREASURY MANAGER

//#region tm_getAdminAccount
const tm_getAdminAccount = async (contract) => {

    if (astar_api) 
    {
      const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
      const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
      const { gasRequired, storageDeposit, result, output } = await contract.query.getAdminAccount(
        polkadot_test_account.address, 
        {
          gasLimit: astar_api.registry.createType('WeightV2', {
            refTime: maxGas,
            proofSize: maxGas,
          }),
          storageDepositLimit: null,
        }
      );

      // The actual result from RPC as `ContractExecResult`
      console.log("===> result.toHuman() : ",result.toHuman());
      // Ok: data: "0x00"

      // the gas consumed for contract execution
      console.log("===> gasRequired.toHuman() : ",gasRequired.toHuman()); 
      // {refTime: '6,219,235,328', proofSize: '131,072'}

      // check if the call was successful
      if (result.isOk) {
        // output the return value
        console.log('Success', output.toHuman());  //Success false
		return  output.toHuman()
      } else {
        console.error('Error', result.asErr);
		return result.asErr
      }

    }
    else { console.log(`ASTAR API IS NOT SET UP YET`); return null }
  }
//#endregion

//#region tm_getManagerAccount
const tm_getManagerAccount = async (contract) => {

    if (astar_api) 
    {
      const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
      const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
      const { gasRequired, storageDeposit, result, output } = await contract.query.getManagerAccount(
        polkadot_test_account.address, 
        {
          gasLimit: astar_api.registry.createType('WeightV2', {
            refTime: maxGas,
            proofSize: maxGas,
          }),
          storageDepositLimit: null,
        }
      );

      // The actual result from RPC as `ContractExecResult`
      console.log("===> result.toHuman() : ",result.toHuman());
      // Ok: data: "0x00"

      // the gas consumed for contract execution
      console.log("===> gasRequired.toHuman() : ",gasRequired.toHuman()); 
      // {refTime: '6,219,235,328', proofSize: '131,072'}

      // check if the call was successful
      if (result.isOk) {
        // output the return value
        console.log('Success', output.toHuman());  //Success false
		return  output.toHuman()
      } else {
        console.error('Error', result.asErr);
		return result.asErr
      }

    }
    else { console.log(`ASTAR API IS NOT SET UP YET`); return null }
  }
//#endregion

//#region tm_getJobInfo
const tm_getJobInfo = async (id) => {

    if (astar_api) 
    {
	  const contract = contract_treasury_manager;

      const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
      const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
      const { gasRequired, storageDeposit, result, output } = await contract.query.getJobInfo(
        polkadot_test_account.address, 
        {
          gasLimit: astar_api.registry.createType('WeightV2', {
            refTime: maxGas,
            proofSize: maxGas,
          }),
          storageDepositLimit: null,
        },
		id
      );

      // The actual result from RPC as `ContractExecResult`
    //   console.log("===> result.toHuman() : ",result.toHuman());
      // Ok: data: "0x00"

      // the gas consumed for contract execution
    //   console.log("===> gasRequired.toHuman() : ",gasRequired.toHuman()); 
      // {refTime: '6,219,235,328', proofSize: '131,072'}

      // check if the call was successful
      if (result.isOk) {
        // output the return value
        // console.log('Success', output.toString());  //Success false
		// {id: '0', title: 'Tranlsation1', applicant: 'XtEUQTYNxZMxU3gMnTskEX3JFSVEDpE7hwSTBW74AowhUGV'
		// , requestedToken: 'YovEh7RQkxjK6y2FKpKK8urtTofEPMdYvzQXNCFczeAqwmJ', valueInUsd: false
		// ,nextInstallmentPointer: "0", payeeAccounts:  ['XtEUQTYNxZMxU3gMnTskEX3JFSVEDpE7hwSTBW74AowhUGV']
		// ,paymentSchedule: ['1,676,501,334,995'] , paymentType: "OneOffFutureTime", positionInVec:  "0"
		// ,requestedValue: "1"}

		// const result_human =  output.toHuman();
		const result =  JSON.parse(output.toString());
		// console.log(" &&&&&&&&&&&&&&&&& ");
		// console.log("JOBS INFO : ",result_human)
		// console.log("JOBS INFO : ",result)
            
		const num_of_payments = result.paymentSchedule.length;
		const first_payment_timestamp = new Date(result.paymentSchedule[0]).toISOString();
		const _progress = (Number(result.positionInVec) + 1) / num_of_payments ;  //this is percentage    
         
		let job_info = {
			id: result.id,
			title: hexToString(result.title), 
			paymentType: result.paymentType,
			first_payment_date: first_payment_timestamp,
			paymentToken: result.requestedToken===DOT? "DOT" : "USDT",
			denomnatedinUSD: result.valueInUsd,
			amount:  Number((hexToBn(result.requestedValue).div(mantissa15)).toString())/1000, 
			progress: _progress*100,    //0 for open jobs
			payee: result.payeeAccounts[0],
		}
		// console.log(" &&&&&&&&&&&&&&&&&&&&&&&&&& job_info: ",job_info);
		// Number( ( (new BN(result_human.requestedValue)).div(mantissa15) ).toString() )/1000,


		return job_info
		// return  output.toHuman()
      } else {
        console.error('Error', result.asErr);
		return result.asErr
      }

    }
    else { console.log(`ASTAR API IS NOT SET UP YET`); return null }
  }
//#endregion

//#region tm_getTreasuryTokenSymbol
const tm_getTreasuryTokenSymbol = async (contract) => {

    if (astar_api) 
    {
      const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
      const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
      const { gasRequired, storageDeposit, result, output } = await contract.query.getTreasuryTokenSymbol(
        polkadot_test_account.address, 
        {
          gasLimit: astar_api.registry.createType('WeightV2', {
            refTime: maxGas,
            proofSize: maxGas,
          }),
          storageDepositLimit: null,
        },
      );

      // The actual result from RPC as `ContractExecResult`
      console.log("===> result.toHuman() : ",result.toHuman());
      // Ok: data: "0x00"

      // the gas consumed for contract execution
      console.log("===> gasRequired.toHuman() : ",gasRequired.toHuman()); 
      // {refTime: '6,219,235,328', proofSize: '131,072'}

      // check if the call was successful
      if (result.isOk) {
        // output the return value
        console.log('Success', output.toHuman());  //Success false
		return  output.toHuman()
      } else {
        console.error('Error', result.asErr);
		return result.asErr
      }

    }
    else { console.log(`ASTAR API IS NOT SET UP YET`); return null }
  }
//#endregion

//#region tm_getTreasuryToken
const tm_getTreasuryToken = async (contract) => {

    if (astar_api) 
    {
      const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
      const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
      const { gasRequired, storageDeposit, result, output } = await contract.query.getTreasuryToken(
        polkadot_test_account.address, 
        {
          gasLimit: astar_api.registry.createType('WeightV2', {
            refTime: maxGas,
            proofSize: maxGas,
          }),
          storageDepositLimit: null,
        },
      );

      // The actual result from RPC as `ContractExecResult`
      console.log("===> result.toHuman() : ",result.toHuman());
      // Ok: data: "0x00"

      // the gas consumed for contract execution
      console.log("===> gasRequired.toHuman() : ",gasRequired.toHuman()); 
      // {refTime: '6,219,235,328', proofSize: '131,072'}

      // check if the call was successful
      if (result.isOk) {
        // output the return value
        console.log('Success', output.toHuman());  //Success false
		return  output.toHuman()
      } else {
        console.error('Error', result.asErr);
		return result.asErr
      }

    }
    else { console.log(`ASTAR API IS NOT SET UP YET`); return null }
  }
//#endregion

//#region tm_getOpenJobIds
const tm_getOpenJobIds = async () => {

    if (astar_api) 
    {
	  const contract = contract_treasury_manager;

      const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
      const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
      const { gasRequired, storageDeposit, result, output } = await contract.query.getOpenJobsIds(
        polkadot_test_account.address, 
        {
          gasLimit: astar_api.registry.createType('WeightV2', {
            refTime: maxGas,
            proofSize: maxGas,
          }),
          storageDepositLimit: null,
        },
      );

      // The actual result from RPC as `ContractExecResult`
    //   console.log("===> result.toHuman() : ",result.toHuman());
      // Ok: data: "0x00"

      // the gas consumed for contract execution
    //   console.log("===> gasRequired.toHuman() : ",gasRequired.toHuman()); 
      // {refTime: '6,219,235,328', proofSize: '131,072'}

      // check if the call was successful
      if (result.isOk) {
        // output the return value
        console.log('Success', output.toHuman());  //Success false
		return  output.toHuman()
      } else {
        console.error('Error', result.asErr);
		return result.asErr
      }

    }
    else { console.log(`ASTAR API IS NOT SET UP YET`); return null }
  }
//#endregion

//#region tm_getPendingJobsIds
const tm_getPendingJobsIds = async () => {

    if (astar_api) 
    {
	  const contract = contract_treasury_manager;

      const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
      const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
      const { gasRequired, storageDeposit, result, output } = await contract.query.getPendingJobsIds(
        polkadot_test_account.address, 
        {
          gasLimit: astar_api.registry.createType('WeightV2', {
            refTime: maxGas,
            proofSize: maxGas,
          }),
          storageDepositLimit: null,
        },
      );

      // The actual result from RPC as `ContractExecResult`
    //   console.log("===> result.toHuman() : ",result.toHuman());
      // Ok: data: "0x00"

      // the gas consumed for contract execution
    //   console.log("===> gasRequired.toHuman() : ",gasRequired.toHuman()); 
      // {refTime: '6,219,235,328', proofSize: '131,072'}

      // check if the call was successful
      if (result.isOk) {
        // output the return value
        console.log('Success', output.toHuman());  //Success false
		return  output.toHuman()
      } else {
        console.error('Error', result.asErr);
		return result.asErr
      }

    }
    else { console.log(`ASTAR API IS NOT SET UP YET`); return null }
  }
//#endregion

//#region tm_getCompletedJobsIds
const tm_getCompletedJobsIds = async () => {

    if (astar_api) 
    {
	  const contract = contract_treasury_manager;

      const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
      const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
      const { gasRequired, storageDeposit, result, output } = await contract.query.getCompletedJobsIds(
        polkadot_test_account.address, 
        {
          gasLimit: astar_api.registry.createType('WeightV2', {
            refTime: maxGas,
            proofSize: maxGas,
          }),
          storageDepositLimit: null,
        },
      );

      // The actual result from RPC as `ContractExecResult`
    //   console.log("===> result.toHuman() : ",result.toHuman());
      // Ok: data: "0x00"

      // the gas consumed for contract execution
    //   console.log("===> gasRequired.toHuman() : ",gasRequired.toHuman()); 
      // {refTime: '6,219,235,328', proofSize: '131,072'}

      // check if the call was successful
      if (result.isOk) {
        // output the return value
        console.log('Success', output.toHuman());  //Success false

		// console.log('Success 3', hexToU8a(output.toString()) );  //Success false
		// const levelsArray = hexToU8a(output.toString())
		// console.log(`levelsArray: ${levelsArray[0]} ${levelsArray[1]} ${levelsArray[2]} `);


		return  output.toHuman()
      } else {
        console.error('Error', result.asErr);
		return result.asErr
      }

    }
    else { console.log(`ASTAR API IS NOT SET UP YET`); return null }
  }
//#endregion

//#region tm_getLiabilityThresholds
const tm_getLiabilityThresholds = async () => {

    if (astar_api) 
    {
	  const contract = contract_treasury_manager;

      const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
      const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
      const { gasRequired, storageDeposit, result, output } = await contract.query.getLiabilityThresholds(
        polkadot_test_account.address, 
        {
          gasLimit: astar_api.registry.createType('WeightV2', {
            refTime: maxGas,
            proofSize: maxGas,
          }),
          storageDepositLimit: null,
        },
      );

      // The actual result from RPC as `ContractExecResult`
    //   console.log("===> result.toHuman() : ",result.toHuman());
      // Ok: data: "0x00"

      // the gas consumed for contract execution
    //   console.log("===> gasRequired.toHuman() : ",gasRequired.toHuman()); 
      // {refTime: '6,219,235,328', proofSize: '131,072'}

      // check if the call was successful
      if (result.isOk) {
        // output the return value
        // console.log('Success 1', output.toHuman());  //Success false
        // console.log('Success 2', output.toString() );  //Success false
        console.log('Success 3', hexToU8a(output.toString()) );  //Success false
		const levelsArray = hexToU8a(output.toString())
		console.log(`levelsArray: ${levelsArray[0]} ${levelsArray[1]} ${levelsArray[2]} `);

		return  levelsArray
      } else {
        console.error('Error', result.asErr);
		return result.asErr
      }

    }
    else { console.log(`ASTAR API IS NOT SET UP YET`); return null }
  }
//#endregion

//#region tm_getLiabilityHealth
const tm_getLiabilityHealth = async () => {

    if (astar_api) 
    {
	  const contract = contract_treasury_manager;
	  	
      const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
      const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
      const { gasRequired, storageDeposit, result, output } = await contract.query.getLiabilityHealth(
        polkadot_test_account.address, 
        {
          gasLimit: astar_api.registry.createType('WeightV2', {
            refTime: maxGas,
            proofSize: maxGas,
          }),
          storageDepositLimit: null,
        },
      );

      // The actual result from RPC as `ContractExecResult`
    //   console.log("===> result.toHuman() : ",result.toHuman());
      // Ok: data: "0x00"

      // the gas consumed for contract execution
    //   console.log("===> gasRequired.toHuman() : ",gasRequired.toHuman()); 
      // {refTime: '6,219,235,328', proofSize: '131,072'}

      // check if the call was successful
      if (result.isOk) {
        // output the return value
        console.log('Success 1', output.toHuman());  //Success false
        // console.log('Success 2',   output.toString());  //Success false
        // console.log('Success 3',  hexToU8a(output.touman));  //Success false
		
		console.log('Success 3', hexToU8a(output.toString()) );  //Success false
		const levelsArray = hexToU8a(output.toString())
		console.log(`levelsArray: ${levelsArray[0]} ${levelsArray[1]} ${levelsArray[2]} ${levelsArray[3]} `);

		return levelsArray

		// return  output.toHuman()
      } else {
        console.error('Error', result.asErr);
		return result.asErr
      }

    }
    else { console.log(`ASTAR API IS NOT SET UP YET`); return null }
  }
//#endregion

//#region tm_getLiabilityInUsdtTokensTreasury
const tm_getLiabilityInUsdtTokensTreasury = async () => {

    if (astar_api) 
    {
	  const contract = contract_treasury_manager;

      const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
      const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
      const { gasRequired, storageDeposit, result, output } = await contract.query.getLiabilityInUsdtTokensTreasury(
        polkadot_test_account.address, 
        {
          gasLimit: astar_api.registry.createType('WeightV2', {
            refTime: maxGas,
            proofSize: maxGas,
          }),
          storageDepositLimit: null,
        },
      );

      // The actual result from RPC as `ContractExecResult`
    //   console.log("===> result.toHuman() : ",result.toHuman());
      // Ok: data: "0x00"

      // the gas consumed for contract execution
    //   console.log("===> gasRequired.toHuman() : ",gasRequired.toHuman()); 
      // {refTime: '6,219,235,328', proofSize: '131,072'}

      // check if the call was successful
      if (result.isOk) {
        // output the return value
        // console.log('Success', output.toHuman());  //Success false
		// const liabilitues_array = output.toHuman();
		const liabilitues_array = JSON.parse(output.toString());

		// console.log(` ******>>>>>>> liabilitues_array: `,liabilitues_array)
		// console.log(` ******>>>>>>> liabilitues_array[0]: `,liabilitues_array[0])
		// console.log(` ******>>>>>>> liabilitues_array[0]: ${typeof(liabilitues_array[0])} `)
		// const a = new BN( `${liabilitues_array[0]}`)
		// console.log(` ******>>>>>>> liabilitues_array[0]: ${a} `)

		const new_liabilitues_array = []
		for (let i=0; i<liabilitues_array.length; i++) {
			const element =  new BN(`${liabilitues_array[i]}`);
			const l_value =  Number((element.div(mantissa15)).toString()) ; //allow for 3 decimals
			new_liabilitues_array.push(l_value / 1000);
		}

		return new_liabilitues_array

		// return  output.toHuman()
      } else {
        console.error('Error', result.asErr);
		return result.asErr
      }

    }
    else { console.log(`ASTAR API IS NOT SET UP YET`); return null }
  }
//#endregion

//#region tm_getLiabilityInUsdtTokens
const tm_getLiabilityInUsdtTokens = async () => {

    if (astar_api) 
    {
	  const contract = contract_treasury_manager;

      const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
      const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
      const { gasRequired, storageDeposit, result, output } = await contract.query.getLiabilityInUsdtTokens(
        polkadot_test_account.address, 
        {
          gasLimit: astar_api.registry.createType('WeightV2', {
            refTime: maxGas,
            proofSize: maxGas,
          }),
          storageDepositLimit: null,
        },
      );

      // The actual result from RPC as `ContractExecResult`
    //   console.log("===> result.toHuman() : ",result.toHuman());
      // Ok: data: "0x00"

      // the gas consumed for contract execution
    //   console.log("===> gasRequired.toHuman() : ",gasRequired.toHuman()); 
      // {refTime: '6,219,235,328', proofSize: '131,072'}

      // check if the call was successful
      if (result.isOk) {
        // output the return value
        // console.log('Success', output.toHuman());  //Success false


		// const liabilitues_array = output.toHuman();
		const liabilitues_array = JSON.parse(output.toString());


		const new_liabilitues_array = []
		for (let i=0; i<liabilitues_array.length; i++) {
			const element =  new BN(`${liabilitues_array[i]}`);
			const l_value =  Number((element.div(mantissa15)).toString()) ; //allow for 3 decimals
			new_liabilitues_array.push(l_value / 1000);
		}

		return new_liabilitues_array

		// return  output.toHuman()
      } else {
        console.error('Error', result.asErr);
		return result.asErr
      }

    }
    else { console.log(`ASTAR API IS NOT SET UP YET`); return null }
  }
//#endregion

//#region tm_getLiabilityInTreasury
const tm_getLiabilityInTreasury = async () => {

    if (astar_api) 
    {
	  const contract = contract_treasury_manager;

      const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
      const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
      const { gasRequired, storageDeposit, result, output } = await contract.query.getLiabilityInTreasury(
        polkadot_test_account.address, 
        {
          gasLimit: astar_api.registry.createType('WeightV2', {
            refTime: maxGas,
            proofSize: maxGas,
          }),
          storageDepositLimit: null,
        },
      );

      // The actual result from RPC as `ContractExecResult`
    //   console.log("===> result.toHuman() : ",result.toHuman());
      // Ok: data: "0x00"

      // the gas consumed for contract execution
    //   console.log("===> gasRequired.toHuman() : ",gasRequired.toHuman()); 
      // {refTime: '6,219,235,328', proofSize: '131,072'}

      // check if the call was successful
      if (result.isOk) {
        // output the return value
        // console.log('Success', output.toHuman());  //Success false

		// const liabilitues_array = output.toHuman();
		const liabilitues_array = JSON.parse(output.toString());



		const new_liabilitues_array = []
		for (let i=0; i<liabilitues_array.length; i++) {
			const element =  new BN(`${liabilitues_array[i]}`);
			const l_value =  Number((element.div(mantissa15)).toString()) ; //allow for 3 decimals
			new_liabilitues_array.push(l_value / 1000);
		}

		return new_liabilitues_array


		// return  output.toHuman()
      } else {
        console.error('Error', result.asErr);
		return result.asErr
      }

    }
    else { console.log(`ASTAR API IS NOT SET UP YET`); return null }
  }
//#endregion

//#region tm_getCheckPointIntervals
const tm_getCheckPointIntervals = async () => {

    if (astar_api) 
    {
	  const contract = contract_treasury_manager;

      const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
      const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
      const { gasRequired, storageDeposit, result, output } = await contract.query.getCheckPointsIntervals(
        polkadot_test_account.address, 
        {
          gasLimit: astar_api.registry.createType('WeightV2', {
            refTime: maxGas,
            proofSize: maxGas,
          }),
          storageDepositLimit: null,
        },
      );

      // The actual result from RPC as `ContractExecResult`
      console.log("===> result.toHuman() : ",result.toHuman());
      // Ok: data: "0x00"

      // the gas consumed for contract execution
      console.log("===> gasRequired.toHuman() : ",gasRequired.toHuman()); 
      // {refTime: '6,219,235,328', proofSize: '131,072'}

      // check if the call was successful
      if (result.isOk) {
        // output the return value
        console.log('Success', output.toHuman());  //Success false
		return  output.toHuman()
      } else {
        console.error('Error', result.asErr);
		return result.asErr
      }

    }
    else { console.log(`ASTAR API IS NOT SET UP YET`); return null }
  }
//#endregion

//#region tm_getBalance
const tm_getBalance = async (_token, account) => {

    if (astar_api) 
    {
	  const contract = contract_treasury_manager;

	  let token;
	  if (_token==="DOT") token=DOT
	  else if (_token==="USDT") token=USDT;

      const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
      const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
      const { gasRequired, storageDeposit, result, output } = await contract.query.getBalance(
        polkadot_test_account.address, 
        {
          gasLimit: astar_api.registry.createType('WeightV2', {
            refTime: maxGas,
            proofSize: maxGas,
          }),
          storageDepositLimit: null,
        },
		token, account
      );

      // The actual result from RPC as `ContractExecResult`
    //   console.log("===> result.toHuman() : ",result.toHuman());
      // Ok: data: "0x00"

      // the gas consumed for contract execution
    //   console.log("===> gasRequired.toHuman() : ",gasRequired.toHuman()); 
      // {refTime: '6,219,235,328', proofSize: '131,072'}

      // check if the call was successful
      if (result.isOk) {
        // output the return value
        // console.log('Success', output.toHuman());  //Success false
        // console.log('Success', output.toString());  //Success false

		const account_balance =  new BN( output.div(mantissa15) ); //allow for 3 decimals
		return Number(account_balance.toString())/1000;

		// return  output.toHuman()
		// return  output

      } else {
        console.error('Error', result.asErr);
		return result.asErr
      }

    }
    else { console.log(`ASTAR API IS NOT SET UP YET`); return null }
  }
//#endregion

//#region tm_getPriceForPair
const tm_getPriceForPair = async (_base_token="DOT", _quote_token="USDT") => {

    if (astar_api) 
    {
	  const contract = contract_treasury_manager;

	  let base_token, quote_token;
	  if (_base_token==="DOT") base_token = DOT;
	  if (_quote_token==="USDT") quote_token = USDT;


      const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
      const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
      const { gasRequired, storageDeposit, result, output } = await contract.query.getPriceForPair(
        polkadot_test_account.address, 
        {
          gasLimit: astar_api.registry.createType('WeightV2', {
            refTime: maxGas,
            proofSize: maxGas,
          }),
          storageDepositLimit: null,
        },
		base_token, quote_token
      );

      // The actual result from RPC as `ContractExecResult`
      console.log("===> result.toHuman() : ",result.toHuman());
      // Ok: data: "0x00"

      // the gas consumed for contract execution
      console.log("===> gasRequired.toHuman() : ",gasRequired.toHuman()); 
      // {refTime: '6,219,235,328', proofSize: '131,072'}

      // check if the call was successful
      if (result.isOk) {
        // output the return value
        console.log('Success', output.toHuman());  //Success false
		
		// const price =  new BN( output.div(mantissa18) );
		// return price;
		return  output.toHuman() 

      } else {
        console.error('Error', result.asErr);
		return result.asErr
      }

    }
    else { console.log(`ASTAR API IS NOT SET UP YET`); return null }
  }
//#endregion

//#region tm_getAveragePriceForPair
const tm_getAveragePriceForPair = async (_base_token="DOT", _quote_token="USDT") => {

    if (astar_api) 
    {
	  const contract = contract_treasury_manager;

	  let base_token, quote_token;
	  if (_base_token==="DOT") base_token = DOT;
	  if (_quote_token==="USDT") quote_token = USDT;

      const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
      const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
      const { gasRequired, storageDeposit, result, output } = await contract.query.getAveragePriceForPair(
        polkadot_test_account.address, 
        {
          gasLimit: astar_api.registry.createType('WeightV2', {
            refTime: maxGas,
            proofSize: maxGas,
          }),
          storageDepositLimit: null,
        },
		base_token, quote_token
      );

      // The actual result from RPC as `ContractExecResult`
      console.log("===> result.toHuman() : ",result.toHuman());
      // Ok: data: "0x00"

      // the gas consumed for contract execution
      console.log("===> gasRequired.toHuman() : ",gasRequired.toHuman()); 
      // {refTime: '6,219,235,328', proofSize: '131,072'}

      // check if the call was successful
      if (result.isOk) {
        // output the return value
        console.log('Success', output.toHuman());  //Success false
		
		// const price =  new BN( output.div(mantissa18) );
		// return price;
		return  output.toHuman()
      } else {
        console.error('Error', result.asErr);
		return result.asErr
      }

    }
    else { console.log(`ASTAR API IS NOT SET UP YET`); return null }
  }
//#endregion


//WRITE

//#region tm_setLiabilitiesThresholds e.g. amount 10 for 10%
const tm_setLiabilitiesThresholds = async (amount) => {
  
	if (astar_api) 
	{
	  const contract = contract_treasury_manager;

	  // D R Y  R U N (We perform the send from an account, here using polkadot_test_account address)
	  const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
	  const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
  
	  const { gasRequired, storageDeposit, result } = await contract.query.setLiabilitiesThresholds (
		polkadot_test_account.address, 
		{
		  gasLimit: astar_api.registry.createType('WeightV2', {
			refTime: maxGas,
			proofSize: maxGas,
		  }),
		  storageDepositLimit: null,
		},
		amount
	  );

	  console.log(`outcome: ${result.isOk ? 'Ok' : 'Error'}`); // outcome: Ok
	  console.log(`gasRequired ${gasRequired.toString()}`);    // gasRequired {"refTime":6219235328,"proofSize":131072}
  
	  const gasLimit = astar_api.registry.createType('WeightV2', gasRequired); //as WeightV2
  
	  // Send the transaction, like elsewhere this is a normal extrinsic with the same rules as applied in the API (As with the read example,
	  // additional params, if required can follow - here only one is needed)
	  await contract.tx
	  .setLiabilitiesThresholds (
		{ 
		  gasLimit,
		  storageDepositLimit: null, 
		}, 
		amount
	  )
	  .signAndSend( polkadot_test_account, { nonce: -1 }, result => {
		if (result.status.isInBlock) {
		  console.log(' =====>>> in a block');
		} else if (result.status.isFinalized) {
		  console.log(' =====>>> finalized');
		  console.log('result: ',JSON.stringify(result,null,"\t"));
  
		}
	  });
  
	}
	else console.log(`ASTAR API IS NOT SET UP YET`);
  
}
//#endregion

//#region tm_setCheckPointsIntervals e.g. 100, 200, 300 added to current timestamp (milliseconds)
const tm_setCheckPointsIntervals = async (checkpoint1, checkpoint2, checkpoint3) => {
  
	if (astar_api) 
	{
	  const contract = contract_treasury_manager;

	  // D R Y  R U N (We perform the send from an account, here using polkadot_test_account address)
	  const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
	  const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
  
	  const { gasRequired, storageDeposit, result } = await contract.query.setCheckPointsIntervals (
		polkadot_test_account.address, 
		{
		  gasLimit: astar_api.registry.createType('WeightV2', {
			refTime: maxGas,
			proofSize: maxGas,
		  }),
		  storageDepositLimit: null,
		},
		checkpoint1, checkpoint2, checkpoint3
	  );

	  console.log(`outcome: ${result.isOk ? 'Ok' : 'Error'}`); // outcome: Ok
	  console.log(`gasRequired ${gasRequired.toString()}`);    // gasRequired {"refTime":6219235328,"proofSize":131072}
  
	  const gasLimit = astar_api.registry.createType('WeightV2', gasRequired); //as WeightV2
  
	  // Send the transaction, like elsewhere this is a normal extrinsic with the same rules as applied in the API (As with the read example,
	  // additional params, if required can follow - here only one is needed)
	  await contract.tx
	  .setCheckPointsIntervals (
		{ 
		  gasLimit,
		  storageDepositLimit: null, 
		}, 
		checkpoint1, checkpoint2, checkpoint3
	  )
	  .signAndSend( polkadot_test_account, result => {
		if (result.status.isInBlock) {
		  console.log(' =====>>> in a block');
		} else if (result.status.isFinalized) {
		  console.log(' =====>>> finalized');
		  console.log('result: ',JSON.stringify(result,null,"\t"));
  
		}
	  });
  
	}
	else console.log(`ASTAR API IS NOT SET UP YET`);
  
}
//#endregion

//#region tm_calculateLiabilities    BOTH server and front end for different reasons
const tm_calculateLiabilities = async () => {
  
	if (astar_api) 
	{
	  const contract = contract_treasury_manager;
	  console.log(` ********** tm_calculateLiabilities ********** ||| SmartPay Submitted`);

	  // D R Y  R U N (We perform the send from an account, here using polkadot_test_account address)
	  const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
	  const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
  
	  const { gasRequired, storageDeposit, result } = await contract.query.calculateLiabilities (
		polkadot_test_account.address, 
		{
		  gasLimit: astar_api.registry.createType('WeightV2', {
			refTime: maxGas,
			proofSize: maxGas,
		  }),
		  storageDepositLimit: null,
		},
	  );

	  console.log(`outcome: ${result.isOk ? 'Ok' : 'Error'}`); // outcome: Ok
	  console.log(`gasRequired ${gasRequired.toString()}`);    // gasRequired {"refTime":6219235328,"proofSize":131072}
  
	  const gasLimit = astar_api.registry.createType('WeightV2', gasRequired); //as WeightV2
  
	  // Send the transaction, like elsewhere this is a normal extrinsic with the same rules as applied in the API (As with the read example,
	  // additional params, if required can follow - here only one is needed)
	  await contract.tx
	  .calculateLiabilities (
		{ 
		  gasLimit,
		  storageDepositLimit: null, 
		}, 
	  )
	  .signAndSend( polkadot_test_account, { nonce: -1 }, result => {
		if (result.status.isInBlock) {
		  console.log(' =====>>> in a block');
		} else if (result.status.isFinalized) {
		  console.log(' =====>>> finalized');
		  console.log('result: ',JSON.stringify(result,null,"\t"));
		  console.log(` ********** tm_calculateLiabilities ********** ||| SmartPay Finalised`);
  
		}
	  });
  
	}
	else console.log(`ASTAR API IS NOT SET UP YET`);
  
}
//#endregion


//SERVER WRITE FUNCTIONS

//#region server_tm_checkOpenJobs 
const server_tm_checkOpenJobs = async () => {

  
	if (astar_api) 
	{
	  const contract = contract_treasury_manager;
	  console.log(` ********** server_tm_checkOpenJobs ********** ||| SmartPay Submitted`);

	  // D R Y  R U N (We perform the send from an account, here using polkadot_test_account address)
	  const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
	  const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
  
	  const { gasRequired, storageDeposit, result } = await contract.query.checkOpenJobs (
		polkadot_test_account.address, 
		{
		  gasLimit: astar_api.registry.createType('WeightV2', {
			refTime: maxGas,
			proofSize: maxGas,
		  }),
		  storageDepositLimit: null,
		},
	  );

	//   console.log(`outcome: ${result.isOk ? 'Ok' : 'Error'}`); // outcome: Ok
	//   console.log(`gasRequired ${gasRequired.toString()}`);    // gasRequired {"refTime":6219235328,"proofSize":131072}
  
	  const gasLimit = astar_api.registry.createType('WeightV2', gasRequired); //as WeightV2
  
	  // Send the transaction, like elsewhere this is a normal extrinsic with the same rules as applied in the API (As with the read example,
	  // additional params, if required can follow - here only one is needed)
	  await contract.tx
	  .checkOpenJobs (
		{ 
		  gasLimit,
		  storageDepositLimit: null, 
		}, 
	  )
	  .signAndSend( polkadot_test_account, { nonce: -1 }, result => {
		if (result.status.isInBlock) {
		  console.log(' =====>>> in a block');
		} else if (result.status.isFinalized) {
		  console.log(' =====>>> finalized');
		  console.log('result: ',JSON.stringify(result,null,"\t"));
		  console.log(` ********** server_tm_checkOpenJobs ********** ||| SmartPay Finalised`);
  
		}
	  });
  
	}
	else { console.log(`ASTAR API IS NOT SET UP YET`);  }

  
}
//#endregion

//#region server_tm_checkPendingJobs  
const server_tm_checkPendingJobs = async () => {
  
	if (astar_api) 
	{
	  const contract = contract_treasury_manager;
	  console.log(` ********** server_tm_checkPendingJobs ********** ||| SmartPay Submitted`);

	  // D R Y  R U N (We perform the send from an account, here using polkadot_test_account address)
	  const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
	  const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
  
	  const { gasRequired, storageDeposit, result } = await contract.query.checkPendingJobs (
		polkadot_test_account.address, 
		{
		  gasLimit: astar_api.registry.createType('WeightV2', {
			refTime: maxGas,
			proofSize: maxGas,
		  }),
		  storageDepositLimit: null,
		},
	  );

	//   console.log(`outcome: ${result.isOk ? 'Ok' : 'Error'}`); // outcome: Ok
	//   console.log(`gasRequired ${gasRequired.toString()}`);    // gasRequired {"refTime":6219235328,"proofSize":131072}
  
	  const gasLimit = astar_api.registry.createType('WeightV2', gasRequired); //as WeightV2
  
	  // Send the transaction, like elsewhere this is a normal extrinsic with the same rules as applied in the API (As with the read example,
	  // additional params, if required can follow - here only one is needed)
	  await contract.tx
	  .checkPendingJobs (
		{ 
		  gasLimit,
		  storageDepositLimit: null, 
		}, 
	  )
	  .signAndSend( polkadot_test_account, { nonce: -1 }, result => {
		if (result.status.isInBlock) {
		  console.log(' =====>>> in a block');
		} else if (result.status.isFinalized) {
		  console.log(' =====>>> finalized');
		  console.log('result: ',JSON.stringify(result,null,"\t"));
    	  console.log(` ********** server_tm_checkPendingJobs ********** ||| SmartPay Finalised`);
  
		}
	  });
  
	}
	else { console.log(`ASTAR API IS NOT SET UP YET`);  }

}
//#endregion

//#region server_tm_makeNativePayments 
const server_tm_makeNativePayments = async () => {
  
	if (astar_api) 
	{
	  const contract = contract_treasury_manager;
	  console.log(` ********** server_tm_makeNativePayments ********** ||| SmartPay Submitted`);


	  // D R Y  R U N (We perform the send from an account, here using polkadot_test_account address)
	  const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
	  const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
  
	  const { gasRequired, storageDeposit, result } = await contract.query.makeNativePayments (
		polkadot_test_account.address, 
		{
		  gasLimit: astar_api.registry.createType('WeightV2', {
			refTime: maxGas,
			proofSize: maxGas,
		  }),
		  storageDepositLimit: null,
		},
	  );

	//   console.log(`outcome: ${result.isOk ? 'Ok' : 'Error'}`); // outcome: Ok
	//   console.log(`gasRequired ${gasRequired.toString()}`);    // gasRequired {"refTime":6219235328,"proofSize":131072}
  
	  const gasLimit = astar_api.registry.createType('WeightV2', gasRequired); //as WeightV2
  
	  // Send the transaction, like elsewhere this is a normal extrinsic with the same rules as applied in the API (As with the read example,
	  // additional params, if required can follow - here only one is needed)
	  await contract.tx
	  .makeNativePayments (
		{ 
		  gasLimit,
		  storageDepositLimit: null, 
		}, 
	  )
	  .signAndSend( polkadot_test_account, { nonce: -1 }, result => {
		if (result.status.isInBlock) {
		  console.log(' =====>>> in a block');
		} else if (result.status.isFinalized) {
		  console.log(' =====>>> finalized');
		  console.log('result: ',JSON.stringify(result,null,"\t"));
    	  console.log(` ********** server_tm_makeNativePayments ********** ||| SmartPay Finalised`);
  
		}
	  });
  
	}
	else { console.log(`ASTAR API IS NOT SET UP YET`); }

}
//#endregion

//#region server_tm_makeNativeUsdPayments  
const server_tm_makeNativeUsdPayments = async () => {
  
	if (astar_api) 
	{
	  const contract = contract_treasury_manager;
	  console.log(` ********** server_tm_makeNativeUsdPayments ********** ||| SmartPay Submitted`);

	  // D R Y  R U N (We perform the send from an account, here using polkadot_test_account address)
	  const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
	  const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
  
	  const { gasRequired, storageDeposit, result } = await contract.query.makeNativeUsdPayments (
		polkadot_test_account.address, 
		{
		  gasLimit: astar_api.registry.createType('WeightV2', {
			refTime: maxGas,
			proofSize: maxGas,
		  }),
		  storageDepositLimit: null,
		},
	  );

	//   console.log(`outcome: ${result.isOk ? 'Ok' : 'Error'}`); // outcome: Ok
	//   console.log(`gasRequired ${gasRequired.toString()}`);    // gasRequired {"refTime":6219235328,"proofSize":131072}
  
	  const gasLimit = astar_api.registry.createType('WeightV2', gasRequired); //as WeightV2
  
	  // Send the transaction, like elsewhere this is a normal extrinsic with the same rules as applied in the API (As with the read example,
	  // additional params, if required can follow - here only one is needed)
	  await contract.tx
	  .makeNativeUsdPayments (
		{ 
		  gasLimit,
		  storageDepositLimit: null, 
		}, 
	  )
	  .signAndSend( polkadot_test_account, { nonce: -1 }, result => {
		if (result.status.isInBlock) {
		  console.log(' =====>>> in a block');
		} else if (result.status.isFinalized) {
		  console.log(' =====>>> finalized');
		  console.log('result: ',JSON.stringify(result,null,"\t"));
    	  console.log(` ********** server_tm_makeNativeUsdPayments ********** ||| SmartPay Finalised`);

  
		}
	  });
  
	}
	else { console.log(`ASTAR API IS NOT SET UP YET`); }

}
//#endregion

//#region server_tm_makeNonNativePayments  
const server_tm_makeNonNativePayments = async () => {
  
	if (astar_api) 
	{
	  const contract = contract_treasury_manager;
	  console.log(` ********** server_tm_makeNonNativePayments ********** ||| SmartPay Submitted`);

	  // D R Y  R U N (We perform the send from an account, here using polkadot_test_account address)
	  const maximumBlockWeight = astar_api.consts.system.blockWeights.maxBlock;// as unknown as WeightV2
	  const maxGas = maximumBlockWeight.refTime.toNumber() * 0.9;
  
	  const { gasRequired, storageDeposit, result } = await contract.query.makeNonNativePayments (
		polkadot_test_account.address, 
		{
		  gasLimit: astar_api.registry.createType('WeightV2', {
			refTime: maxGas,
			proofSize: maxGas,
		  }),
		  storageDepositLimit: null,
		},
	  );

	//   console.log(`outcome: ${result.isOk ? 'Ok' : 'Error'}`); // outcome: Ok
	//   console.log(`gasRequired ${gasRequired.toString()}`);    // gasRequired {"refTime":6219235328,"proofSize":131072}
  
	  const gasLimit = astar_api.registry.createType('WeightV2', gasRequired); //as WeightV2
  
	  // Send the transaction, like elsewhere this is a normal extrinsic with the same rules as applied in the API (As with the read example,
	  // additional params, if required can follow - here only one is needed)
	  await contract.tx
	  .makeNonNativePayments (
		{ 
		  gasLimit,
		  storageDepositLimit: null, 
		}, 
	  )
	  .signAndSend( polkadot_test_account, { nonce: -1 }, result => {
		if (result.status.isInBlock) {
		  console.log(' =====>>> in a block');
		} else if (result.status.isFinalized) {
		  console.log(' =====>>> finalized');
		  console.log('result: ',JSON.stringify(result,null,"\t"));
    	  console.log(` ********** server_tm_makeNonNativePayments ********** ||| SmartPay Finalised`);
  
		}
	  });
  
	}
	else { console.log(`ASTAR API IS NOT SET UP YET`);  }

}
//#endregion












export {
          setPolkadotInjector,
          setup_SubstrateChain, 

		  pallet_get_treasury_manager_address,
		  pallet_get_admin,
		  pallet_addNewVotedJob,
		  pallet_removeJob,
		  pallet_depositFundsToTreasuryManager,
		  pallet_launchTreasuryManager,
		  pallet_withdrawFundsFromTreasuryManager,
		  pallet_setAdminHereAndManagerForTm,
		  pallet_get_address,

		  tm_getPriceForPair,
		  tm_getAveragePriceForPair,
		  tm_getLiabilityThresholds,
		  tm_getLiabilityHealth,
		  tm_getLiabilityInUsdtTokensTreasury,
		  tm_getLiabilityInUsdtTokens,
		  tm_getLiabilityInTreasury,
		  tm_getCheckPointIntervals,
		  tm_getBalance,
		  tm_setLiabilitiesThresholds,
		  tm_getOpenJobIds,
		  tm_getPendingJobsIds,
		  tm_getCompletedJobsIds,
		  tm_getJobInfo,

		  server_tm_checkOpenJobs,
		  server_tm_checkPendingJobs,
		  server_tm_makeNativePayments,
		  server_tm_makeNativeUsdPayments,
		  server_tm_makeNonNativePayments,
		  tm_calculateLiabilities,

       };