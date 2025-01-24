import React from 'react';
import { useState } from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { v1 as uuidv4 } from 'uuid';

function DatasetDropdown({datasetIDs, setFunction}:{datasetIDs: Array<string>, setFunction: Function}) {

    const [dataset, setDataset] = useState("sections");

    const handleSelect = (e: any) => {
        setDataset(e);
        setFunction(e);
    }

    return (
        <div className="m-4">
        <DropdownButton id="dropdown-basic-button" title={dataset} onSelect={handleSelect}>
            {datasetIDs.map( (datasetID) => {
                return <Dropdown.Item eventKey={datasetID} key={uuidv4()}> {datasetID}</Dropdown.Item>      
            })}
        </DropdownButton>
        </div>
    )
}

export default DatasetDropdown
