import React, { useContext } from "react";
import {  Switch, Route } from "react-router-dom";
import "./index.css";
import "./chart.css";
import "./step.css";

import Header from "./layouts/nav/Header";
import NAV_NavHade from "./layouts/nav/NavHader";
import NAV_SideBar from "./layouts/nav/SideBar";
import Footer from "./layouts/Footer";

import SmartPayDashboard from "./components/Screens/SmartPayDashboard";
import ApplicationForm from "./components/Screens/Application";
import LiveJobs from "./components/Screens/LiveJobs";
import ReadMe from "./components/Screens/ReadMe";

import { ThemeContext } from "../context/ThemeContext";  
 
const Markup = ( { astar_api, blockHeader, polakdotSignerfunction, polkadtoAccountList, walletConnected,
}) => {

  const { menuToggle } = useContext(ThemeContext);

  let path = window.location.pathname;
  path = path.split("/");
  path = path[path.length - 1];

  let pagePath = path.split("-").includes("page");
  return (
    <>
      <div id={`${!pagePath ? "main-wrapper" : ""}`} className={`${!pagePath ? "show" : "mh100vh"}  ${menuToggle ? "menu-toggle" : ""}`}>

        {!pagePath && <Header 
            walletConnected={walletConnected}
            polakdotSignerfunction={polakdotSignerfunction} 
            polkadtoAccountList={polkadtoAccountList} 
          />}
        {!pagePath && <NAV_NavHade blockHeader={blockHeader} />}
        {!pagePath && <NAV_SideBar />}

        <div className={`${!pagePath ? "content-body" : ""}`} style={{marginBottom:"-50px"}}>
          <div
            className={`${!pagePath ? "container-fluid" : ""}`}
            style={{ minHeight: window.screen.height - 60 }}
          >
            <Switch>
              <Route exact path='/smartpaydashboard'> 
                  <SmartPayDashboard 
                      astar_api={astar_api} blockHeader={blockHeader}
                  /> 
              </Route>
              <Route exact path='/JobApplicationForm'> 
                  <ApplicationForm 
                      astar_api={astar_api} blockHeader={blockHeader}
                  /> 
              </Route>
              <Route exact path='/LiveJobss'> 
 
                  <LiveJobs 
                    astar_api={astar_api} blockHeader={blockHeader}
                  /> 

              </Route>
              <Route exact path='/readme'> <ReadMe/> </Route>
              <Route exact path='/'> <ReadMe/> </Route>

            </Switch> 
          </div>
        </div>
        {!pagePath && <Footer />}
      </div>
    </>
  );
};

export default Markup;