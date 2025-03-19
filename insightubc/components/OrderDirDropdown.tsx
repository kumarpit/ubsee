import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import React from 'react';
import { useState } from 'react';
import {v1 as uuidv4} from 'uuid';
import { useDispatch } from 'react-redux';


function OrderDirDropdown() {
    const dispatch = useDispatch()
    const dirs = ["UP", "DOWN"]
    const [dir, setDir] = useState("UP");

    const handleSelect = (e: any) => {
        setDir(e);
        
        dispatch({
          type: "Set orderKey direction",
          payload: e
        })
    }
    

  return (
    <div className = "flex flex-row w-1/6 justify-between">
        <DropdownButton id="dropdown-basic-button" title={dir} onSelect={handleSelect}>
        {dirs.map( (dir) => {
            return <Dropdown.Item eventKey={dir} key={uuidv4()}> {dir}</Dropdown.Item>      
        })}
        </DropdownButton>
    </div>
    
  )
}

export default OrderDirDropdown
