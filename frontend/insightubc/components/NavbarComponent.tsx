import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { v1 as uuidv4 } from 'uuid';
import { useState } from 'react';

function NavbarComponent({datasetIDs, setFunction}:{datasetIDs: Array<string>, setFunction: Function}) {

  const [dataset, setDataset] = useState("sections");

  const handleSelect = (e: any) => {
      setDataset(e);
      setFunction(e);
  }


  return (
    <Navbar bg="light" expand="lg">
      <div className= "flex flex-row px-20" >
        <Navbar.Brand style={{fontSize: "1.5em"}} href="/">InsightUBC</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link  href="https://sites.google.com/view/ubc-cpsc310-22w1/project/">CPSC310</Nav.Link>
            <Nav.Link href="https://github.students.cs.ubc.ca/CPSC310-2022W-T1/project_team126">GitHub</Nav.Link>
            <NavDropdown title={dataset} onSelect={handleSelect} id="basic-nav-dropdown">
              {datasetIDs.map( (datasetID) => {
                  return <NavDropdown.Item eventKey={datasetID} key={uuidv4()}> {datasetID}</NavDropdown.Item>      
              })}
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
}

export default NavbarComponent;