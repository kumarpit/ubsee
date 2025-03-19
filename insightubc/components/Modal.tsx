import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import reactDOM from 'react-dom';

const WHERE_CONTENT = <>
<p>Each query has three components:</p>
  <ol>
    <li>
      <strong>WHERE</strong> defines the filters you want to apply on the dataset. Choose the dataset you want to query on from the navbar. The following filters are made available: </li>
    <li>Non-logical filters:</li>
    <li><strong>IS</strong>: filter on some string field. Example: <pre>sections_dept: "cpsc"</pre> </li>
    <li><strong>LT</strong>: filter on some math field.</li>
    <li><strong>GT</strong>: filter on some math field.</li>
    <li><strong>EQ</strong>: filtler on some math field</li>
    <br></br>
    <li><p style={{ margin: 0, padding: 0 }}>Logical filters:</p></li>
    <li><strong>AND</strong>: and multiple filters - you must have atleast one filter, and you are able to nest multiple logical filters inside it</li>
    <li><strong>OR</strong>: or multiple filters - again, atleast one filter, multiple filters can be nested</li>
<li><strong>NOT</strong>: not multiple filters - only has one child</li>
  </ol>
</>

const OPTIONS_CONTENT = <>
  <p>Once have your desired filters applied on the dataset, you may want to format the output. We provide two ways to do this:</p>
  <ol>
    <li><strong>COLUMNS</strong> - define what columns you want to displayed as an array of strings</li>
    <li><strong>ORDER</strong> - order the output based on certain fields, this order object is defined as follow: 
    <pre><code className="lang-typescript">
    ORDER: &#123;
        dir: [<span className="hljs-string">"UP"</span> <span className="hljs-keyword">or</span> <span className="hljs-string">"DOWN"</span>],
        keys: [define what keys you want <span className="hljs-keyword">to</span> order <span className="hljs-keyword">on</span> <span className="hljs-keyword">as</span> a <span className="hljs-built_in">list</span> <span className="hljs-keyword">of</span> strings]
    &#125;
  </code></pre>
    </li>
  </ol>
</>;
const TRANSFORMATIONS_CONTENT = <>
  <p>You can transform the query result into groups and apply calculation on each group. 
    <ol>
      <li><strong>GROUP</strong>: group results based on this array of strings</li>
      <li><strong>APPLY</strong>: perform calculations on groups</li>
    </ol>
    
    Let&#39;s say you want to group the results of the query on courses by the instructor name and calculate the avergae for those sections (grouped by instructors). This can be achieved with a transform object of the following form:</p>
    <pre><code className="lang-typescript"><span className="hljs-comment">/*
    This transformations object will group the query results by instructor and calculate the average for each group.
    */</span>
    <span className="hljs-selector-tag">TRANSFORMATIONS</span>: &#123;
    <span className="hljs-attribute">GROUP</span>: [<span className="hljs-string">"sections_instr"</span>],
    APPLY: [&#123;
        <span className="hljs-string">"overallAVG"</span>: &#123;
            <span className="hljs-string">"AVG"</span>: <span className="hljs-string">"sections_avg"</span>
            &#125;    
        &#125;]
    &#125;
</code></pre>
</>;

function Modal({ show, onClose, children, title, type }: any) {
    const [isBrowser, setIsBrowser] = useState(false);

    useEffect(() => {
      setIsBrowser(true);
    }, []);
  
    const handleCloseClick = (e: any) => {
      e.preventDefault();
      onClose();
    };
  
    const modalContent = show ? (
      <StyledModalOverlay>
        <StyledModal>
          <StyledModalHeader>
            <button onClick={handleCloseClick} className="hover:bg-red text-red-700 font-semibold py-1 px-3 border border-red hover:border-transparent rounded" style={{ fontSize: "17px" }}>x</button>
          </StyledModalHeader>
          {title}
          <StyledModalBody>{
            type === "WHERE" ? WHERE_CONTENT :
              type === "OPTIONS" ? OPTIONS_CONTENT :
                type === "TRANSFORMATIONS" ? TRANSFORMATIONS_CONTENT :
                  children
            }
          </StyledModalBody>
        </StyledModal>
      </StyledModalOverlay>
    ) : null;
  
    if (isBrowser) {
      return ReactDOM.createPortal(
        modalContent,
        document.getElementById("modal-root") as any
      );
    } else {
      return null;
    }
};
  
const StyledModalBody = styled.div`
padding: 12px 8px;
margin: 10px;
margin-top: 0;
margin-bottom: 22px;
background: #f5f1ee;
border-radius: 6px;
`;

const StyledModalHeader = styled.div`
display: flex;
justify-content: flex-end;
align-items: center;
font-size: 20px;
padding: 8px 8px;
`;

const StyledModal = styled.div`
background: #fdfdfc;
width: 600px;
height: auto;
padding: 0 10px;
border-radius: 15px;
overflow-y: "scroll";
`;

const StyledModalOverlay = styled.div`
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
display: flex;
justify-content: center;
align-items: center;
background-color: rgba(0, 0, 0, 0.5);
`;

export default Modal;