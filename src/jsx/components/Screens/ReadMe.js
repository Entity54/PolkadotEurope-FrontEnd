import React,{useState,useContext, useEffect} from 'react';
import { ThemeContext } from "../../../context/ThemeContext";
import PerfectScrollbar from "react-perfect-scrollbar";
import { Link } from "react-router-dom";


const ReadMe = () => {

	const { changeBackground, background } = useContext(ThemeContext);
	
	useEffect(() => {
		changeBackground({ value: "dark", label: "Dark" });

	}, []);

	return(
		<>
			<div className="row">
				<div className="row">
					<div className="col-xl-12">
						<div className="row">

<div className="col-xl-12 col-xxl-6 col-lg-6">

  <div className="card">

	<div className="card-header border-1 pb-4">
	  <h4 className="card-title">Instructions</h4>
	</div>

	<div className="card-body">
	  <PerfectScrollbar
		style={{ height: "auto" }}
		id="DZ_W_TimeLine"
		className="widget-timeline dz-scroll height370 ps ps--active-y"
	  >
		<ul className="timeline">
		  <li>
			<div className="timeline-badge primary"></div>
			<Link
			  className="timeline-panel text-muted"
			  to="/widget-basic"
			>
			  <strong className="text-primary fs-28">SmartPay</strong>.

			  <p className="mb-4 mt-4 text-dark">
			  
			  SmartPay is an application designed to give projects multiple options when making payments from their Treasury accounts.<br/><br/>

SmartPay was born from the real-world problems and inefficiencies that project teams face when making payments that have been approved through their Treasury processes.<br/>

As it currently stands, when an applicant applies for funding from a project Treasury they normally include an estimation of the number of tokens they require to complete their proposal.<br/> This estimation is based on either the current or recent average price of the token against their fiat base currency they need to spend at the time the proposal is submitted.<br/>
There are many fundamental problems with this approach, including:</p>

<p className="m-4">
•	The token/fiat price at the time of submitting the proposal can often be wildly different to the price at the time the proposal is eventually passed and the funds then distributed. If the applicant requires fiat to complete the proposed task this can result in there being either a shortfall or an overpayment of tokens by the treasury to the applicant.<br/>

If there is a shortfall, due to the token/fiat price depreciating during the Treasury approval process, then the applicant often has to submit a follow-up Treasury proposal for a “Top Up” so they have all the fiat funds they originally needed. These “Top Up’ requests are always granted by the Treasury making the process very inefficient.<br/>

If the token/fiat price appreciates during the Treasury approval process, this results in the applicant receiving more fiat than they needed when they finally execute their swap, sometimes considerably more. The Treasury could have saved many tokens if they had the ability to use a more current token/fiat price at the moment of distribution instead.<br/><br/>

•	There are many Treasury proposals whereby the applicant does not require the funds until a date in the future, regardless of how long the Treasury approval process takes. These payments, whether they are either in the native token or a fiat-denominated amount of the native token, can be held in waiting, by the SmartPay smart contracts until the future date, at which point any token/fiat price calculations can be made before automatic distribution.<br/><br/>

•	There are scenarios whereby successful Treasury proposal funds do not need to be transferred to the applicant at all.<br/> A good example of this would be whereby a company applies to organise a hackathon.<br/>

To be efficient, the proposal should ideally be split into two parts, the first being the funds needed to organise the hackathon and the second being the prize monies involved. There is no real reason that the prize money allocations should be transferred to the hackathon organisers at any point. Aside from the trust involved in making this larger type of payment to an organiser (often months before prizes are due), there is also the price volatility problem mentioned above as many Hackathon prizes are denominated in fiat amounts.<br/><br/>

It is entirely possible that some large proposals take advantage of the way the system currently works by hoping for the token/fiat price to appreciate to receive more money than needed, whilst simultaneously using the guaranteed “Top Up” process as a backstop.<br/><br/>


•	There are often times when specialists from different ecosystems can help one another but they don’t wish to receive the native currency of that ecosystem. The SmartPay application also removes this friction by allowing the Treasury proposal to be settled in an alternative token, on a future date, making use of various oracles and a dex.<br/><br/>

•	Smartpay distributions can also take the form of Interval Payments. This is especially useful if an applicant makes a Treasury proposal for ongoing work that involves regular payments.<br/> Examples might include payments for regular articles, translations, meetups etc. Whilst the Treasury would transfer the complete funds to SmartPay upon governance approval, the multiple payments to the applicant would be made on the agreed regular future interval dates and at the prevailing token/fiat price (if they were fiat denominated) at the moment of distribution.<br/>

</p>
<p className="text-dark">
By using the SmartPay system, the project Treasuries have access to the latest information regarding the value of payments to be released on a rolling 2 Day, 7 Day, 30 Day and Total basis.<br/>
By using this approach SmartPay can query the current average price via an oracle to make sure that it can safely meet the fiat denominated distributions for these multiple upcoming time horizons.<br/><br/>

If the system detects an upcoming shortfall on the funds due to be distributed, due to the token/fiat price depreciating in value, a notification is sent to the Treasury to send more funds.<br/> This could be in the form of an automatic expedited Treasury proposal in future versions of SmartPay.<br/>
Conversely, if the tokens held become in excess of the funds to be distributed, due to the token/fiat rate appreciating, a notification can be sent to the Treasury to inform them that excess tokens can be withdrawn back to the Treasury, making the whole Treasury funding process system much more efficient.<br/><br/>

Introducing SmartPay to help manage Treasury approved funding requests, should benefit every project in the ecosystem.<br/>

			  </p>
			</Link>
		  </li>
		</ul>
	  </PerfectScrollbar>
	</div>
  </div>
</div>
</div>


					</div>
				</div>
			</div>	
		</>
	)
}
export default ReadMe;