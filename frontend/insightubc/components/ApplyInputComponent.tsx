import { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { useDispatch } from 'react-redux';
import { v1 as uuidv4 } from 'uuid';


function ApplyInputComponent({id}: {id: string}) {

    const applyTokens = ["MAX", "MIN", "AVG", "SUM", "COUNT"];
    const [token, setToken] = useState("AVG");
    const [applyColumn, setApplyColumn] = useState("");
    const [column, setColumn] = useState("");
    const dispatch = useDispatch();


    const dispatchState = (value: string, type: string) => {
      const payload = {
        type: type,
        value: value,
        id: id
      }

      dispatch({
        type: "Update value for applyInput",
        payload: payload
      })
    }

    const handleSelect = (e: any) => {
        setToken(e);
        dispatchState(e, "applyToken");
    }
    

  return (
    <div className = "flex flex-row w-1/6 justify-between">
        <DropdownButton id="dropdown-basic-button" title={token} onSelect={handleSelect}>
        {applyTokens.map( (applyToken) => {
            return <Dropdown.Item eventKey={applyToken} key={uuidv4()}> {applyToken}</Dropdown.Item>      
        })}
        </DropdownButton>
        <input placeholder="APPLY COLUMN"className="bg-blue-50 m-4 p-2" type="text" onChange={(e)=>setApplyColumn(e.target.value)} onBlur={(e) => dispatchState(e.target.value, "applyColumn")} value={applyColumn}/>
        <input placeholder="COLUMN"className="bg-blue-50 m-4 p-2" type="text" onChange={(e)=>setColumn(e.target.value)} onBlur={(e) => dispatchState(e.target.value, "column")} value={column}/>
    </div>
  )
}

export default ApplyInputComponent
