import React,{Fragment,useContext, useState, useEffect} from 'react';
import loadable from "@loadable/component";
import pMinDelay from "p-min-delay";
import { ThemeContext } from "../../../context/ThemeContext";

import {
  Row,
  Col,
  Card,
  Table,
  Badge,
  Dropdown,
  ProgressBar,
} from "react-bootstrap";
import { Link } from "react-router-dom";

import { tm_getOpenJobIds, tm_getPendingJobsIds, tm_getCompletedJobsIds, tm_getJobInfo } from "../../../Setup";
 


// const CoinChart = loadable(() =>
//   pMinDelay(import("../Boltz/MyWallet/CoinChart"), 1000)
// );

const LiveJobs = ({ astar_api,  blockHeader }) => {
	const { background } = useContext(ThemeContext);
	const [openJobsArray, setOpenJobsArray] = useState([]);
	const [pendingJobsArray, setPendingJobsArray] = useState([]);
	const [completedJobsArray, setCompletedJobsArray] = useState([]);


	const getOpenJobIds_tm = async () => {
		const levelsArray = await tm_getOpenJobIds();

		console.log(`LiveJobs|> getOpenJobIds_tm result: `,levelsArray);  //['1', '2']

		let  _openJobsArray = [];

		for (let i=0; i<levelsArray.length; i++)
		{
				const result = await tm_getJobInfo(levelsArray[i]);
				console.log("===========> result: ",result);  
				_openJobsArray.push(result);
              
		}
		console.log(`LiveJobs|> getOpenJobIds_tm _openJobsArray: `,_openJobsArray);    
		setOpenJobsArray(_openJobsArray);  

	}

	const getPendingJobsIds_tm = async () => {
		const levelsArray = await tm_getPendingJobsIds();

		console.log(" &&&&&&&&&&&&&&&&&&&&&&&&&& ")
		console.log(`LiveJobs|> getPendingJobsIds_tm result: `,levelsArray); 

		let  _pendingJobsArray = [];

		for (let i=0; i<levelsArray.length; i++)
		{
				const result = await tm_getJobInfo(levelsArray[i]);
				console.log("===========> result: ",result);  
				_pendingJobsArray.push(result);
		}
		console.log(`LiveJobs|> getOpenJobIds_tm _pendingJobsArray: `,_pendingJobsArray); 
		setPendingJobsArray(_pendingJobsArray);  
	}

	const getCompletedJobsIds_tm = async () => {
		const levelsArray = await tm_getCompletedJobsIds();

		console.log(" &&&&&&&&&&&&&&&&&&&&&&&&&& ")
		console.log(`LiveJobs|> getCompletedJobsIds_tm result: `,levelsArray);

		let  _completedJobsArray = [];

		for (let i=0; i<levelsArray.length; i++)
		{
				const result = await tm_getJobInfo(levelsArray[i]);
				console.log("===========> result: ",result);  
				_completedJobsArray.push(result);
              
		}
		console.log(`LiveJobs|> getOpenJobIds_tm _completedJobsArray: `,_completedJobsArray); 
		setCompletedJobsArray(_completedJobsArray); 
	}


	useEffect(() => {
		const getSnapShot = async () => {
			if (blockHeader && blockHeader.number && ((Number(blockHeader.number)%2) ===0) )
			{
				console.log(`updating Live jobs at Block Number: ${blockHeader.number}`);
				await getOpenJobIds_tm();
				await getPendingJobsIds_tm();
				await getCompletedJobsIds_tm();
			}
		}
		getSnapShot();
	},[blockHeader])

	useEffect(() => {
		if (astar_api) 
		{
			getOpenJobIds_tm();
			getPendingJobsIds_tm();
			getCompletedJobsIds_tm();
		}
	// },[])
	},[astar_api]) 


	return(
		<Fragment>
			<div className="row">
			<Col lg={12}>
				<Card className="bg-gradient-1 mb-1">
					<Card.Header>
					<p className="fs-24 mb-0" style={{color:"#AEAEAE"}}>Pending Jobs</p>
					</Card.Header>
					<Card.Body className="fs-24 text-center">
					<Table responsive bordered className="verticle-middle table-hover"style={{border:"solid"}}>
						<thead>
						<tr className="text-center" style={{border:"solid"}}>
							<th scope="col" style={{color:"#AEAEAE"}}>Id</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Request</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Payment Type</th>
							<th scope="col" style={{color:"#AEAEAE"}}>First Payment Date</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Payment Token</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Denominated In USD</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Total Amount</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Payee</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Progress</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Status</th>
						</tr>
						</thead>
						<tbody className="fs-16">

						{openJobsArray.map((data,index)=>(	
							<tr  key={index} >
								<td>{data.id}</td>
								<td>{data.title}</td>
								<td>{data.paymentType}</td>
								<td>{data.first_payment_date}</td>
								<td>{data.paymentToken}</td>

								<td>{data.denomnatedinUSD? "Yes" : "No"}</td>
								<td>{data.amount}</td>
								<td>{data.payee}</td>
								<td>
								<ProgressBar now={0} variant="warning" />
								</td>
								<td>
								<Badge variant="warning light">0%</Badge>
								</td>
							</tr>
						))}



						{/* <tr >
							<td>Berlin Polkadot Meetup</td>
							<td>Single Payment</td>
							<td>Apr 19,2023</td>
							<td>DOT</td>
							<td>No</td>
							<td>250</td>
							<td>
							<ProgressBar now={0} variant="warning" />
							</td>
							<td>
							<Badge variant="warning light">0%</Badge>
							</td>
						</tr> */}
						{/* <tr>
							<td>ETH Denver Hackathon Prizes</td>
							<td>Single Payment</td>
							<td>Apr 20,2023</td>
							<td>DOT</td>
							<td>Yes</td>
							<td>25000</td>
							<td>
							<ProgressBar now={0} variant="warning" />
							</td>
							<td>
							<Badge variant="warning light">0%</Badge>
							</td>
						</tr> */}
						{/* <tr>
							<td>Monthly Article Translations</td>
							<td>Interval Payment</td>
							<td>Apr 21,2023</td>
							<td>DOT</td>
							<td>Yes</td>
							<td>100</td>
							<td>
							<ProgressBar now={0} variant="warning" />
							</td>
							<td>
							<Badge variant="warning light">0%</Badge>
							</td>
						</tr> */}

						</tbody>
					</Table>
					</Card.Body>
				</Card>
        	</Col>
		</div>

		<div className="row">
			<Col lg={12}>
				<Card className="bg-gradient-1 mb-1">
					<Card.Header>
					<p className="fs-24 mb-0" style={{color:"#AEAEAE"}}>Live Jobs</p>
					</Card.Header>
					<Card.Body>
					<Table responsive bordered className="verticle-middle table-hover"style={{border:"solid"}}>
						<thead>
						<tr className="text-center" style={{border:"solid"}}>
							<th scope="col" style={{color:"#AEAEAE"}}>Id</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Request</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Payment Type</th>
							<th scope="col" style={{color:"#AEAEAE"}}>First Payment Date</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Payment Token</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Denominated In USD</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Total Amount</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Payee</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Progress</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Status</th>
						</tr>
						</thead>
						<tbody className="fs-16 text-center">

						{pendingJobsArray.map((data,index)=>(	
							<tr  key={index} >
								<td>{data.id}</td>
								<td>{data.title}</td>
								<td>{data.paymentType}</td>
								<td>{data.first_payment_date}</td>
								<td>{data.paymentToken}</td>

								<td>{data.denomnatedinUSD? "Yes" : "No"}</td>
								<td>{data.amount}</td>
								<td>{data.payee}</td>
								<td>
								<ProgressBar now={data.progress} variant="warning" />
								</td>
								<td>
								<Badge variant="warning light">{data.progress}%</Badge>
								</td>
							</tr>
						))}
						
						
						{/* <tr>
							<td>Monthly Ambassador Program</td>
							<td>Interval Payment</td>
							<td>Feb 25,2023</td>
							<td>DOT</td>
							<td>Yes</td>
							<td>500</td>
							<td>
							<ProgressBar now={8.5} variant="warning" />
							</td>
							<td>
							<Badge variant="warning light">8.5%</Badge>
							</td>
						</tr>
						<tr>
							<td>Quarterly Node Management</td>
							<td>Interval Payment</td>
							<td>Feb 26,2023</td>
							<td>DOT</td>
							<td>Yes</td>
							<td>3450</td>
							<td>
							<ProgressBar now={25} variant="warning" />
							</td>
							<td>
							<Badge variant="warning light">25%</Badge>
							</td>
						</tr>
						<tr>
							<td>Monthly Core Dev Payroll</td>
							<td>Interval Payment</td>
							<td>Dec 31,2022</td>
							<td>DOT</td>
							<td>Yes</td>
							<td>34500</td>
							<td>
							<ProgressBar now={17} variant="warning" />
							</td>
							<td>
							<Badge variant="warning light">17%</Badge>
							</td>
						</tr> */}



						</tbody>
						</Table>
					</Card.Body>
				</Card>
        	</Col>
		</div>

		<div className="row">
			<Col lg={12}>
				<Card className="bg-gradient-1 mb-1">
					<Card.Header>
					<p className="fs-24 mb-0" style={{color:"#AEAEAE"}}>Completed Jobs</p>
					</Card.Header>
					<Card.Body>
					<Table responsive bordered className="verticle-middle table-hover"style={{border:"solid"}}>
						<thead>
						<tr className="text-center" style={{border:"solid"}}>
							<th scope="col" style={{color:"#AEAEAE"}}>Id</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Request</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Payment Type</th>
							<th scope="col" style={{color:"#AEAEAE"}}>First Payment Date</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Payment Token</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Denominated In USD</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Total Amount</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Payee</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Progress</th>
							<th scope="col" style={{color:"#AEAEAE"}}>Status</th>
						</tr>
						</thead>
						<tbody className="fs-16 text-center">

						{completedJobsArray.map((data,index)=>(	
							<tr  key={index} >
								<td>{data.id}</td>
								<td>{data.title}</td>
								<td>{data.paymentType}</td>
								<td>{data.first_payment_date}</td>
								<td>{data.paymentToken}</td>

								<td>{data.denomnatedinUSD? "Yes" : "No"}</td>
								<td>{data.amount}</td>
								<td>{data.payee}</td>
								<td>
								<ProgressBar now={data.progress} variant="warning" />
								</td>
								<td>
								<Badge variant="warning light">{data.progress}%</Badge>
								</td>
							</tr>
						))}

 
						{/* <tr>
							<td>Paris Substrate Meetup</td>
							<td>Single Payment</td>
							<td>Feb 10,2023</td>
							<td>DOT</td>
							<td>No</td>
							<td>180</td>
							<td>
							<ProgressBar now={100} variant="warning" />
							</td>
							<td>
							<Badge variant="warning light">100%</Badge>
							</td>
						</tr>
						<tr>
							<td>Chinese Article Translation</td>
							<td>Single Payment</td>
							<td>Feb 12,2023</td>
							<td>DOT</td>
							<td>Yes</td>
							<td>85</td>
							<td>
							<ProgressBar now={100} variant="warning" />
							</td>
							<td>
							<Badge variant="warning light">100%</Badge>
							</td>
						</tr>
						<tr>
							<td>Charity Bike Ride Sponsorship</td>
							<td>Single Payment</td>
							<td>Feb 13,2023</td>
							<td>DOT</td>
							<td>Yes</td>
							<td>250</td>
							<td>
							<ProgressBar now={100} variant="warning" />
							</td>
							<td>
							<Badge variant="warning light">100%</Badge>
							</td>
						</tr> */}
						
						</tbody>
						</Table>
					</Card.Body>
				</Card>
        	</Col>
		</div>



		</Fragment>
	)

}		
export default LiveJobs;