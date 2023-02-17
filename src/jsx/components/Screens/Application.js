import React,{Fragment,useContext, useState, useEffect} from 'react';
import loadable from "@loadable/component";
import pMinDelay from "p-min-delay";
import { ThemeContext } from "../../../context/ThemeContext";
import DatePicker  from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


import { pallet_get_treasury_manager_address, pallet_get_admin, pallet_addNewVotedJob, pallet_removeJob, pallet_depositFundsToTreasuryManager } from "../../../Setup";


// const CoinChart = loadable(() =>
//   pMinDelay(import("../Boltz/MyWallet/CoinChart"), 1000)
// );


const MyWallet = () => {
	const { background } = useContext(ThemeContext);

	const [proposalHash, setProposalHash] = useState("");
	
	const [title, setTitle] = useState("");
	const [inputApplicantAddress, setInputApplicantAddress] = useState("");
	const [requestedToken, setRequestedToken] = useState("DOT");
	const [denominatedToken, setDenominatedToken] = useState("DOT");
	const [tokenAmount, setTokenAmount] = useState("");
	const [paymentType, setPaymentType] = useState("OneOff");   // OneOff / Installments
	const [paymentDate, setPaymentDate] = useState(Date.now() + 30000);
	const [payee, setPayee] = useState("");
	const [numOfInstallements, setNumOfInstallements] = useState("");
	const [installmentPeriod, setInstallmentPeriod] = useState("");


	const addNewJob = () => {
		console.log(`addNewJob => inputApplicantAddress: ${inputApplicantAddress} proposalHash: ${proposalHash}
		title: ${title} requestedToken: ${requestedToken} denominatedToken: ${denominatedToken} tokenAmount: ${tokenAmount}
		paymentType: ${paymentType} numOfInstallements: ${numOfInstallements} installmentPeriod: ${installmentPeriod}
		`) 

		// addNewJob => inputApplicantAddress: 0x123 proposalHash: oxabc
		// title: Translation requestedToken: DOT denominatedToken: USDC tokenAmount: 111
		// paymentType: OneOff numOfInstallements: 2 installmentPeriod: 
        
		const paymentDateInMilliseconds = paymentDate;      //Date.now() + 1000;   //1676543500090

	 
		let installmentPeriodMilliseconds = 60000;
		if (installmentPeriod==="Every 1 Minute")
		{
			installmentPeriodMilliseconds = 60000;
		}
		else if (installmentPeriod==="Every 7 Days")
		{
			installmentPeriodMilliseconds = 60000 * 60 * 24 * 7;

		}
		else if (installmentPeriod==="Every 30 Days")
		{
			installmentPeriodMilliseconds =  60000 * 60 * 24 * 30;
			
		}
		else if (installmentPeriod==="Every 90 Days")
		{
			installmentPeriodMilliseconds =  60000 * 60 * 24 * 90;
			
		}
		else if (installmentPeriod==="Every 365 Days")
		{
			installmentPeriodMilliseconds =  60000 * 60 * 24 * 365;
			
		}


		if (
			title!=="" && inputApplicantAddress!=="" && tokenAmount!==""  && payee!=="" && paymentDateInMilliseconds
			&& (paymentType==="OneOff" || (numOfInstallements!=="" && installmentPeriodMilliseconds!==""))
			&& proposalHash!==""
		) 
		{

			const valueInUsd = denominatedToken==="DOT"? false : true;
			const typeofPayment = paymentType==="OneOff"? 0 : 1;
			const payeeAccounts_array = [payee];

			let paymentSchedule_timestamp_array=[];
			if (paymentType==="OneOff")
			{
				paymentSchedule_timestamp_array.push(paymentDateInMilliseconds);
			}
			else 
			{
				for (let i=0; i<=(numOfInstallements-1); i++)
				{
					paymentSchedule_timestamp_array.push(paymentDateInMilliseconds + i * installmentPeriodMilliseconds);
				}
			}
			
			console.log(`paymentDateInMilliseconds: `,paymentDateInMilliseconds);

			pallet_addNewVotedJob(title, proposalHash, inputApplicantAddress, requestedToken, valueInUsd, tokenAmount, 
				typeofPayment, paymentSchedule_timestamp_array, payeeAccounts_array 
			);

		} else console.log(`ApplicationScreen: There is a missign value in addNewJob`);

	}
 

	return(
		<Fragment>
			<div className="col-xl-6 col-lg-12">
				<div className="card bg-gradient-1" style={{backgroundColor:""}}>
					<div className="card-header mt-4">
						<p className="card-title mx-4 fs-28" style={{color:"#AEAEAE"}}>Treasury Application SmartPay Form</p>
					</div>
					<div className="card-body" style={{backgroundColor:""}}>
						<div className="basic-form">
							<form onSubmit={(e) => { e.preventDefault(); addNewJob(); }
							}>
								<div className="row">
									<div className="form-group mx-4 my-2 col-md-6 text-white fs-18">
										<label>Applicant Address</label>
										<input
											type="appaddress"
											className="form-control fs-18"
											placeholder="Your Astar Address"
											value={inputApplicantAddress}
											onChange={(event) => setInputApplicantAddress(event.target.value)}
										/>
									</div>
									<div className="form-group mx-4 my-2 col-md-6 text-white fs-18">
										<label>Treasury Proposal Hash</label>
										<input
											type="appaddress"
											className="form-control fs-18"
											placeholder="Enter your original proposal hash"
											value={proposalHash}
											onChange={(event) => setProposalHash(event.target.value)}
										/>
									</div>
									<div className="form-group mx-4 my-2 col-md-9 text-white fs-18">
										<label>Description</label>
										<input
											type="description"
											className="form-control fs-18"
											placeholder="Describe why you are applying for funds from the Treasury"
											value={title}
											onChange={(event) => setTitle(event.target.value)}
										/>
									</div>
								</div>
								<div className="row">
									<div className="card-header mt-4">
										<p className="card-title mx-2 fs-28" style={{color:"#AEAEAE"}}>SmartPay Settings</p>
									</div>
									<div className="form-group mx-4 mt-3 mb-2 col-md-3 text-white text-center fs-18" style={{width:"20%"}}>
										<label>Requested Token</label>
										<select
											// defaultValue={"option"}
											id="inputState"
											className="form-control text-center fs-18"
											value={requestedToken}
											onChange={(event) => setRequestedToken(event.target.value)}
										>
											<option value="option" disabled>
											Choose...
											</option>
											<option>DOT</option>
											<option>USDT</option>
											<option disabled>ASTR</option>
											<option disabled>GLMR</option>
											<option disabled>ACA</option>
											{/* <option>Option 3</option> */}
										</select>
									</div>
									<div className="form-group mx-4 mt-3 mb-2 col-md-3 text-white text-center fs-18" style={{width:"20%"}}>
										<label>Denominated In</label>
										<select
											// defaultValue={"option"}
											id="inputState"
											className="form-control text-center fs-18"
											value={denominatedToken}
											onChange={(event) => setDenominatedToken(event.target.value)}
										>
											<option value="option" disabled>
											Choose...
											</option>
											<option>DOT</option>
											<option>USDT</option>
											<option disabled>ASTR</option>
											<option disabled>GLMR</option>
											<option disabled>ACA</option>
											{/* <option>ASTR</option> */}
										</select>
									</div>
									<div className="form-group mx-4 mt-3 mb-2 col-md-3 text-white text-center fs-18" style={{width:"20%"}}>
										<label>Token Amount</label>
										<input
											type="Amount"
											className="form-control text-center fs-18"
											placeholder="Amount"
											value={tokenAmount}
											onChange={(event) => setTokenAmount(event.target.value)}
										/>
									</div>
									<div className="form-group mx-4 mt-3 mb-2 col-md-3 text-white text-center fs-18" style={{width:"20%"}}>
										<label>Payment Date</label>
										<DatePicker  className="form-control text-center"
										   value={paymentDate!==""? new Date(paymentDate).toISOString():""}
										   onChange={(newValue) => { 
											// setDate(newValue)
											console.log(`DatePicker >>>>>>>>>>>>> newValue: `,newValue);
											console.log(`DatePicker >>>>>>>>>>>>> newValue: `,newValue.toISOString());
											const given_date_in_milliseconds = Date.parse(newValue.toISOString());
											const now = Date.now();
											let timestamp = given_date_in_milliseconds;
											if (given_date_in_milliseconds <= now)
											{
												timestamp = now+30000
											}
											console.log(`DatePicker >>>>>>>>>>>>> given_date_in_milliseconds: ${given_date_in_milliseconds} now: ${now} timestamp: ${timestamp}`);
											setPaymentDate(timestamp);

										}}
										/> 
									</div>
									<div className="row">
										<div className="col-md-3"></div>
										<div className="form-group mx-4 my-2 col-md-6 text-white text-center fs-18" style={{width:"47%"}}>
											<label>Payee Address</label>
											<input
												type="appaddress"
												className="form-control text-center fs-18"
												placeholder="Astar address of payee"
												value={payee}
												onChange={(event) => setPayee(event.target.value)}
											/>
										</div>
										<div className="col-md-3"></div>
									</div>




									<div className="form-group m-4 col-md-12 text-white fs-22">
										<label>Select the SmartPay type required</label>
										<div className="form-group m-2 d-flex align-items-center fs-18">
											<div className="form-check">
												<input className="form-check-input" type="radio"   name="optiongroup2" id="222" 
													onChange={(event) => setPaymentType("OneOff")}
												/>
												<label className="form-check-label" htmlFor="222">
													Single Future Dated Payment
												</label>
											</div>
											<div className="form-check mx-4">
												<input className="form-check-input" type="radio"  name="optiongroup2" id="223" 
													onChange={(event) => setPaymentType("Installments")}
												/>
												<label className="form-check-label" htmlFor="223">
													Regular Interval Payments
												</label>
											</div>
										</div>
									</div>
								</div>
								<div className="row">
									<div className="form-group mx-4 my-2 col-md-3 text-white text-center fs-18" style={{width:"20%"}}>
										<label>No. Of Payments</label>
										<select
											defaultValue={"option"}
											id="inputState"
											className="form-control text-center fs-18"
											value={numOfInstallements}
											onChange={(event) => setNumOfInstallements(event.target.value)}
										>
											<option value="option" disabled>
											Choose...
											</option>
											<option>1</option>
											<option>2</option>
											<option>3</option>
											<option disabled>4</option>
											<option disabled>5</option>
											<option disabled>6</option>
											<option disabled>7</option>
											<option disabled>8</option>
											<option disabled>9</option>
											<option disabled>10</option>
											<option disabled>11</option>
											<option disabled>12</option>
											<option disabled>52</option>
										</select>
									</div>
									<div className="form-group mx-4 my-2 col-md-3 text-white text-center fs-18" style={{width:"20%"}}>
										<label>Frequency</label>
										<select
											defaultValue={"option"}
											id="inputState"
											className="form-control text-center fs-18"
											value={installmentPeriod}
											onChange={(event) => {
												console.log("===> InstallmentPeriod",event.target.value)
												setInstallmentPeriod(event.target.value);
											}
											}
										>
											<option value="option" disabled>
											Choose...
											</option>
											<option>Every 7 Days</option>
											<option>Every 30 Days</option>
											<option disabled>Every 90 Days</option>
											<option disabled>Every 365 Days</option>
											<option>Every 1 Minute</option>
										</select>
									</div>
								</div>
								<div className="row">
									<div className="form-group m-4 col-md-2">
										<button type="submit" className="btn btn-primary text-center" style={{width:"100%"}}>
											Submit
										</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</Fragment>
	)
}		
export default MyWallet;