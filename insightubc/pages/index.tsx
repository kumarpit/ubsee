import axios, { AxiosError, AxiosInstance } from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v1 as uuidv4 } from 'uuid';
import ApplyInputComponent from '../components/ApplyInputComponent';
import FilterDropdown from '../components/FilterDropdown';
import HorizontalSpacer from '../components/HorizontalSpacer';
import LeafComponent from '../components/LeafComponent';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import NavbarComponent from '../components/NavbarComponent';
import NonLeafComponent from '../components/NonLeafComponent';
import OrderDirDropdown from '../components/OrderDirDropdown';
import Table from '../components/Table';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { State } from '../state/types';
import { getQuery } from '../utils';


const axiosInstance: AxiosInstance = axios.create({
  baseURL: "http://localhost:4321/",
  headers: {'Content-Type': 'application/json'},
})

export default function Home() {

  const [output, setOutput] = useState<any>({columns: [], data: {}});
  const [datasetID, setDatasetID] = useState("sections");
  const [addFilterBtnState, setaddFilterBtnState] = useState(false);
  const [columnsComponents, setColumnsComponents] = useState<any>([]);
  const [orderKeyComponents, setOrderKeyComponents] = useState<any>([]);
  const [applyInputComponents, setApplyInputComponents] = useState<any>([]);
  const [groupKeyComponents, setGroupKeyComponents] = useState<any>([]);
  const [datasetIDs, setDatasetIDs] = useState<Array<string>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [message, setMessage] = useState("");

  const [showWModal, setShowWModal] = useState(false);
  const [showOModal, setShowOModal] = useState(false);
  const [showTModal, setShowTModal] = useState(false);

  const dispatch = useDispatch();

  const {filterComponents, componentTree} = useSelector((state: State) => state.whereState);
  const state = useSelector((state: State) => state);

  useEffect(() => {
    const listDatasets = async() => {
      let response = await axiosInstance.get("datasets");
      let datasetMetadataList:Array<any> = response.data.result;
      let datasetIDs = datasetMetadataList.map( (datasetMetadata) =>
        datasetMetadata.id
      )
      setDatasetIDs(datasetIDs);
    }
    listDatasets().catch((e) => {
      setErrorMessage("Error: Network Error");
    })
    setLoading(false);
  }, [])

  const addFilter = (filter: string, parentId: string) => {
    let component: JSX.Element;
    let id = uuidv4();
    
    if (filter === "GT" || filter === "LT" || filter === "EQ" || filter === "IS") {
      component =  <LeafComponent filter={filter} id={id} parentId={parentId} key={id}/>;  
    } else {
      component = <NonLeafComponent filter={filter} addFilter={addFilter} parentId={parentId} key={id} id={id}/>;
    }

    dispatch({ 
      type: "Add component to tree", 
      payload: {
        component: component
      }
    })

    setaddFilterBtnState(true);
  }

  console.log(state);

  const dispatchState = (value: string, type: string, id: string) => {    
    dispatch({
      type: `Update value for ${type}`,
      payload: {
        id: id,
        type: type,
        value: value 
      }
    })
  }

  const addColumnComponent = () => {
    let id = uuidv4();
    let inputComponent = <input type="text" className="bg-blue-50 m-4 p-2" placeholder="Column key" key={id} id={id} onBlur={(e) => dispatchState(e.target.value, "columnKey", id)}/>
    setColumnsComponents((curr: any) => [...curr, inputComponent]);
  }

  const addOrderKeyComponent = () => {
    let id = uuidv4();
    let inputComponent = <input type="text" className="bg-blue-50 m-4 p-2" id={id} placeholder="Order key" key={id} onBlur={(e) => dispatchState(e.target.value, "orderKey", id)}/>
    setOrderKeyComponents((curr: any) => [...curr, inputComponent]);
    dispatchState("", "orderKey", id);
  }

  const addGroupKeyComponent = () => {
    let id = uuidv4();
    let inputComponent = <input type="text" className="bg-blue-50 m-4 p-2" id={id} placeholder= "Group key" key={id} onBlur={(e) => dispatchState(e.target.value, "groupKey", id)}/>
    setGroupKeyComponents((curr: any) => [...curr, inputComponent]);
  }

  const addApplyInputComponent = () => {
    let id = uuidv4();
    let inputComponent = <ApplyInputComponent id={id} key={id}/>
    setApplyInputComponents((curr: any) => [...curr, inputComponent]);
  }

  const submitQuery = async () => {
    let {whereState, optionState, transformationState} = state;
    let query = getQuery(datasetID, whereState, optionState, transformationState);
    console.log(query);
    
    try{
      let response = await axiosInstance.post("query", query);
      let columns = {}
      console.log(response)
      if(response.data.result.length === 0){
        setMessage("Empty response! Nothing to see here!")
        setErrorMessage("");
        return;
      }
      columns = Object.keys(response.data.result[0]).map((key: any) => {
        return {
          Header: key,
          accessor: key
        }
      })
      setOutput({
        columns: columns,
        data: response.data.result
      })
      setErrorMessage("");
      setMessage("");
    }catch(err: any){
      console.log(err)
      setMessage("");
      setErrorMessage("Error: " + err.response.data.error)
    }
    
  }

  if (loading){
    return <LoadingSpinner/>
  }

  return (

    <div>
      <NavbarComponent datasetIDs={datasetIDs as Array<string>} setFunction={setDatasetID}/>

      <div className="flex flex-col mx-20">
      
      <div style={{height: "20px"}} />
      <div className='flex flex-row items-center'>
        <div>
          <button className="bg-transparent hover::bg-blue-500 text-blue-700 font-semibold py-2 px-4 border border-blue-500 hover:border-transparent rounded"  onClick={() => setShowWModal(true)}>?</button>
          <Modal
              onClose={() => setShowWModal(false)}
              show={showWModal}
              type="WHERE"
          >
          </Modal>
        </div>
        <HorizontalSpacer width={0.2} />
        <label className="font-bold"> WHERE : </label>
      </div>
      <div className="flex flex-col mx-5 my-2">
        <FilterDropdown addFilter={addFilter} addFilterBtnState={addFilterBtnState} key={uuidv4()} id={uuidv4()}/>
        {filterComponents.map(elem => {
          return (
            <div className='flex flex-row'>
              <HorizontalSpacer width={elem[0]} />
              {elem[1]}
            </div> 
          )
        })}
      </div>
      
      <div className='flex flex-row items-center'>
        <div>
        <button className="bg-transparent hover::bg-blue-500 text-blue-700 font-semibold py-2 px-4 border border-blue-500 hover:border-transparent rounded"  onClick={() => setShowOModal(true)}>?</button>
          <Modal
              onClose={() => setShowOModal(false)}
              show={showOModal}
              type="OPTIONS"
          >
          </Modal>
        </div>
        <HorizontalSpacer width={0.2} />
        <label className="font-bold"> OPTIONS : </label>
      </div>
        <div className="flex flex-col mx-5 my-2">
          <div className="flex flex-row items-center">
            <label> COLUMNS : </label>
            <button className="bg-blue-500 m-4 p-2 max-w-xs hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
              onClick = {addColumnComponent}
              >
                  Add Column
              </button>
            {columnsComponents}
          </div>


          { orderKeyComponents.length !== 0 ? <OrderDirDropdown /> : <></> }
          <div className="flex flex-row items-center ">
            <label> ORDER : </label>
            <button className="bg-blue-500 m-4 p-2 max-w-xs hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
              onClick = {addOrderKeyComponent}
              >
                  Add Order Key
              </button>
            {orderKeyComponents}
          </div>
        </div>

        <div className='flex flex-row items-center'>
        <div>
        <button className="bg-transparent hover::bg-blue-500 text-blue-700 font-semibold py-2 px-4 border border-blue-500 hover:border-transparent rounded"  onClick={() => setShowTModal(true)}>?</button>
          <Modal
              onClose={() => setShowTModal(false)}
              show={showTModal}
              type="TRANSFORMATIONS"
          >
          </Modal>
        </div>
        <HorizontalSpacer width={0.2} />
        <label className="font-bold"> TRANSFORMATIONS : </label>
      </div>
        <div className="flex flex-col mx-5 my-2">
          <div className="flex flex-row items-center">
          <label> GROUP : </label>
            <button className="bg-blue-500 m-4 p-2 max-w-xs hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
              onClick = {addGroupKeyComponent}
              >
                  Add Group Key
              </button>
            {groupKeyComponents}
          </div>

          <div className="flex flex-col">
          <label> APPLY : </label>
            <button className="bg-blue-500 m-4 p-2 max-w-xs hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
              onClick = {addApplyInputComponent}
              >
                  Add Apply Key
              </button>
            {applyInputComponents}
          </div>
        </div>    

        <button className="bg-blue-500 my-2 p-2 max-w-xs hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
          onClick={submitQuery}>
          Submit Query
        </button>

        <div className="my-3 text-3xl text-red-600">
          {errorMessage}
        </div>

        <div className="my-3 text-3xl">
          {message}
        </div>


        <div className="output flex outline-black px-5 m-3 h-1/2 my-4">
          
          <Table columns={output.columns} data={output.data}/>
        </div>

      </div>
    </div>
  )
}
