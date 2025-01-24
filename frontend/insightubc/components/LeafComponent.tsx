import React from 'react'
import { useState } from 'react';
import { useDispatch } from 'react-redux';

interface Props{
    filter: string
    id: string
    parentId: string
}

export default function LeafComponent({filter, id}:Props) {

    const [field, setField] = useState("");
    const [fieldValue, setFieldValue] = useState("");
    const dispatch = useDispatch();

    const dispatchState = (e: any, type: string) => {
      dispatch({
        type: "Update value for something",
        payload: {
          id: id,
          type: type,
          value: e
        }
      })
    }

  return (
    <div> 
        <label> {filter} :
        <input type="text" placeholder="field" className="bg-blue-50 m-4 p-2" onChange={(e)=>setField(e.target.value)} onBlur={(e) => dispatchState(e.target.value, "field")} value={field}/>
        <input type= {filter === "IS" ? "text": "number"} placeholder="value" className="bg-blue-50 m-4 p-2"  onChange={(e) => setFieldValue(e.target.value)} onBlur={(e) => dispatchState(e.target.value, "value")} value={fieldValue}/>
        </label>
    </div>
  )
}