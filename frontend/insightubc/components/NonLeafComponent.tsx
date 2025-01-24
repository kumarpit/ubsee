import React from 'react'
import {useState} from 'react'
import FilterDropdown from './FilterDropdown';
import {v1 as uuidv4} from 'uuid';

interface Props{
    filter: string,
    addFilter: Function,
    id: string,
    parentId: string
}

export default function NonLeafComponent({filter, addFilter, id, parentId}:Props) {

    const [field, setField] = useState("");
    const [fieldValue, setFieldValue] = useState("");
    

  return (
    <div> 
        <label> {filter} : <FilterDropdown addFilter={addFilter} key={id} id={id}/> </label>
    </div>
  )
}

