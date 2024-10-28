import { useState } from "react";

function Component2() {
    const[clicks,setClicks]=useState(0);
    const handleClick=()=>{
        setClicks(clicks+1);
        console.log(clicks);
    }
    

    return (
      <div>
        <button onClick={handleClick}>點擊次數：{clicks}</button>

      </div>
    )
  }
  
  export default Component2
  