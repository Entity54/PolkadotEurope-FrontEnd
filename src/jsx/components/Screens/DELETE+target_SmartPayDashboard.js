import React,{Fragment,useContext, useState, useEffect} from 'react';
import loadable from "@loadable/component";
import pMinDelay from "p-min-delay";

import { ThemeContext } from "../../../context/ThemeContext";
 
import { pallet_get_treasury_manager_address, pallet_get_admin, pallet_launchTreasuryManager, 
	pallet_addNewVotedJob, pallet_removeJob, pallet_depositFundsToTreasuryManager,
	pallet_withdrawFundsFromTreasuryManager, pallet_setAdminHereAndManagerForTm, 
	tm_getPriceForPair, tm_getAveragePriceForPair, tm_getLiabilityThresholds, tm_getLiabilityHealth,
	tm_getLiabilityInUsdtTokensTreasury, tm_getLiabilityInUsdtTokens, tm_getLiabilityInTreasury,
	tm_getCheckPointIntervals, tm_getBalance,
	tm_setLiabilitiesThresholds
} from "../../../Setup";


const CoinChart = loadable(() =>
  pMinDelay(import("../Boltz/MyWallet/CoinChart"), 1000)
);

const SmartPay = ({ astar_api, blockHeader }) => {
	const { background } = useContext(ThemeContext);


	const [palletAdminAddress, setPalletAdminAddress] = useState("");
	const [smartPayAddress, setSmartPayAddress] = useState("");
	const [smartPay_button_active, setSmartPay_button_active] = useState(true);
	const [amountToDepositWithdraw, setAmountToDepositWithdraw] = useState("");

	const [price, setPrice] = useState("");
	const [averagePrice, setAveragePrice] = useState("");

	const [pallet_balance, setPallet_balance] = useState("");
	const [smartPay_balance, setSmartPay_balance] = useState("");
	const [liabilityThresholds, setLiabilityThresholds] = useState([]);
	const [healthLevels, setHealthLevels] = useState([]);

	const [liabilityInUsdtTokensTreasury, setLiabilityInUsdtTokensTreasury] = useState([]);
	const [liabilityInUsdtTokens, setLiabilityInUsdtTokens] = useState([]);
	const [liabilityInTreasuryTokens, setLiabilityInTreasuryTokens] = useState([]);

	const [overallLiabilities, setOverallLiabilities] = useState([]);
	const [twoDaysLiabilities, setTwoDaysLiabilities] = useState([]);
	const [sevenDaysLiabilities, setSevenDaysLiabilities] = useState([]);
	const [thirtyDaysLiabilities, setThirtyDaysLiabilities] = useState([]);

	const [smartPay_notification_two_active, setSmartPay_notification_two_active] = useState(false);
	const [smartPay_notification_seven_active, setSmartPay_notification_seven_active] = useState(false);
	const [smartPay_notification_thirty_active, setSmartPay_notification_thrity_active] = useState(false);
	const [smartPay_notification_overall_active, setSmartPay_notification_overall_active] = useState(true);
	


	const getLiabilityThresholds_tm = async () => {
		const levelsArray = await tm_getLiabilityThresholds();
		// console.log(`levelsArray: ${levelsArray[0]} ${levelsArray[1]} ${levelsArray[2]} `);
		setLiabilityThresholds(levelsArray);
	}

	const getLiabilityHealth_tm = async () => {
		const levelsArray = await tm_getLiabilityHealth();
		console.log(`levelsArray: ${levelsArray[0]} ${levelsArray[1]} ${levelsArray[2]} `);
		setHealthLevels(levelsArray);
	}

	const get_all_liabilities_tm = async () => {
		const l_usdt_dot = await tm_getLiabilityInUsdtTokensTreasury();
		const l_usdt = await tm_getLiabilityInUsdtTokens();
		const l_dot = await tm_getLiabilityInTreasury();
		const smartPay_balance = await tm_getBalance("DOT", smartPayAddress);

		const overalll = l_dot[0] + l_usdt_dot[0];
		const overall_percentage_cover = smartPay_balance>0? (overalll / smartPay_balance) * 100 : (overalll >0? "∞" : 0) ;
		const overall_col = [l_dot[0], l_usdt_dot[0], overalll, overall_percentage_cover];

		const two_day_overall = l_dot[1] + l_usdt_dot[1];
		const two_day_percentage_cover = smartPay_balance>0? (two_day_overall / smartPay_balance) * 100 : (two_day_overall >0? "∞" : 0) ;
		const two_day_col = [l_dot[1], l_usdt_dot[1], two_day_overall, two_day_percentage_cover];

		const seven_day_overall = l_dot[2] + l_usdt_dot[2];
		const seven_day_percentage_cover = smartPay_balance>0? (seven_day_overall / smartPay_balance) * 100 : (seven_day_overall >0? "∞" : 0) ;
		const seven_day_col = [l_dot[2], l_usdt_dot[2], seven_day_overall, seven_day_percentage_cover];

		const thirty_day_overall = l_dot[3] + l_usdt_dot[3];
		const thirty_day_percentage_cover = smartPay_balance>0? (thirty_day_overall / smartPay_balance) * 100 : (thirty_day_overall >0? "∞" : 0) ;
		const thirty_day_col = [l_dot[3], l_usdt_dot[3], thirty_day_overall, thirty_day_percentage_cover];
		
		console.log(` ********************************* `);
		console.log(`SmartPayDashboard|> get_all_liabilities_tm overall_col: `,overall_col); 
		console.log(`SmartPayDashboard|> get_all_liabilities_tm two_day_col: `,two_day_col); 
		console.log(`SmartPayDashboard|> get_all_liabilities_tm seven_day_col: `,seven_day_col); 
		console.log(`SmartPayDashboard|> get_all_liabilities_tm thirty_day_col: `,thirty_day_col); 
		console.log(` ********************************* `);
 
		setOverallLiabilities(overall_col);
		setTwoDaysLiabilities(two_day_col);
		setSevenDaysLiabilities(seven_day_col);
		setThirtyDaysLiabilities(thirty_day_col);
	}


	const getLiabilityInUsdtTokensTreasury_tm = async () => {
		const result = await tm_getLiabilityInUsdtTokensTreasury();
		console.log(`SmartPayDashboard|> getLiabilityInUsdtTokensTreasury_tm result: `,result); //['0', '0', '0', '0']
		setLiabilityInUsdtTokensTreasury(result);
	}

	const getLiabilityInUsdtTokens_tm = async () => {
		const result = await tm_getLiabilityInUsdtTokens();
		console.log(`SmartPayDashboard|> getLiabilityInUsdtTokens_tm result: `,result); //['0', '0', '0', '0']
		setLiabilityInUsdtTokens(result);
	}

	const getLiabilityInTreasury_tm = async () => {
		const result = await tm_getLiabilityInTreasury();
		console.log(`SmartPayDashboard|> getLiabilityInTreasury_tm result: `,result); //['0', '0', '0', '0']
		setLiabilityInTreasuryTokens(result);
	}

	// const getCheckPointIntervals_tm = async () => {
	// 	const result = await tm_getCheckPointIntervals();

	// 	console.log(` ********************************* `);
	// 	console.log(`SmartPayDashboard|> getCheckPointIntervals_tm result: `,result); //['110', '210', '310']
	// 	console.log(` ********************************* `);
	// }

	const getBalance_pallet = async () => {
		if (palletAdminAddress!=="")
		{
			const result = await tm_getBalance("DOT", palletAdminAddress);
			console.log(` ********************************* `);
			console.log(`SmartPayDashboard|> getBalance_pallet result: `,result);
			setPallet_balance(result);
		}
	}

	const getBalance_smartPay = async () => {
		if (smartPayAddress!=="")
		{
			const result = await tm_getBalance("DOT", smartPayAddress);
			console.log(` ********************************* `); 
			console.log(`SmartPayDashboard|> getBalance_smartPay result: `,result);
			setSmartPay_balance(result);
		}
	}

	const setLiabilitiesThresholds_tm = async (amount) => {
		if (Number(amount)>0)
		{
			const result = await tm_setLiabilitiesThresholds(amount);
			console.log(` ********************************* `);
			console.log(`SmartPayDashboard|> getBalance_tm result: `,result);
			console.log(` ********************************* `);
		}
		else console.log(`SmartPayDashboard|> setLiabilitiesThresholds_tm amount:${amount} is not valid`);
	}

 

	const get_getPriceForPair = async () => {
		const _price = await tm_getPriceForPair();
		setPrice(_price);
	}

	const get_getAveragePriceForPair = async () => {
		const average_price = await tm_getAveragePriceForPair();
		setAveragePrice(average_price);
	}

	const get_pallet_admin = async () => {
		const retrieved_address = await pallet_get_admin();
		setPalletAdminAddress(retrieved_address);
	}

	const get_pallet_smartpay_address = async () => {
		const retrieved_address = await pallet_get_treasury_manager_address();
		setSmartPayAddress(retrieved_address);
	}

	const createSmartPay = async () => {

		if (window.confirm('Creating a fresh SmartPay will overwrite any existing SmartPay.')) {
			await pallet_launchTreasuryManager();
			console.log(`A new SmartPay Contract has been created`);
			get_pallet_smartpay_address();
		} else {
			console.log('SmartPayDashboard:> No new SmartPay was created');
		}

	}

	const depositFundsToSmartPay = async () => {
		if (Number(amountToDepositWithdraw)>0)
		{
			await pallet_depositFundsToTreasuryManager(amountToDepositWithdraw);
		}
		else console.log(`SmartPayDashboard:> depositFundsToSmartPay:> the amount${amountToDepositWithdraw} is not > 0`);
	}

	const withdrawFundsFromSmartPay = async () => {
		if (Number(amountToDepositWithdraw)>0)
		{
			//TODO
			// await pallet_depositFundsToTreasuryManager(amountToDepositWithdraw);
		}
		else console.log(`SmartPayDashboard:> withdrawFundsFromSmartPay:> the amount${amountToDepositWithdraw} is not > 0`);
	}

	const changeAdmin = async () => {
		if (palletAdminAddress!=="")
		{
			if (window.confirm('The will change the admin of the Pallet and the Manager of the Treasury Manager it controls.')) {
				await pallet_setAdminHereAndManagerForTm(palletAdminAddress);
				console.log(`A new SmartPay Admin has been submitted`);
				get_pallet_smartpay_address();
				get_pallet_admin();
			} else {
				console.log('SmartPayDashboard:> No change in admin of SmartPay pallet and Treasury Manager');
			}
		}
		else console.log(`SmartPayDashboard:> the changeAdmin: ${palletAdminAddress} is "" `);
	}

	const enableOverallNotifications = () => {
		setSmartPay_notification_overall_active(true);
		setSmartPay_notification_two_active(false);
		setSmartPay_notification_seven_active(false);
		setSmartPay_notification_thrity_active(false);
	}
	const enable2dayNotifications = () => {
		setSmartPay_notification_overall_active(false);
		setSmartPay_notification_two_active(true);
		setSmartPay_notification_seven_active(false);
		setSmartPay_notification_thrity_active(false);
	}
	const enable7dayNotifications = () => {
		setSmartPay_notification_overall_active(false);
		setSmartPay_notification_two_active(false);
		setSmartPay_notification_seven_active(true);
		setSmartPay_notification_thrity_active(false);
	}
	const enable30dayNotifications = () => {
		setSmartPay_notification_overall_active(false);
		setSmartPay_notification_two_active(false);
		setSmartPay_notification_seven_active(false);
		setSmartPay_notification_thrity_active(true);
	}



	useEffect(() => {
		const getSnapShot = async () => {
			if (blockHeader && blockHeader.number && ((Number(blockHeader.number)%2) ===0) )
			{
				console.log(`updating SmartPayDashboard at Block Number: ${blockHeader.number}`);
				await get_pallet_admin();
				await get_pallet_smartpay_address();
				await get_getPriceForPair();
				await get_getAveragePriceForPair();
				await getLiabilityThresholds_tm();
				await getBalance_pallet();
				await getBalance_smartPay();
				await get_all_liabilities_tm();
			}
		}
		getSnapShot();
	},[blockHeader])


	useEffect(() => {
		if (astar_api) 
		{
			get_pallet_admin();
			get_pallet_smartpay_address();
			get_getPriceForPair();
			get_getAveragePriceForPair();
			getLiabilityThresholds_tm();
			getBalance_pallet();
			getBalance_smartPay();
			get_all_liabilities_tm();
			
			// getLiabilityHealth_tm();
			// getLiabilityInUsdtTokensTreasury_tm();
			// getLiabilityInUsdtTokens_tm();
			// getLiabilityInTreasury_tm();
			// getCheckPointIntervals_tm();

		}
	// },[])
	},[astar_api])  

      


	return(
		<Fragment>
			<div className="row" style={{height:"auto"}}>
				<div className="col-xl-1 col-xxl-4"></div>



				<div className="col-xl-3 col-xxl-8">
					<div className="card"style={{backgroundColor:""}}>
						<div className="card-header border-0 text-center mx-auto pb-0">
							<h4 className="mb-0 fs-24 text-black">Oracle Information</h4>
						</div>
						<div className="card-body text-center fs-16" style={{height:"auto"}}>
							<div  className="bg-gradient-4 coin-holding" style={{height:"80px", marginBottom:"15px", backgroundColor:""}}>
								<div className="col-xl-7 col-xxl-3">
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-3 pt-2">
												<p className="mb-0 op-6" >LIVE DOT PRICE</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-5 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"100%"}}>
												<input type="text" disabled readOnly value = {price} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div  className="bg-gradient-4 coin-holding" style={{height:"80px", marginBottom:"35px", backgroundColor:""}}>
								<div className="col-xl-7 col-xxl-3">
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-3 pt-2">
												<p className="mb-0 op-6" >5 Day AVG DOT Price</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-5 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"100%"}}>
												<input type="text" disabled readOnly value = {averagePrice} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="col-xl-12 col-xxl-3" style={{backgroundColor:""}}>
							<div className="text-center">
								<h4 className="m-4 fs-24 text-black">Alert Information</h4>
							</div>
							</div>
							<div  className="bg-gradient-4 coin-holding text-center" style={{height:"80px", marginBottom:"15px", backgroundColor:""}}>
									<div className="col-xl-7 col-xxl-3">
										<div className="mb-2">
											<div className="align-items-center">
												<div className="ms-3 pt-2">
													<p className="mb-0 op-6" >Level 1 Alert </p>
												</div>
											</div>
										</div>
									</div>
									<div className="col-xl-5 col-xxl-3"  style={{backgroundColor:""}}>
										<div className="mb-2" style={{backgroundColor:""}}> 
											<div className="align-items-center"  style={{backgroundColor:""}}>
												<div className="ms-0 pt-2" style={{backgroundColor:"", width:"100%"}}>
													<input type="text" disabled readOnly value = {`${liabilityThresholds[1]}%`} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
												</div>
											</div>
										</div>
									</div>
								</div>

								<div  className="bg-gradient-4 coin-holding" style={{height:"80px", marginBottom:"15px", backgroundColor:""}}>
									<div className="col-xl-7 col-xxl-3">
										<div className="mb-2">
											<div className="align-items-center">
												<div className="ms-3 pt-2">
													<p className="mb-0 op-6" >Level 2 Alert </p>
												</div>
											</div>
										</div>
									</div>
									<div className="col-xl-5 col-xxl-3"  style={{backgroundColor:""}}>
										<div className="mb-2" style={{backgroundColor:""}}> 
											<div className="align-items-center"  style={{backgroundColor:""}}>
												<div className="ms-0 pt-2" style={{backgroundColor:"", width:"100%"}}>
													<input type="text" disabled readOnly value = {`${liabilityThresholds[0]}%`} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
												</div>
											</div>
										</div>
									</div>
								</div>

								<div  className="bg-gradient-4 coin-holding" style={{height:"80px", marginBottom:"15px", backgroundColor:""}}>
									<div className="col-xl-7 col-xxl-3">
										<div className="mb-2">
											<div className="align-items-center">
												<div className="ms-3 pt-2">
													<p className="mb-0 op-6" >Top Up Level</p>
												</div>
											</div>
										</div>
									</div>
									<div className="col-xl-5 col-xxl-3"  style={{backgroundColor:""}}>
										<div className="mb-2" style={{backgroundColor:""}}> 
											<div className="align-items-center"  style={{backgroundColor:""}}>
												<div className="ms-0 pt-2" style={{backgroundColor:"", width:"100%"}}>
													<input type="text" disabled readOnly value = {`${liabilityThresholds[2]}%`} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>


					</div>
				</div>



				<div className="col-xl-7 col-xxl-8">
					<div className="card"style={{backgroundColor:""}}>
						<div className="card-header border-0 text-center mx-auto pb-0">
							<h4 className="mb-0 fs-24 text-black">SmartPay Setup</h4>
						</div>
						<div className="card-body text-center fs-16" style={{height:"auto"}}>

							<div  className="bg-gradient-1 coin-holding" style={{height:"80px", marginBottom:"15px", backgroundColor:""}}>
								<div className="col-xl-2 col-xxl-3"style={{backgroundColor:""}}>
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-3 pt-2">
												<p className="mb-0 op-6" >Administrator</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-6 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"90%"}}>
												<input type="text" value = {palletAdminAddress} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} 
													onChange={(event) => setPalletAdminAddress(event.target.value)}
												/>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-2 col-xxl-4">
									<button className="btn btn-dark py-3 px-3" style={{height:"", backgroundColor:`${!smartPay_button_active?"grey":"red"}`  }} disabled={!smartPay_button_active} 
									 onClick = { () => changeAdmin()}
									>
										Change Admin
									</button> 

								</div>
								<div className="col-xl-2 col-xxl-3"></div>
							</div>


							<div  className="bg-gradient-1 coin-holding" style={{height:"80px", marginBottom:"15px", backgroundColor:""}}>
								<div className="col-xl-2 col-xxl-3"style={{backgroundColor:""}}>
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-3 pt-2">
												<p className="mb-0 op-6" >SmartPay Address</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-6 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"90%"}}>
												<input type="text" disabled readOnly value = {smartPayAddress} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-2 col-xxl-4">
									<button className="btn btn-dark py-3 px-3" style={{height:"", backgroundColor:`${!smartPay_button_active?"grey":"red"}`  }} disabled={!smartPay_button_active} 
									 onClick = { () => createSmartPay()}
									>
										Create SmartPay
									</button> 

								</div>
								<div className="col-xl-2 col-xxl-4">
									<button className="btn btn-dark py-3 px-3" style={{height:"", backgroundColor:`${!smartPay_button_active?"red":"grey"}` }} disabled={!smartPay_button_active}  
									 onClick = { () => {
										console.log(`Shoudl delete SmartPay if it has not open or pending jobs`);
										get_pallet_admin();
										get_pallet_smartpay_address();
									 }}
									>
										Delete SmartPay
									</button> 
								</div>
								<div className="col-xl-1 col-xxl-3"></div>
							</div>

							<div  className="bg-gradient-1 coin-holding" style={{height:"80px", marginBottom:"15px", marginTop:"95px", backgroundColor:""}}>
								<div className="col-xl-2 col-xxl-3">
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-3 pt-2">
												<p className="mb-0 op-6" >SmartPay Balance (DOT)</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-2 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"80%"}}>
												<input type="text" disabled readOnly value = {smartPay_balance} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-2 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"80%"}}>
												<input type="text"  value = {amountToDepositWithdraw} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }}
													onChange={(event) => setAmountToDepositWithdraw(event.target.value)}
												/>
											</div>
										</div>
									</div>
								</div>


								<div className="col-xl-4 col-xxl-4">
									<button className="btn btn-dark py-3 px-3" style={{width:"30%", backgroundColor:`${!smartPay_button_active?"grey":"red"}`  }} disabled={!smartPay_button_active} 
									 onClick = { () => depositFundsToSmartPay()}
									>
										Deposit
									</button> 

									<button className="btn btn-dark py-3 px-3 mx-4" style={{width:"30%", backgroundColor:`${!smartPay_button_active?"red":"grey"}` }} disabled={smartPay_button_active}  
									 onClick = { () => withdrawFundsFromSmartPay()}
									
									>
										Withdraw
									</button> 
								</div>



								<div className="col-xl-2 col-xxl-3"></div>
							</div>
							<div  className="bg-gradient-4 coin-holding" style={{height:"80px", marginBottom:"15px", backgroundColor:""}}>
								<div className="col-xl-2 col-xxl-3">
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-3 pt-2">
												<p className="mb-0 op-6" >Treasury Balance (DOT)</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-2 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"80%"}}>
												<input type="text" disabled readOnly value = {pallet_balance} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-8 col-xxl-3"></div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="row" style={{height:"auto"}}>
				<div className="col-xl-2 col-xxl-4"></div>


				<div className="col-xl-2 col-xxl-8">
					<div className="card"style={{backgroundColor:""}}>
						<div className="card-header border-0 text-center mx-auto pb-0">
							<h4 className="mb-0 fs-20 text-black">2-Day Liabilities</h4>
						</div>
						<div className="card-body" style={{height:"auto"}}>
							<div  className="bg-gradient-3 coin-holding text-center px-1" style={{height:"80px", marginBottom:"15px", backgroundColor:""}}>
								<div className="col-xl-7 col-xxl-3">
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-0 pt-2">
												<p className="mb-0 op-6" >DOT Denominated Payouts</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-5 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"100%"}}>
												<input type="text" disabled readOnly value = {twoDaysLiabilities[0]} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div  className="bg-gradient-3 coin-holding text-center px-1" style={{height:"80px", marginBottom:"15px", backgroundColor:""}}>
								<div className="col-xl-7 col-xxl-3">
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-0 pt-2">
												<p className="mb-0 op-6" >FIAT Denominated DOT Payouts</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-5 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"100%"}}>
												<input type="text" disabled readOnly value = {twoDaysLiabilities[1]} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div  className="bg-gradient-3 coin-holding text-center px-1" style={{height:"80px", marginBottom:"15px", backgroundColor:""}}>
								<div className="col-xl-7 col-xxl-3">
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-0 pt-2">
												<p className="mb-0 op-6" >Total DOT Payouts</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-5 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"100%"}}>
												<input type="text" disabled readOnly value = {twoDaysLiabilities[2]} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div  className="bg-gradient-3 coin-holding text-center px-1" style={{height:"80px", marginBottom:"40px", backgroundColor:""}}>
								<div className="col-xl-7 col-xxl-3">
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-0 pt-2">
												<p className="mb-0 op-6" >%</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-5 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"100%"}}>
												<input type="text" disabled readOnly value = {twoDaysLiabilities[3]} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
											</div>
										</div>
									</div>
								</div>
							</div>


							<div className="row">
								<div className="col-xl-1 col-xxl-3"></div>
								<div className="col-xl-10 col-xxl-3">
									<div className="card p-2 m-0"style={{backgroundColor:"", height:"auto", width:"100%"}}>
										<div className="card-header border-0 text-center mx-auto pt-2 pb-0">
											<h4 className="mb-2 fs-20 text-black">Notifications</h4>
										</div>
										<div className="card-body p-0" style={{backgroundColor:""}}>
											<div  className="coin-holding text-center align-items-center py-0" style={{backgroundColor:""}}>
												<div className="col-xl-2 col-xxl-4"style={{backgroundColor:""}}></div>
												<div className="col-xl-8 col-xxl-4 pb-2"style={{backgroundColor:""}}>
													<button className="btn btn-dark p-2" style={{height:"", width:"100%", backgroundColor:`${smartPay_notification_two_active?"red":"grey"}`  }}  
													onClick = { () => enable2dayNotifications()}
													>
														Enable
													</button> 

												</div>
												<div className="col-xl-2 col-xxl-4"style={{backgroundColor:""}}></div>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-1 col-xxl-3"></div>
							</div>
						</div>
					</div>
				</div>
				<div className="col-xl-2 col-xxl-8" >
					<div className="card"style={{backgroundColor:""}}>
						<div className="card-header border-0 text-center mx-auto pb-0">
							<h4 className="mb-0 fs-20 text-black">7-Day Liabilities</h4>
						</div>
						<div className="card-body" style={{height:"auto"}}>
							<div  className="bg-gradient-3 coin-holding text-center px-1" style={{height:"80px", marginBottom:"15px", backgroundColor:""}}>
								<div className="col-xl-7 col-xxl-3">
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-0 pt-2">
												<p className="mb-0 op-6" >DOT Denominated Payouts</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-5 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"100%"}}>
												<input type="text" disabled readOnly value = {sevenDaysLiabilities[0]} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div  className="bg-gradient-3 coin-holding text-center px-1" style={{height:"80px", marginBottom:"15px", backgroundColor:""}}>
								<div className="col-xl-7 col-xxl-3">
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-0 pt-2">
												<p className="mb-0 op-6" >FIAT Denominated DOT Payouts</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-5 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"100%"}}>
												<input type="text" disabled readOnly value = {sevenDaysLiabilities[1]} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div  className="bg-gradient-3 coin-holding text-center px-1" style={{height:"80px", marginBottom:"15px", backgroundColor:""}}>
								<div className="col-xl-7 col-xxl-3">
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-0 pt-2">
												<p className="mb-0 op-6" >Total DOT Payouts</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-5 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"100%"}}>
												<input type="text" disabled readOnly value = {sevenDaysLiabilities[2]} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div  className="bg-gradient-3 coin-holding text-center px-1" style={{height:"80px", marginBottom:"40px", backgroundColor:""}}>
								<div className="col-xl-7 col-xxl-3">
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-0 pt-2">
												<p className="mb-0 op-6" >%</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-5 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"100%"}}>
												<input type="text" disabled readOnly value = {sevenDaysLiabilities[3]} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="col-xl-1 col-xxl-3"></div>
								<div className="col-xl-10 col-xxl-3">
									<div className="card p-2 m-0"style={{backgroundColor:"", height:"auto", width:"100%"}}>
										<div className="card-header border-0 text-center mx-auto pt-2 pb-0">
											<h4 className="mb-2 fs-20 text-black">Notifications</h4>
										</div>
										<div className="card-body p-0" style={{backgroundColor:""}}>
											<div  className="coin-holding text-center align-items-center py-0" style={{backgroundColor:""}}>
												<div className="col-xl-2 col-xxl-4"style={{backgroundColor:""}}></div>
												<div className="col-xl-8 col-xxl-4 pb-2"style={{backgroundColor:""}}>
													<button className="btn btn-dark p-2" style={{height:"", width:"100%", backgroundColor:`${smartPay_notification_seven_active?"red":"grey"}`  }} 
													onClick = { () => enable7dayNotifications()}
													>
														Enable
													</button> 

												</div>
												<div className="col-xl-2 col-xxl-4"style={{backgroundColor:""}}></div>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-1 col-xxl-3"></div>
							</div>



						</div>


					</div>
				</div>
				<div className="col-xl-2 col-xxl-8">
					<div className="card"style={{backgroundColor:""}}>
						<div className="card-header border-0 text-center mx-auto pb-0">
							<h4 className="mb-0 fs-20 text-black">30-Day Liabilities</h4>
						</div>
						<div className="card-body" style={{height:"auto"}}>
							<div  className="bg-gradient-3 coin-holding text-center px-1" style={{height:"80px", marginBottom:"15px", backgroundColor:""}}>
								<div className="col-xl-7 col-xxl-3">
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-0 pt-2">
												<p className="mb-0 op-6" >DOT Denominated Payouts</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-5 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"100%"}}>
												<input type="text" disabled readOnly value = {thirtyDaysLiabilities[0]} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div  className="bg-gradient-3 coin-holding text-center px-1" style={{height:"80px", marginBottom:"15px", backgroundColor:""}}>
								<div className="col-xl-7 col-xxl-3">
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-0 pt-2">
												<p className="mb-0 op-6" >FIAT Denominated DOT Payouts</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-5 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"100%"}}>
												<input type="text" disabled readOnly value = {thirtyDaysLiabilities[1]} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div  className="bg-gradient-3 coin-holding text-center px-1" style={{height:"80px", marginBottom:"15px", backgroundColor:""}}>
								<div className="col-xl-7 col-xxl-3">
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-0 pt-2">
												<p className="mb-0 op-6" >Total DOT Payouts</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-5 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"100%"}}>
												<input type="text" disabled readOnly value = {thirtyDaysLiabilities[2]} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div  className="bg-gradient-3 coin-holding text-center px-1" style={{height:"80px", marginBottom:"40px", backgroundColor:""}}>
								<div className="col-xl-7 col-xxl-3">
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-0 pt-2">
												<p className="mb-0 op-6" >%</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-5 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"100%"}}>
												<input type="text" disabled readOnly value = {thirtyDaysLiabilities[3]} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="col-xl-1 col-xxl-3"></div>
								<div className="col-xl-10 col-xxl-3">
									<div className="card p-2 m-0"style={{backgroundColor:"", height:"auto", width:"100%"}}>
										<div className="card-header border-0 text-center mx-auto pt-2 pb-0">
											<h4 className="mb-2 fs-20 text-black">Notifications</h4>
										</div>
										<div className="card-body p-0" style={{backgroundColor:""}}>
											<div  className="coin-holding text-center align-items-center py-0" style={{backgroundColor:""}}>
												<div className="col-xl-2 col-xxl-4"style={{backgroundColor:""}}></div>
												<div className="col-xl-8 col-xxl-4 pb-2"style={{backgroundColor:""}}>
													<button className="btn btn-dark p-2" style={{height:"", width:"100%", backgroundColor:`${smartPay_notification_thirty_active?"red":"grey"}`  }} 
													onClick = { () => enable30dayNotifications()}
													>
														Enable
													</button> 

												</div>
												<div className="col-xl-2 col-xxl-4"style={{backgroundColor:""}}></div>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-1 col-xxl-3"></div>
							</div>
						</div>


					</div>
				</div>
				<div className="col-xl-2 col-xxl-8">
					<div className="card"style={{backgroundColor:""}}>
						<div className="card-header border-0 text-center mx-auto pb-0">
							<h4 className="mb-0 fs-20 text-black">Total Liabilities</h4>
						</div>
						<div className="card-body" style={{height:"auto"}}>
							<div  className="bg-gradient-3 coin-holding text-center px-1" style={{height:"80px", marginBottom:"15px", backgroundColor:""}}>
								<div className="col-xl-7 col-xxl-3">
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-0 pt-2">
												<p className="mb-0 op-6" >DOT Denominated Payouts</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-5 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"100%"}}>
												<input type="text" disabled readOnly value = {overallLiabilities[0]} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div  className="bg-gradient-3 coin-holding text-center px-1" style={{height:"80px", marginBottom:"15px", backgroundColor:""}}>
								<div className="col-xl-7 col-xxl-3">
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-0 pt-2">
												<p className="mb-0 op-6" >FIAT Denominated DOT Payouts</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-5 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"100%"}}>
												<input type="text" disabled readOnly value = {overallLiabilities[1]} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div  className="bg-gradient-3 coin-holding text-center px-1" style={{height:"80px", marginBottom:"15px", backgroundColor:""}}>
								<div className="col-xl-7 col-xxl-3">
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-0 pt-2">
												<p className="mb-0 op-6" >Total DOT Payouts</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-5 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"100%"}}>
												<input type="text" disabled readOnly value = {overallLiabilities[2]} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div  className="bg-gradient-3 coin-holding text-center px-1" style={{height:"80px", marginBottom:"40px", backgroundColor:""}}>
								<div className="col-xl-7 col-xxl-3">
									<div className="mb-2">
										<div className="align-items-center">
											<div className="ms-0 pt-2">
												<p className="mb-0 op-6" >%</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-5 col-xxl-3"  style={{backgroundColor:""}}>
									<div className="mb-2" style={{backgroundColor:""}}> 
										<div className="align-items-center"  style={{backgroundColor:""}}>
											<div className="ms-0 pt-2" style={{backgroundColor:"", width:"100%"}}>
												<input type="text" disabled readOnly value = {overallLiabilities[3]} placeholder="" className="form-control fs-16" style={{color:"white",  textAlign:"center",  }} />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="col-xl-1 col-xxl-3"></div>
								<div className="col-xl-10 col-xxl-3">
									<div className="card p-2 m-0"style={{backgroundColor:"", height:"auto", width:"100%"}}>
										<div className="card-header border-0 text-center mx-auto pt-2 pb-0">
											<h4 className="mb-2 fs-20 text-black">Notifications</h4>
										</div>
										<div className="card-body p-0" style={{backgroundColor:""}}>
											<div  className="coin-holding text-center align-items-center py-0" style={{backgroundColor:""}}>
												<div className="col-xl-2 col-xxl-4"style={{backgroundColor:""}}></div>
												<div className="col-xl-8 col-xxl-4 pb-2"style={{backgroundColor:""}}>
													<button className="btn btn-dark p-2" style={{height:"", width:"100%", backgroundColor:`${smartPay_notification_overall_active?"red":"grey"}`  }}  
													onClick = { () => enableOverallNotifications()}
													>
														Enable
													</button> 

												</div>
												<div className="col-xl-2 col-xxl-4"style={{backgroundColor:""}}></div>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xl-1 col-xxl-3"></div>
							</div>
						</div>
					</div>
				</div>



			</div>

		</Fragment>
	)
}		
export default SmartPay;