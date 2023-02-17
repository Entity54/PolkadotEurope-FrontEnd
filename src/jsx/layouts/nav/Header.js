import React, { useEffect, useState, useCallback } from 'react'    
import { Dropdown } from "react-bootstrap";
import shibuyalinklogo from './../../../images/shibuyalinklogo.png';


const Header = ({ walletConnected, polakdotSignerfunction, polkadtoAccountList }) => {

	const [dropdowncolor, setDropdowncolor] = useState("#DE5106");
	const [dropdownDisabled, setDropdownDisabled] = useState(true);		
	const [polkadotAccount, setPolkadotAccount] = useState("");
	const [polkadotAccountsDropDown, setPolkadotAccountsDropDown] = useState("");


  useEffect(() => {
      if(walletConnected)
      {
        // setDropdowncolor("white");
        setDropdowncolor("#DE5106");

        setDropdownDisabled(false);
      } else {
        // setDropdowncolor("#DE5106");
        setDropdowncolor("white");

        setDropdownDisabled(true);
      }
  },[walletConnected])


  //#region Polkadot Accounts Drop List
  const refreshPolkadotAccountsList = useCallback ( (tokens) => {
    if (tokens)
    {
      return tokens.map((token, index) => {
        return (
          <Dropdown.Item key={index}  onClick={() => { 
            setPolkadotAccount(token);
            polakdotSignerfunction(token);
            console.log(`Polkadot Account is: ${token}`);
        } }>{token}</Dropdown.Item>
        )
      });
    }
    else return <>Loading data...</> 
  },[polakdotSignerfunction]);

  useEffect(() => {
    setPolkadotAccountsDropDown( refreshPolkadotAccountsList(polkadtoAccountList) );
    console.log("Header polkadtoAccountList=> ",polkadtoAccountList);
    if (polkadtoAccountList.length > 0)
    {
      setPolkadotAccount(polkadtoAccountList[0]);
      polakdotSignerfunction(polkadtoAccountList[0]);
    }

  },[polkadtoAccountList, polakdotSignerfunction, refreshPolkadotAccountsList])


  const polokadotAccountMenu =   (			
    <div className="form-group">
      <div className="input-group input-group-lg">
        <div className="input-group-prepend">
          <Dropdown className="btn-sm rounded pb-1" style={{backgroundColor:"#171622", marginTop:"20px"}}>
          {/* <Dropdown className="weather-btn mb-2" style={{backgroundColor:"#171622", marginTop:"20px"}}> */}
          {/* <Dropdown className="weather-btn mb-2" style={{backgroundColor:"#171622", marginTop:"20px",  border:"1px solid white"}}> */} 

            <Dropdown.Toggle variant="" as="div" className="input-group-text form-control style-2 default-select cursor-pointer" style={{width:"550px", fontSize:"12px", color: dropdowncolor,  backgroundColor:"#171622"}}>
              {/* <span className="fs-22 font-w650 d-flex" style={{color: dropdowncolor,  backgroundColor:"#171622"}}><i className="fa fa-google-wallet">Polkadot</i></span> */}
              <input type="image"style={{width:"130px", height:"35px", marginRight:"40px"}} src={shibuyalinklogo} />

              <span className="fs-14 font-w650 d-flex" style={{color: dropdowncolor, backgroundColor:"#171622", marginRight:"10px"}}>{polkadotAccount? polkadotAccount : "Sign in to Polkadot Extension"}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu style={{height:"200px", width:"550px", overflowY: "scroll", fontSize:"14px"}}>{polkadotAccountsDropDown}</Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </div>
          )


 
  return (
    <div className="header">
      <div className="header-content">
        <nav className="navbar navbar-expand">
          <div className="collapse navbar-collapse justify-content-between">


            <div className="header-left">
            <li className="nav-item">
              <div  style={{ width: "50vw"}}> 
                <div style={{ width: "100v%" }}> 
                </div> 
              </div>
            </li>
            </div>

            <ul className="" style={{backgroundColor:""}}>
                   {polokadotAccountMenu}
            </ul>

          </div>
        </nav>
      </div>
    </div>
  );
};

export default Header;
