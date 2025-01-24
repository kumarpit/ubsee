import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import React from 'react';
import { useState } from 'react';
import {v1 as uuidv4} from 'uuid';

interface Props{
    addFilter: Function,
    addFilterBtnState?: boolean
    id: string
}

function FilterDropdown({addFilter, addFilterBtnState = false, id}: Props) {

    const filters = ["GT", "LT", "EQ", "IS", "AND", "OR", "NOT"];
    const [filter, setFilter] = useState("Add Filter");
    const disableBtn = filter === "Add Filter" ? true : false;

    const handleSelect = (e: any) => {
        setFilter(e);
    }
    

  return (
    <div className = "flex flex-row w-1/6 justify-between items-center">
        <DropdownButton disabled={addFilterBtnState} id="dropdown-basic-button" title={filter} onSelect={handleSelect}>
        {filters.map( (filter) => {
            let id = uuidv4();
            return <Dropdown.Item eventKey={filter} key={id} id={id}> {filter}</Dropdown.Item>      
        })}
        </DropdownButton>
        <button className="bg-blue-500 m-4 p-2 max-w-xs hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
        onClick = {() => addFilter(filter, id)}
        disabled = {addFilterBtnState || disableBtn}>
            Add
        </button>
    </div>
    
  )
}

export default FilterDropdown
